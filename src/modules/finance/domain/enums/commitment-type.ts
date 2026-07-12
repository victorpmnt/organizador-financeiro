export const COMMITMENT_TYPES = [
  "credit_card_bill",
  "installment",
  "fixed_bill",
  "reserved_amount",
] as const;

export type CommitmentType = (typeof COMMITMENT_TYPES)[number];
