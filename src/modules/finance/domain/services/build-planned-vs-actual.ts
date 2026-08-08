import type {
  PlannedVsActualExpenseItemDto,
  PlannedVsActualIncomeItemDto,
  PlannedVsActualOverviewDto,
} from "../../application/dtos/planned-vs-actual-dto";
import type { Category } from "../entities/category";
import type { MonthlyPlanItem } from "../entities/monthly-plan";
import type { Transaction } from "../entities/transaction";

interface BuildPlannedVsActualInput {
  categories: Category[];
  planItems: MonthlyPlanItem[];
  settledTransactionIds: Set<string>;
  transactionsInMonth: Transaction[];
  yearMonth: string;
}

function pushIncomeActuals(
  totals: Map<string, Omit<PlannedVsActualIncomeItemDto, "varianceInCents">>,
  transactions: Transaction[],
): void {
  for (const transaction of transactions) {
    if (transaction.direction !== "income" || transaction.incomeSource === null) {
      continue;
    }

    const key = `${transaction.bucket}:${transaction.incomeSource}`;
    const current = totals.get(key);

    if (current) {
      current.actualInCents += transaction.amountInCents;
      continue;
    }

    totals.set(key, {
      actualInCents: transaction.amountInCents,
      bucket: transaction.bucket,
      incomeSource: transaction.incomeSource,
      key,
      plannedInCents: 0,
    });
  }
}

function pushExpenseActuals(
  totals: Map<string, Omit<PlannedVsActualExpenseItemDto, "varianceInCents">>,
  transactions: Transaction[],
  categoriesById: Map<string, Category>,
  settledTransactionIds: Set<string>,
): void {
  for (const transaction of transactions) {
    if (
      transaction.direction !== "expense" ||
      transaction.categoryId === null ||
      settledTransactionIds.has(transaction.id)
    ) {
      continue;
    }

    const key = `${transaction.bucket}:${transaction.categoryId}`;
    const category = categoriesById.get(transaction.categoryId);
    const current = totals.get(key);

    if (current) {
      current.actualInCents += transaction.amountInCents;
      continue;
    }

    totals.set(key, {
      actualInCents: transaction.amountInCents,
      bucket: transaction.bucket,
      categoryId: transaction.categoryId,
      categoryName: category?.name ?? null,
      expenseNature: category?.expenseNature ?? null,
      key,
      plannedInCents: 0,
    });
  }
}

export function buildPlannedVsActual({
  categories,
  planItems,
  settledTransactionIds,
  transactionsInMonth,
  yearMonth,
}: BuildPlannedVsActualInput): PlannedVsActualOverviewDto {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const incomeTotals = new Map<string, Omit<PlannedVsActualIncomeItemDto, "varianceInCents">>();
  const expenseTotals = new Map<string, Omit<PlannedVsActualExpenseItemDto, "varianceInCents">>();

  for (const item of planItems) {
    if (item.kind === "income" && item.incomeSource !== null) {
      const key = `${item.bucket}:${item.incomeSource}`;
      const current = incomeTotals.get(key);

      if (current) {
        current.plannedInCents += item.amountInCents;
        continue;
      }

      incomeTotals.set(key, {
        actualInCents: 0,
        bucket: item.bucket,
        incomeSource: item.incomeSource,
        key,
        plannedInCents: item.amountInCents,
      });
      continue;
    }

    if (item.kind === "expense" && item.categoryId !== null) {
      const key = `${item.bucket}:${item.categoryId}`;
      const category = categoriesById.get(item.categoryId);
      const current = expenseTotals.get(key);

      if (current) {
        current.plannedInCents += item.amountInCents;
        continue;
      }

      expenseTotals.set(key, {
        actualInCents: 0,
        bucket: item.bucket,
        categoryId: item.categoryId,
        categoryName: category?.name ?? null,
        expenseNature: category?.expenseNature ?? null,
        key,
        plannedInCents: item.amountInCents,
      });
    }
  }

  pushIncomeActuals(incomeTotals, transactionsInMonth);
  pushExpenseActuals(expenseTotals, transactionsInMonth, categoriesById, settledTransactionIds);

  const incomeItems = Array.from(incomeTotals.values())
    .map((item) => ({
      ...item,
      varianceInCents: item.actualInCents - item.plannedInCents,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  const expenseItems = Array.from(expenseTotals.values())
    .map((item) => ({
      ...item,
      varianceInCents: item.actualInCents - item.plannedInCents,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  const plannedIncomeInCents = incomeItems.reduce((sum, item) => sum + item.plannedInCents, 0);
  const receivedIncomeInCents = incomeItems.reduce((sum, item) => sum + item.actualInCents, 0);
  const plannedExpenseInCents = expenseItems.reduce((sum, item) => sum + item.plannedInCents, 0);
  const consumedExpenseInCents = expenseItems.reduce((sum, item) => sum + item.actualInCents, 0);

  return {
    consumedExpenseInCents,
    expenseItems,
    expenseVarianceInCents: consumedExpenseInCents - plannedExpenseInCents,
    incomeItems,
    incomeVarianceInCents: receivedIncomeInCents - plannedIncomeInCents,
    plannedExpenseInCents,
    plannedIncomeInCents,
    receivedIncomeInCents,
    yearMonth,
  };
}
