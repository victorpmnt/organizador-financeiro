import type { AccountType } from "../enums/account-type";
import type { BalanceBucket } from "../enums/balance-bucket";

export interface Account {
  accountType: AccountType;
  bucket: BalanceBucket;
  createdAt: string;
  id: string;
  initialBalanceInCents: number;
  isActive: boolean;
  name: string;
  updatedAt: string;
  userId: string;
}

