export function getCurrentYearMonth(timeZone = "America/Sao_Paulo") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve the current year-month.");
  }

  return `${year}-${month}`;
}
