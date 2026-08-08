import type { AvailableBalancesDto } from "../dtos/available-balances-dto";
import type { AccountRepository } from "../ports/account-repository";
import type { CommitmentRepository } from "../ports/commitment-repository";
import type { TransactionRepository } from "../ports/transaction-repository";
import type { RequireAuthenticatedUser } from "@/modules/auth";

export class GetAvailableBalances {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<AvailableBalancesDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const [accounts, transactions, commitments] = await Promise.all([
      this.accountRepository.listByUser(user.id),
      this.transactionRepository.listBalanceAffectingByUser(user.id),
      this.commitmentRepository.listOpenByUser(user.id),
    ]);

    const totals: AvailableBalancesDto = {
      freeAvailableInCents: 0,
      mealBenefitAvailableInCents: 0,
      transportBenefitAvailableInCents: 0,
    };

    for (const account of accounts) {
      if (account.bucket === "meal_benefit") {
        totals.mealBenefitAvailableInCents += account.initialBalanceInCents;
      } else if (account.bucket === "transport_benefit") {
        totals.transportBenefitAvailableInCents += account.initialBalanceInCents;
      } else {
        totals.freeAvailableInCents += account.initialBalanceInCents;
      }
    }

    for (const transaction of transactions) {
      const factor = transaction.direction === "income" ? 1 : -1;

      if (transaction.bucket === "meal_benefit") {
        totals.mealBenefitAvailableInCents += factor * transaction.amountInCents;
      } else if (transaction.bucket === "transport_benefit") {
        totals.transportBenefitAvailableInCents += factor * transaction.amountInCents;
      } else {
        totals.freeAvailableInCents += factor * transaction.amountInCents;
      }
    }

    for (const commitment of commitments) {
      if (commitment.bucket === "meal_benefit") {
        totals.mealBenefitAvailableInCents -= commitment.amountInCents;
      } else if (commitment.bucket === "transport_benefit") {
        totals.transportBenefitAvailableInCents -= commitment.amountInCents;
      } else {
        totals.freeAvailableInCents -= commitment.amountInCents;
      }
    }

    return totals;
  }
}
