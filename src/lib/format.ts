/**
 * Format a price in Indian Rupees using Intl.NumberFormat.
 * Outputs clean "₹22,000" format with proper UTF-8 encoding.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}