const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function formatMonthYear(value: string): string {
  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;
  return `${MONTHS[monthIndex] ?? month} ${year}`;
}

export function formatPeriod(start: string, end: string | null): string {
  const startLabel = formatMonthYear(start);
  const endLabel = end ? formatMonthYear(end) : "Present";
  return `${startLabel} – ${endLabel}`;
}

export function formatIssued(date: string): string {
  return `Issued ${formatMonthYear(date)}`;
}
