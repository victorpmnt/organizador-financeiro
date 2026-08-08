export const ACCOUNT_TYPES = ["checking", "cash", "credit_card", "investment", "benefit"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

