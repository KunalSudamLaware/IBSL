import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import { sendOrderDeliveryEmail } from "@/modules/notifications/emails";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { design: { include: { files: true } } },
    });

    if (!order || order.status !== "PAID") {
      return NextResponse.json({ error: "Order not valid for resend" }, { status: 400 });
    }

    const pdfBuffer = await generateInvoicePDF(order, order.design);
    await sendOrderDeliveryEmail(order, order.design, pdfBuffer);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
