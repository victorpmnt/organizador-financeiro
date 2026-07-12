export const EXPENSE_NATURES = [
  "fixed",
  "variable",
  "credit_card",
  "investment",
] as const;

export type ExpenseNature = (typeof EXPENSE_NATURES)[number];
