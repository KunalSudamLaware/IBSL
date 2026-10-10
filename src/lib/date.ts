export const PROJECT_TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's date formatted as "YYYY-MM-DD" in the specified timezone (defaults to Asia/Kolkata).
 * Ensures consistency across timezones and avoids UTC offset shift bugs.
 */
export function getProjectTodayDateString(timeZone: string = PROJECT_TIMEZONE): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Validates whether a date string (YYYY-MM-DD) is today or a future date in the project timezone.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateConsultationDate(
  dateStr?: string | null,
  timeZone: string = PROJECT_TIMEZONE
): { valid: boolean; error?: string } {
  if (!dateStr || !dateStr.trim()) {
    return { valid: true }; // Date is optional
  }

  const trimmed = dateStr.trim();
  const datePartMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!datePartMatch) {
    return {
      valid: false,
      error: "Please enter a valid date in YYYY-MM-DD format.",
    };
  }

  const datePart = datePartMatch[1];
  const todayStr = getProjectTodayDateString(timeZone);

  // Check if date is strictly before today in project timezone
  if (datePart < todayStr) {
    return {
      valid: false,
      error: "Preferred consultation date cannot be in the past. Please select today or a future date.",
    };
  }

  // Also verify that the date string represents a valid calendar date
  const [year, month, day] = datePart.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return {
      valid: false,
      error: "The selected date is not a valid calendar date.",
    };
  }

  return { valid: true };
}
