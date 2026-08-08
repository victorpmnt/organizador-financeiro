import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Account } from "../../domain/entities/account";
import type { AccountType } from "../../domain/enums/account-type";
import type { BalanceBucket } from "../../domain/enums/balance-bucket";
import { validateAccountRules } from "../../domain/services/validate-account";
import type { AccountRepository } from "../ports/account-repository";

export interface CreateAccountInput {
  accountType: AccountType;
  bucket: BalanceBucket;
  creditLimitInCents: number | null;
  initialBalanceInCents: number;
  name: string;
  statementDueDay: number | null;
}

export class CreateAccount {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const user = await this.requireAuthenticatedUser.execute();
    const normalizedInput = { ...input, name: input.name.trim() };

    validateAccountRules(normalizedInput);

    return this.accountRepository.create({
      ...normalizedInput,
      userId: user.id,
    });
  }
}
