import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import { sendOrderDeliveryEmail } from "@/modules/notifications/emails";

export async function POST(req: Request) {
  try {
    // Read the raw body as text for HMAC validation
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("[Razorpay Webhook] Missing signature or secret");
      return NextResponse.json({ error: "Invalid configuration or headers" }, { status: 400 });
    }

    // Verify the Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[Razorpay Webhook] Invalid signature match");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process payment captured events
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // 1. Idempotency Check: Verify if this payment has already been processed
      const existingProcessedOrder = await prisma.order.findUnique({
        where: { razorpayPaymentId },
      });

      if (existingProcessedOrder) {
        console.log(`[Razorpay Webhook] Payment ${razorpayPaymentId} already processed. Skipping.`);
        return NextResponse.json({ status: "ok", message: "Already processed" }, { status: 200 });
      }

      // 2. Fetch the PENDING order by Razorpay's order_id
      const pendingOrder = await prisma.order.findUnique({
        where: { razorpayOrderId },
        include: { design: true },
      });

      if (!pendingOrder) {
        console.error(`[Razorpay Webhook] Order ${razorpayOrderId} not found in DB.`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // 3. Generate Sequential Invoice Number (e.g. MDF-2026-0001)
      const currentYear = new Date().getFullYear();
      
      // Determine the next invoice number safely within a transaction or simple count
      const paidOrdersThisYear = await prisma.order.count({
        where: {
          status: "PAID",
          createdAt: {
            gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          }
        }
      });
      
      const invoiceNumber = `MDF-${currentYear}-${String(paidOrdersThisYear + 1).padStart(4, "0")}`;

      // 4. Update the order status to PAID and attach the payment ID & invoice
      const updatedOrder = await prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          status: "PAID",
          razorpayPaymentId,
          invoiceNumber,
        },
      });

      console.log(`[Razorpay Webhook] Order ${updatedOrder.id} successfully marked as PAID (Invoice: ${invoiceNumber}).`);

      // 5. Generate PDF Invoice & Trigger Resend Email Pipeline
      try {
        const invoicePdfBuffer = await generateInvoicePDF(updatedOrder, pendingOrder.design);
        await sendOrderDeliveryEmail(updatedOrder, pendingOrder.design, invoicePdfBuffer);
        console.log(`[Razorpay Webhook] Delivery email & Invoice sent to ${updatedOrder.email}`);
      } catch (err) {
        // Log but don't fail the webhook response, since payment was captured successfully
        console.error(`[Razorpay Webhook] Failed to send email for order ${updatedOrder.id}:`, err);
      }
      
      return NextResponse.json({ status: "ok", invoiceNumber }, { status: 200 });
    }

    // Acknowledge other events (like payment.failed, order.paid, etc) without processing
    return NextResponse.json({ status: "ignored" }, { status: 200 });

  } catch (error) {
    console.error("[Razorpay Webhook] Internal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
