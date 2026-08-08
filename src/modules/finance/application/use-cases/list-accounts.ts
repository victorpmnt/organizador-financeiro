import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Account } from "../../domain/entities/account";
import type { AccountRepository } from "../ports/account-repository";

export class ListAccounts {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<Account[]> {
    const user = await this.requireAuthenticatedUser.execute();

    return this.accountRepository.listByUser(user.id);
  }
}

