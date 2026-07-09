/** "2026-06" or full ISO timestamp → "Jun 2026" */
export function formatMonth(isoDate) {
  const date = new Date(
    isoDate.length === 7 ? `${isoDate}-01T00:00:00` : isoDate
  );
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}
