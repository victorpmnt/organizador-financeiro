import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Transaction } from "../../domain/entities/transaction";
import type { IncomeSource } from "../../domain/enums/income-source";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";
import type { AccountRepository } from "../ports/account-repository";
import type { TransactionRepository } from "../ports/transaction-repository";

export interface CreateIncomeEntryInput {
  accountId: string;
  amountInCents: number;
  description: string | null;
  incomeSource: IncomeSource;
  occurredOn: string;
}

export class CreateIncomeEntry {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: CreateIncomeEntryInput): Promise<Transaction> {
    const user = await this.requireAuthenticatedUser.execute();
    const account = await this.accountRepository.findByIdForUser(input.accountId, user.id);

    if (!account) {
      throw new FinanceDomainError("The selected account was not found.");
    }

    if (account.accountType === "credit") {
      throw new FinanceDomainError("Credit-card accounts cannot receive immediate income entries.");
    }

    if (input.amountInCents <= 0) {
      throw new FinanceDomainError("Amount must be greater than zero.");
    }

    const expectedBucket =
      input.incomeSource === "vr"
        ? "meal_benefit"
        : input.incomeSource === "vt"
          ? "transport_benefit"
          : "free";

    if (account.bucket !== expectedBucket) {
      throw new FinanceDomainError("The selected account bucket does not match the income source.");
    }

    return this.transactionRepository.create({
      accountId: account.id,
      amountInCents: input.amountInCents,
      bucket: account.bucket,
      categoryId: null,
      description: input.description?.trim() || null,
      direction: "income",
      expenseNature: null,
      incomeSource: input.incomeSource,
      occurredOn: input.occurredOn,
      userId: user.id,
    });
  }
}
