import type { Commitment } from "../../domain/entities/commitment";
import type { Transaction } from "../../domain/entities/transaction";

export interface CreateCreditCardPurchaseRecord {
  accountId: string;
  amountInCents: number;
  categoryId: string;
  description: string | null;
  installmentCount: number;
  occurredOn: string;
}

export interface PayCommitmentsRecord {
  commitmentIds: string[];
  description: string | null;
  occurredOn: string;
  payingAccountId: string;
}

export interface CommitmentMutationResult {
  commitments: Commitment[];
  transaction: Transaction;
}

export interface CommitmentRepository {
  createCreditCardPurchase(
    input: CreateCreditCardPurchaseRecord,
  ): Promise<CommitmentMutationResult>;
  listOpenByUser(userId: string): Promise<Commitment[]>;
  payCommitments(input: PayCommitmentsRecord): Promise<CommitmentMutationResult>;
}
