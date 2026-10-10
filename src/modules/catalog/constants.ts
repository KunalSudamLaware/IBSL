export const BHK_OPTIONS = [
  { value: "1", label: "1 BHK", shortLabel: "1 BHK" },
  { value: "2", label: "2 BHK", shortLabel: "2 BHK" },
  { value: "3", label: "3 BHK", shortLabel: "3 BHK" },
  { value: "4", label: "4 BHK", shortLabel: "4 BHK" },
  { value: "5+", label: "5+ BHK", shortLabel: "5+ BHK" },
] as const;

export const FLOOR_OPTIONS = [
  { value: "1", label: "1 Floor (Ground / G)" },
  { value: "2", label: "2 Floors (G+1)" },
  { value: "3", label: "3 Floors (G+2)" },
  { value: "4+", label: "4+ Floors" },
] as const;

export const CATEGORY_OPTIONS = [
  "House Plan",
  "Villa",
  "Duplex",
  "Bungalow",
  "Traditional",
  "Contemporary",
] as const;

export const STYLE_OPTIONS = [
  "Modern",
  "Vastu",
  "Traditional",
  "Contemporary",
  "Minimalist",
  "Luxury",
  "Budget",
  "Compact",
  "Spacious",
  "Courtyard",
  "Eco-friendly",
  "Urban",
] as const;

export const FACING_OPTIONS = [
  { value: "N", label: "North Facing" },
  { value: "E", label: "East Facing" },
  { value: "S", label: "South Facing" },
  { value: "W", label: "West Facing" },
] as const;

/**
 * Normalizes string or array query parameter into a clean trimmed array of strings
 */
export function parseArrayParam(param: unknown): string[] {
  if (!param) return [];
  if (Array.isArray(param)) {
    return param
      .map(String)
      .flatMap((s) => s.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return String(param)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parses and sanitizes a positive integer (handles arrays as well)
 */
export function parsePositiveInt(val: unknown): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (Array.isArray(val)) {
    return parsePositiveInt(val[0]);
  }
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && num >= 0 ? Math.floor(num) : undefined;
}
