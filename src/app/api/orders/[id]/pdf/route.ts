import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, props: Params) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        design: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    
    const endPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Branding / Header
    doc.fontSize(24).font('Helvetica-Bold').text("Morya Designs", { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#666666').text("Documentation & Plot Layout", { align: 'center' });
    doc.moveDown(2);

    // Customer & Order Info
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text("Order Details");
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    doc.text(`Order ID: ${order.invoiceNumber || order.id}`);
    doc.text(`Order Date: ${order.createdAt.toLocaleDateString('en-IN')}`);
    doc.text(`Payment Status: ${order.status}`);
    if (order.razorpayOrderId) doc.text(`Razorpay Order Ref: ${order.razorpayOrderId}`);
    if (order.razorpayPaymentId) doc.text(`Razorpay Payment Ref: ${order.razorpayPaymentId}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text("Customer Details");
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Customer Name: ${session.user.name || "Customer"}`);
    doc.text(`Customer Email: ${order.email}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text("Design Details");
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Design Title: ${order.design.title}`);
    doc.text(`Category: ${order.design.category}`);
    doc.text(`Dimensions: ${order.design.plotWidthFt}x${order.design.plotLengthFt} ft (${order.design.plotAreaSqft} sqft)`);
    doc.text(`Configuration: ${order.design.bhk} BHK, ${order.design.floors} Floors, ${order.design.facing} Facing`);
    doc.text(`Amount Paid: INR ${order.amountInr.toLocaleString('en-IN')}`);
    doc.moveDown(2);

    // Thank you section
    doc.fontSize(12).font('Helvetica-Bold').text("Thank You For Your Purchase!", { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(
      "This document serves as your official receipt and verified plot layout documentation. Please keep it for your records.", 
      { align: 'center' }
    );
    doc.moveDown(1);
    doc.text("Morya Designs © 2026. All rights reserved.", { align: 'center' });

    doc.end();

    const pdfBuffer = await endPromise;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Morya-Designs-Order-${order.id.slice(0, 8).toUpperCase()}.pdf"`,
      }
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
