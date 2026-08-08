import type { Category } from "../entities/category";
import type { BalanceBucket } from "../enums/balance-bucket";
import type { IncomeSource } from "../enums/income-source";
import type { MonthlyPlanItemKind } from "../enums/monthly-plan-item-kind";
import { FinanceDomainError } from "../errors/finance-domain-error";
import { isDateInsideYearMonth } from "./month";

export interface MonthlyPlanItemRulesInput {
  amountInCents: number;
  bucket: BalanceBucket;
  category: Category | null;
  categoryId: string | null;
  description: string | null;
  expectedOn: string | null;
  incomeSource: IncomeSource | null;
  kind: MonthlyPlanItemKind;
  yearMonth: string;
}

const incomeBucketBySource: Record<IncomeSource, BalanceBucket> = {
  extra_income: "free",
  salary: "free",
  vr: "meal_benefit",
  vt: "transport_benefit",
};

export function validateMonthlyPlanRules(
  yearMonth: string,
  minimumFreeReserveInCents: number,
  items: MonthlyPlanItemRulesInput[],
): void {
  if (!Number.isSafeInteger(minimumFreeReserveInCents) || minimumFreeReserveInCents < 0) {
    throw new FinanceDomainError("Minimum free reserve must be a non-negative integer in cents.");
  }

  for (const item of items) {
    validateMonthlyPlanItemRules(item, yearMonth);
  }
}

function validateMonthlyPlanItemRules(
  item: MonthlyPlanItemRulesInput,
  yearMonth: string,
): void {
  if (!Number.isSafeInteger(item.amountInCents) || item.amountInCents <= 0) {
    throw new FinanceDomainError("Monthly plan items require a positive integer amount in cents.");
  }

  if (item.description !== null && item.description.length > 255) {
    throw new FinanceDomainError("Monthly plan item descriptions must contain at most 255 characters.");
  }

  if (item.expectedOn !== null && !isDateInsideYearMonth(item.expectedOn, yearMonth)) {
    throw new FinanceDomainError("expectedOn must stay inside the selected planning month.");
  }

  if (item.kind === "income") {
    if (item.categoryId !== null || item.category !== null) {
      throw new FinanceDomainError("Income plan items cannot define a category.");
    }

    if (item.incomeSource === null) {
      throw new FinanceDomainError("Income plan items require an income source.");
    }

    if (incomeBucketBySource[item.incomeSource] !== item.bucket) {
      throw new FinanceDomainError("Income plan items must use the bucket that matches the income source.");
    }

    return;
  }

  if (item.categoryId === null || item.category === null) {
    throw new FinanceDomainError("Expense plan items require a valid expense category.");
  }

  if (item.category.kind !== "expense") {
    throw new FinanceDomainError("Monthly expense plan items must use an expense category.");
  }

  if (item.incomeSource !== null) {
    throw new FinanceDomainError("Expense plan items cannot define an income source.");
  }

  if (item.category.expenseNature === "credit_card" && item.bucket !== "free") {
    throw new FinanceDomainError("Credit-card planned expenses must use the free bucket.");
  }
}
