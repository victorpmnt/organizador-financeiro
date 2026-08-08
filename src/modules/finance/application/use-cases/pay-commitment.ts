import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { CommitmentMutationResult, CommitmentRepository } from "../ports/commitment-repository";
import type { AccountRepository } from "../ports/account-repository";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";

export interface PayCommitmentInput {
  commitmentIds: string[];
  description: string | null;
  occurredOn: string;
  payingAccountId: string;
}

export class PayCommitment {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: PayCommitmentInput): Promise<CommitmentMutationResult> {
    const user = await this.requireAuthenticatedUser.execute();
    const payingAccount = await this.accountRepository.findByIdForUser(input.payingAccountId, user.id);

    if (!payingAccount) {
      throw new FinanceDomainError("The selected paying account was not found.");
    }

    if (payingAccount.accountType === "credit" || payingAccount.bucket !== "free") {
      throw new FinanceDomainError(
        "Credit card payments must use a non-credit account in the free bucket.",
      );
    }

    const uniqueCommitmentIds = [...new Set(input.commitmentIds)];

    if (uniqueCommitmentIds.length === 0) {
      throw new FinanceDomainError("At least one commitment must be selected.");
    }

    return this.commitmentRepository.payCommitments({
      commitmentIds: uniqueCommitmentIds,
      description: input.description?.trim() || null,
      occurredOn: input.occurredOn,
      payingAccountId: input.payingAccountId,
    });
  }
}
