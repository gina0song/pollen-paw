// Format date components into ISO 8601 date string (YYYY-MM-DD)
export function formatDate(year: number, month: number, day: number): string {
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

// Format date object from API response to ISO 8601 string
export function formatApiDate(dateObj: {
  year: number;
  month: number;
  day: number;
}): string {
  return formatDate(dateObj.year, dateObj.month, dateObj.day);
}

// Validate if a date string is in correct ISO 8601 format (YYYY-MM-DD)
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateString);
}