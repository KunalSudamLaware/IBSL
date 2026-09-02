import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import { sendOrderDeliveryEmail } from "@/modules/notifications/emails";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Login required" }, { status: 401 });
    }

    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

    // 1. Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { design: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Validate ownership & state
    if (order.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ message: "Order is already paid" });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Verification mismatch: Razorpay Order ID does not match" }, { status: 400 });
    }

    // 3. Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret_for_morya";
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    // Timing-safe signature comparison
    const signatureBuffer = Buffer.from(razorpay_signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    let match = false;
    try {
      match = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      match = false;
    }

    if (!match) {
      console.error("[Verify Payment] Signature mismatch");
      return NextResponse.json({ error: "Invalid signature verification" }, { status: 400 });
    }

    // 4. Verify payment status from Razorpay API
    const isMock = secret.startsWith("mock_");
    if (!isMock) {
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
          return NextResponse.json({ error: `Payment not captured. Current status: ${paymentDetails.status}` }, { status: 400 });
        }
      } catch (err) {
        console.error("Razorpay payment fetch error:", err);
        return NextResponse.json({ error: "Failed to fetch capture status from Razorpay" }, { status: 400 });
      }
    }

    // 5. Generate Invoice Number (e.g. MDF-2026-0001)
    const currentYear = new Date().getFullYear();
    const paidOrdersThisYear = await prisma.order.count({
      where: {
        status: "PAID",
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        }
      }
    });
    
    const invoiceNumber = `MDF-${currentYear}-${String(paidOrdersThisYear + 1).padStart(4, "0")}`;

    // 6. Update order status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        invoiceNumber,
      },
    });

    console.log(`[Verify Payment API] Order ${updatedOrder.id} successfully marked as PAID.`);

    // 7. Trigger Delivery Email Pipeline (Invoice PDF + downloads)
    try {
      const invoicePdfBuffer = await generateInvoicePDF(updatedOrder, order.design);
      await sendOrderDeliveryEmail(updatedOrder, order.design, invoicePdfBuffer);
      console.log(`[Verify Payment API] Delivery email sent for order ${updatedOrder.id}`);
    } catch (err) {
      console.error("[Verify Payment API] Delivery email trigger error:", err);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[Verify Payment API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
