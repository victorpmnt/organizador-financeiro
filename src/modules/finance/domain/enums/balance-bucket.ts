export const BALANCE_BUCKETS = ["free", "meal_benefit", "transport_benefit"] as const;

export type BalanceBucket = (typeof BALANCE_BUCKETS)[number];
