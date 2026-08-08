import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Transaction } from "../../domain/entities/transaction";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";
import type { AccountRepository } from "../ports/account-repository";
import type { CategoryRepository } from "../ports/category-repository";
import type { TransactionRepository } from "../ports/transaction-repository";

export interface CreateImmediateExpenseInput {
  accountId: string;
  amountInCents: number;
  categoryId: string;
  description: string | null;
  occurredOn: string;
}

export class CreateImmediateExpense {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: CreateImmediateExpenseInput): Promise<Transaction> {
    const user = await this.requireAuthenticatedUser.execute();
    const [account, category] = await Promise.all([
      this.accountRepository.findByIdForUser(input.accountId, user.id),
      this.categoryRepository.findByIdForUser(input.categoryId, user.id),
    ]);

    if (!account) {
      throw new FinanceDomainError("The selected account was not found.");
    }

    if (!category) {
      throw new FinanceDomainError("The selected category was not found.");
    }

    if (account.accountType === "credit_card") {
      throw new FinanceDomainError("Credit-card accounts cannot be used for immediate expenses.");
    }

    if (category.kind !== "expense" || !category.expenseNature) {
      throw new FinanceDomainError("Immediate expenses require an expense category.");
    }

    if (category.expenseNature === "credit_card") {
      throw new FinanceDomainError("Credit-card purchases must use the dedicated credit flow.");
    }

    if (input.amountInCents <= 0) {
      throw new FinanceDomainError("Amount must be greater than zero.");
    }

    return this.transactionRepository.create({
      accountId: account.id,
      amountInCents: input.amountInCents,
      bucket: account.bucket,
      categoryId: category.id,
      description: input.description?.trim() || null,
      direction: "expense",
      expenseNature: category.expenseNature,
      incomeSource: null,
      occurredOn: input.occurredOn,
      userId: user.id,
    });
  }
}
