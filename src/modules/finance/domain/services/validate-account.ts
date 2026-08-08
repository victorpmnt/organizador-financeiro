import type { AccountType } from "../enums/account-type";
import type { BalanceBucket } from "../enums/balance-bucket";
import { FinanceDomainError } from "../errors/finance-domain-error";

export interface AccountRulesInput {
  accountType: AccountType;
  bucket: BalanceBucket;
  creditLimitInCents: number | null;
  initialBalanceInCents: number;
  name: string;
  statementDueDay: number | null;
}

export function validateAccountRules(input: AccountRulesInput): void {
  if (!input.name || input.name.length > 100) {
    throw new FinanceDomainError("Account name must contain between 1 and 100 characters.");
  }

  if (!Number.isSafeInteger(input.initialBalanceInCents) || input.initialBalanceInCents < 0) {
    throw new FinanceDomainError("Initial balance must be a non-negative integer in cents.");
  }

  if (input.accountType === "credit") {
    if (input.bucket !== "free") {
      throw new FinanceDomainError("Credit accounts must use the free bucket.");
    }

    if (
      !Number.isSafeInteger(input.creditLimitInCents) ||
      input.creditLimitInCents === null ||
      input.creditLimitInCents <= 0
    ) {
      throw new FinanceDomainError("Credit accounts require a positive credit limit in cents.");
    }

    if (
      !Number.isSafeInteger(input.statementDueDay) ||
      input.statementDueDay === null ||
      input.statementDueDay < 1 ||
      input.statementDueDay > 31
    ) {
      throw new FinanceDomainError("Credit accounts require a statement due day between 1 and 31.");
    }

    return;
  }

  if (input.creditLimitInCents !== null || input.statementDueDay !== null) {
    throw new FinanceDomainError("Only credit accounts may define a credit limit or due day.");
  }

  if (input.accountType === "vr") {
    if (input.bucket !== "meal_benefit") {
      throw new FinanceDomainError("VR accounts must use the meal benefit bucket.");
    }

    return;
  }

  if (input.accountType === "vt") {
    if (input.bucket !== "transport_benefit") {
      throw new FinanceDomainError("VT accounts must use the transport benefit bucket.");
    }

    return;
  }

  if (input.bucket !== "free") {
    throw new FinanceDomainError("Debit accounts must use the free bucket.");
  }
}
