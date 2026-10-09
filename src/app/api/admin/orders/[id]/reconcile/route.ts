import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import { sendOrderDeliveryEmail } from "@/modules/notifications/emails";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, props: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await props.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { design: true }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const paidStatuses: OrderStatus[] = ["PAID", "PROCESSING", "READY", "COMPLETED"];
    if (paidStatuses.includes(order.status)) {
       return NextResponse.json({ message: "Order is already paid" }, { status: 400 });
    }

    if (!order.razorpayOrderId) {
      return NextResponse.json({ error: "No Razorpay Order ID associated with this order" }, { status: 400 });
    }

    // Fetch payments for this order
    const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
    const capturedPayment = payments.items.find(p => p.status === "captured");

    if (!capturedPayment) {
      return NextResponse.json({ error: "No captured payment found for this order on Razorpay" }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const paidOrdersThisYear = await prisma.order.count({
        where: {
          status: { in: paidStatuses },
          createdAt: {
            gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          }
        }
    });
    const invoiceNumber = order.invoiceNumber || `MDF-${currentYear}-${String(paidOrdersThisYear + 1).padStart(4, "0")}`;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        razorpayPaymentId: capturedPayment.id,
        invoiceNumber
      }
    });

    try {
        const invoicePdfBuffer = await generateInvoicePDF(updatedOrder, order.design);
        await sendOrderDeliveryEmail(updatedOrder, order.design, invoicePdfBuffer);
    } catch(err) {
        console.error(err);
    }

    return NextResponse.json({ success: true, message: "Order reconciled successfully", order: updatedOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reconcile order" }, { status: 500 });
  }
}
