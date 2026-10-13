/**
 * Format a price in Indian Rupees using Intl.NumberFormat.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format file types to user-friendly labels.
 */
export function formatFileType(fileType: string | undefined | null): string {
  if (!fileType) return "Unknown Format";
  switch (fileType.toUpperCase()) {
    case "THREE_D":
      return "3D Model";
    case "DWG":
      return "AutoCAD DWG";
    case "PDF":
      return "PDF";
    default:
      return fileType;
  }
}

/**
 * Format plot dimensions into a standardized format.
 */
export function formatPlotSize(width: number | undefined | null, length: number | undefined | null): string {
  if (width == null || length == null) return "Unknown Size";
  return width + " × " + length + " ft";
}
