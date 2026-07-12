export const INCOME_SOURCES = ["salary", "vr", "vt", "extra_income"] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];
