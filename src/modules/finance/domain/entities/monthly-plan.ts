import type { BalanceBucket } from "../enums/balance-bucket";
import type { ExpenseNature } from "../enums/expense-nature";
import type { IncomeSource } from "../enums/income-source";
import type { MonthlyPlanItemKind } from "../enums/monthly-plan-item-kind";

export interface MonthlyPlan {
  id: string;
  userId: string;
  month: string;
  minimumFreeReserveInCents: number;
  notes: string | null;
  createdAt: string;
}

export interface MonthlyPlanItem {
  id: string;
  userId: string;
  monthlyPlanId: string;
  kind: MonthlyPlanItemKind;
  bucket: BalanceBucket;
  amountInCents: number;
  categoryId: string | null;
  incomeSource: IncomeSource | null;
  expenseNature: ExpenseNature | null;
  description: string | null;
  expectedOn: string | null;
  createdAt: string;
}
