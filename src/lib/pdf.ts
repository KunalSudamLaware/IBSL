/**
 * PDF utility helpers.
 *
 * This module provides a foundation for PDF-related operations
 * such as receipt/invoice generation. Extend with a library like
 * `@react-pdf/renderer` or `pdfkit` as needed.
 */

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  currency: string;
  paidAt: Date;
}

/**
 * Generates a simple text-based invoice representation.
 * Replace with a proper PDF library for production use.
 */
export function generateInvoiceText(data: InvoiceData): string {
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const itemLines = data.items
    .map(
      (item) =>
        `  ${item.name} x${item.quantity} @ ${data.currency} ${item.unitPrice.toFixed(2)}`
    )
    .join("\n");

  return [
    `Invoice: ${data.invoiceNumber}`,
    `Date: ${data.paidAt.toISOString()}`,
    `Customer: ${data.customerName} (${data.customerEmail})`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Total: ${data.currency} ${total.toFixed(2)}`,
  ].join("\n");
}
