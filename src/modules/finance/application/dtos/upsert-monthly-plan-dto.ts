import type { BalanceBucket } from "../../domain/enums/balance-bucket";
import type { IncomeSource } from "../../domain/enums/income-source";
import type { MonthlyPlanItemKind } from "../../domain/enums/monthly-plan-item-kind";

export interface UpsertMonthlyPlanItemDto {
  amountInCents: number;
  bucket: BalanceBucket;
  categoryId: string | null;
  description: string | null;
  expectedOn: string | null;
  incomeSource: IncomeSource | null;
  kind: MonthlyPlanItemKind;
}
