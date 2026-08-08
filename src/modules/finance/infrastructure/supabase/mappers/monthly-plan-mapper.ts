import type { Database } from "@/lib/supabase/database.types";

import type { MonthlyPlan, MonthlyPlanItem } from "../../../domain/entities/monthly-plan";

type MonthlyPlanRow = Database["public"]["Tables"]["monthly_plans"]["Row"];
type MonthlyPlanItemRow = Database["public"]["Tables"]["monthly_plan_items"]["Row"];

export function mapMonthlyPlanRow(row: MonthlyPlanRow): MonthlyPlan {
  return {
    createdAt: row.created_at,
    id: row.id,
    minimumFreeReserveInCents: row.minimum_free_reserve_in_cents,
    month: row.month,
    notes: row.notes,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

export function mapMonthlyPlanItemRow(row: MonthlyPlanItemRow): MonthlyPlanItem {
  return {
    amountInCents: row.amount_in_cents,
    bucket: row.balance_bucket,
    categoryId: row.category_id,
    createdAt: row.created_at,
    description: row.description,
    expectedOn: row.expected_on,
    expenseNature: row.expense_nature,
    id: row.id,
    incomeSource: row.income_source,
    kind: row.kind,
    monthlyPlanId: row.monthly_plan_id,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}
