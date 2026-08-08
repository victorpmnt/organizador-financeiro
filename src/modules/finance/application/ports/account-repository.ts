import type { Account } from "../../domain/entities/account";
import type { AccountType } from "../../domain/enums/account-type";
import type { BalanceBucket } from "../../domain/enums/balance-bucket";

export interface CreateAccountRecord {
  accountType: AccountType;
  bucket: BalanceBucket;
  creditLimitInCents: number | null;
  initialBalanceInCents: number;
  name: string;
  statementDueDay: number | null;
  userId: string;
}

export interface AccountRepository {
  create(input: CreateAccountRecord): Promise<Account>;
  findByIdForUser(accountId: string, userId: string): Promise<Account | null>;
  listByUser(userId: string): Promise<Account[]>;
}
