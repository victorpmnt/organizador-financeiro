import type { BalanceBucket } from "../enums/balance-bucket";
import type { ExpenseNature } from "../enums/expense-nature";
import type { IncomeSource } from "../enums/income-source";

export type TransactionDirection = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  direction: TransactionDirection;
  amountInCents: number;
  occurredOn: string;
  description: string | null;
  bucket: BalanceBucket;
  incomeSource: IncomeSource | null;
  expenseNature: ExpenseNature | null;
  categoryId: string | null;
  accountId: string | null;
  createdAt: string;
}
