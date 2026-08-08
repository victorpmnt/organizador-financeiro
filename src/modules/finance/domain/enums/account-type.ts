export const ACCOUNT_TYPES = ["debit", "credit", "vr", "vt"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
