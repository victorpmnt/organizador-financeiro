import type { RequireAuthenticatedUser } from "@/modules/auth";

import { calculateSafeCreditLimit } from "../../domain/services/calculate-safe-credit-limit";
import type { AccountRepository } from "../ports/account-repository";
import type { CommitmentRepository } from "../ports/commitment-repository";
import type { TransactionRepository } from "../ports/transaction-repository";

export class CalculateSafeCreditLimit {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<number> {
    const user = await this.requireAuthenticatedUser.execute();
    const [accounts, transactions, commitments] = await Promise.all([
      this.accountRepository.listByUser(user.id),
      this.transactionRepository.listBalanceAffectingByUser(user.id),
      this.commitmentRepository.listOpenByUser(user.id),
    ]);

    const freeBalanceFromAccounts = accounts
      .filter((account) => account.bucket === "free")
      .reduce((sum, account) => sum + account.initialBalanceInCents, 0);

    const freeBalanceFromTransactions = transactions
      .filter((transaction) => transaction.bucket === "free")
      .reduce(
        (sum, transaction) =>
          sum + (transaction.direction === "income" ? transaction.amountInCents : -transaction.amountInCents),
        0,
      );

    const freeCommitted = commitments
      .filter((commitment) => commitment.bucket === "free")
      .reduce((sum, commitment) => sum + commitment.amountInCents, 0);

    return calculateSafeCreditLimit({
      commitmentsUntilDueDateInCents: freeCommitted,
      freeAvailableInCents: freeBalanceFromAccounts + freeBalanceFromTransactions,
      minimumReserveInCents: 0,
    });
  }
}
