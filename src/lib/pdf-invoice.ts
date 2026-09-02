import PDFDocument from "pdfkit";
import { Order, Design } from "@prisma/client";

export function generateInvoicePDF(order: Order, design: Design): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text("MORYA DESIGN FIRM", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text("Tax Invoice / Receipt", { align: "center" });
      doc.moveDown(2);

      // Invoice Details
      doc.fontSize(10);
      doc.text(`Invoice Number: ${order.invoiceNumber || "N/A"}`);
      doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
      doc.text(`Order ID: ${order.id}`);
      doc.text(`Payment ID: ${order.razorpayPaymentId || "N/A"}`);
      doc.text(`Customer Email: ${order.email}`);
      doc.moveDown(1.5);

      // Design Details
      doc.fontSize(14).font('Helvetica-Bold').text("Purchase Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Design: ${design.title} (${design.category})`);
      doc.text(`Plot Size: ${design.plotWidthFt}x${design.plotLengthFt} ft`);
      doc.text(`Built-up Area: ${design.builtUpAreaSqft} sqft`);
      doc.text(`BHK: ${design.bhk} | Floors: ${design.floors} | Facing: ${design.facing}`);
      doc.moveDown(2);

      // Pricing
      doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount Paid: INR ${order.amountInr.toLocaleString()}`, { align: "right" });
      
      doc.moveDown(4);
      doc.fontSize(10).font('Helvetica').fillColor("gray").text("Thank you for your business!", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
