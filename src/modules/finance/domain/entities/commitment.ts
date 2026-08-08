import type { CommitmentType } from "../enums/commitment-type";
import type { BalanceBucket } from "../enums/balance-bucket";

export interface Commitment {
  id: string;
  userId: string;
  type: CommitmentType;
  amountInCents: number;
  dueOn: string;
  description: string | null;
  bucket: BalanceBucket;
  accountId: string | null;
  categoryId: string | null;
  logicalGroupId: string | null;
  installmentCount: number | null;
  installmentNumber: number | null;
  sourceTransactionId: string | null;
  settlementTransactionId: string | null;
  settledAt: string | null;
  createdAt: string;
}
