import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { CommitmentMutationResult, CommitmentRepository } from "../ports/commitment-repository";
import type { AccountRepository } from "../ports/account-repository";
import type { CategoryRepository } from "../ports/category-repository";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";

export interface CreateCreditCardPurchaseInput {
  accountId: string;
  amountInCents: number;
  categoryId: string;
  description: string | null;
  installmentCount: number;
  occurredOn: string;
}

export class CreateCreditCardPurchase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: CreateCreditCardPurchaseInput): Promise<CommitmentMutationResult> {
    const user = await this.requireAuthenticatedUser.execute();
    const account = await this.accountRepository.findByIdForUser(input.accountId, user.id);

    if (!account) {
      throw new FinanceDomainError("The selected credit account was not found.");
    }

    if (account.accountType !== "credit") {
      throw new FinanceDomainError("Credit card purchases require a credit account.");
    }

    const category = await this.categoryRepository.findByIdForUser(input.categoryId, user.id);

    if (!category || category.kind !== "expense") {
      throw new FinanceDomainError("Credit card purchases require an expense category.");
    }

    if (!Number.isSafeInteger(input.amountInCents) || input.amountInCents <= 0) {
      throw new FinanceDomainError("Amount must be a positive integer in cents.");
    }

    if (
      !Number.isSafeInteger(input.installmentCount) ||
      input.installmentCount < 1 ||
      input.installmentCount > 60
    ) {
      throw new FinanceDomainError("Installment count must be between 1 and 60.");
    }

    return this.commitmentRepository.createCreditCardPurchase({
      ...input,
      description: input.description?.trim() || null,
    });
  }
}
