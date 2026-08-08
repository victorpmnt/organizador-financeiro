import type { Transaction } from "../../domain/entities/transaction";
import type { BalanceBucket } from "../../domain/enums/balance-bucket";
import type { ExpenseNature } from "../../domain/enums/expense-nature";
import type { IncomeSource } from "../../domain/enums/income-source";

export interface CreateTransactionRecord {
  accountId: string;
  amountInCents: number;
  bucket: BalanceBucket;
  categoryId: string | null;
  description: string | null;
  direction: "income" | "expense";
  expenseNature: ExpenseNature | null;
  incomeSource: IncomeSource | null;
  occurredOn: string;
  userId: string;
}

export interface TransactionRepository {
  create(input: CreateTransactionRecord): Promise<Transaction>;
  listBalanceAffectingByUser(userId: string): Promise<Transaction[]>;
  listByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]>;
}
