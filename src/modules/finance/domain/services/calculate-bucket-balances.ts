import type { Account } from "../entities/account";
import type { Transaction } from "../entities/transaction";

export interface CalculatedBucketBalances {
  freeBalanceInCents: number;
  mealBenefitBalanceInCents: number;
  transportBenefitBalanceInCents: number;
}

export function calculateBucketBalances(
  accounts: Account[],
  transactions: Transaction[],
): CalculatedBucketBalances {
  const balances: CalculatedBucketBalances = {
    freeBalanceInCents: 0,
    mealBenefitBalanceInCents: 0,
    transportBenefitBalanceInCents: 0,
  };

  for (const account of accounts) {
    switch (account.bucket) {
      case "free":
        balances.freeBalanceInCents += account.initialBalanceInCents;
        break;
      case "meal_benefit":
        balances.mealBenefitBalanceInCents += account.initialBalanceInCents;
        break;
      case "transport_benefit":
        balances.transportBenefitBalanceInCents += account.initialBalanceInCents;
        break;
    }
  }

  for (const transaction of transactions) {
    if (!transaction.affectsBalance) {
      continue;
    }

    const multiplier = transaction.direction === "income" ? 1 : -1;

    switch (transaction.bucket) {
      case "free":
        balances.freeBalanceInCents += transaction.amountInCents * multiplier;
        break;
      case "meal_benefit":
        balances.mealBenefitBalanceInCents += transaction.amountInCents * multiplier;
        break;
      case "transport_benefit":
        balances.transportBenefitBalanceInCents += transaction.amountInCents * multiplier;
        break;
    }
  }

  return balances;
}
