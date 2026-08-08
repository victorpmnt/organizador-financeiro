import type { Database } from "@/lib/supabase/database.types";

import type { Transaction } from "../../../domain/entities/transaction";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    accountId: row.account_id,
    affectsBalance: row.affects_balance,
    amountInCents: row.amount_in_cents,
    bucket: row.balance_bucket,
    categoryId: row.category_id,
    createdAt: row.created_at,
    description: row.description,
    direction: row.direction,
    expenseNature: row.expense_nature,
    id: row.id,
    incomeSource: row.income_source,
    occurredOn: row.occurred_on,
    userId: row.user_id,
  };
}
