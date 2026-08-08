import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { BucketBalancesDto } from "../dtos/bucket-balances-dto";
import type { AccountRepository } from "../ports/account-repository";
import type { TransactionRepository } from "../ports/transaction-repository";
import { calculateBucketBalances } from "../../domain/services/calculate-bucket-balances";

export class GetBucketBalances {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<BucketBalancesDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const [accounts, transactions] = await Promise.all([
      this.accountRepository.listByUser(user.id),
      this.transactionRepository.listBalanceAffectingByUser(user.id),
    ]);

    return calculateBucketBalances(accounts, transactions);
  }
}
