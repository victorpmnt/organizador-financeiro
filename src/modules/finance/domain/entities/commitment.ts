import type { CommitmentType } from "../enums/commitment-type";

export interface Commitment {
  id: string;
  userId: string;
  type: CommitmentType;
  amountInCents: number;
  dueOn: string;
  description: string | null;
  settledAt: string | null;
  createdAt: string;
}
