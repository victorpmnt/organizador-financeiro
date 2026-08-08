import type { AccountType } from "../enums/account-type";
import type { BalanceBucket } from "../enums/balance-bucket";

export interface Account {
  accountType: AccountType;
  bucket: BalanceBucket;
  creditLimitInCents: number | null;
  createdAt: string;
  id: string;
  initialBalanceInCents: number;
  isActive: boolean;
  name: string;
  statementDueDay: number | null;
  updatedAt: string;
  userId: string;
}
