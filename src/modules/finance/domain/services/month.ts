import { FinanceDomainError } from "../errors/finance-domain-error";

export interface MonthRange {
  endDate: string;
  monthDate: string;
  startDate: string;
}

export function resolveMonthRange(yearMonth: string): MonthRange {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);

  if (!match) {
    throw new FinanceDomainError("yearMonth must use the YYYY-MM format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new FinanceDomainError("yearMonth must use a valid calendar month.");
  }

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthText = String(month).padStart(2, "0");

  return {
    endDate: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    monthDate: `${year}-${monthText}-01`,
    startDate: `${year}-${monthText}-01`,
  };
}

export function isDateInsideYearMonth(value: string, yearMonth: string): boolean {
  const { endDate, startDate } = resolveMonthRange(yearMonth);

  return value >= startDate && value <= endDate;
}
