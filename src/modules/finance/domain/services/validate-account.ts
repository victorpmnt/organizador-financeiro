import type { AccountType } from "../enums/account-type";
import type { BalanceBucket } from "../enums/balance-bucket";
import { FinanceDomainError } from "../errors/finance-domain-error";

export interface AccountRulesInput {
  accountType: AccountType;
  bucket: BalanceBucket;
  initialBalanceInCents: number;
  name: string;
}

export function validateAccountRules(input: AccountRulesInput): void {
  if (!input.name || input.name.length > 100) {
    throw new FinanceDomainError("Account name must contain between 1 and 100 characters.");
  }

  if (!Number.isSafeInteger(input.initialBalanceInCents) || input.initialBalanceInCents < 0) {
    throw new FinanceDomainError("Initial balance must be a non-negative integer in cents.");
  }

  if (input.accountType === "benefit") {
    if (input.bucket !== "meal_benefit" && input.bucket !== "transport_benefit") {
      throw new FinanceDomainError("Benefit accounts require a restricted benefit bucket.");
    }

    return;
  }

  if (input.bucket !== "free") {
    throw new FinanceDomainError("Non-benefit accounts must use the free bucket.");
  }
}

