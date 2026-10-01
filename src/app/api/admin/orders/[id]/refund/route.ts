import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order || order.status !== "PAID" || !order.razorpayPaymentId) {
      return NextResponse.json({ error: "Order not valid for refund" }, { status: 400 });
    }

    // Call Razorpay API to issue the refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      speed: "normal",
      notes: {
        reason: "Admin initiated refund",
      }
    });

    if (!refund || refund.status !== "processed") {
      throw new Error("Refund failed at gateway");
    }

    // Update internal database status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
