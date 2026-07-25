export const MONTHLY_PLAN_ITEM_KINDS = ["income", "expense"] as const;

export type MonthlyPlanItemKind = (typeof MONTHLY_PLAN_ITEM_KINDS)[number];
