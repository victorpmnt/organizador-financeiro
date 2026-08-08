import type { Database } from "@/lib/supabase/database.types";

import type { Account } from "../../../domain/entities/account";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export function mapAccountRow(row: AccountRow): Account {
  return {
    accountType: row.account_type,
    bucket: row.balance_bucket,
    creditLimitInCents: row.credit_limit_in_cents,
    createdAt: row.created_at,
    id: row.id,
    initialBalanceInCents: row.initial_balance_in_cents,
    isActive: row.is_active,
    name: row.name,
    statementDueDay: row.statement_due_day,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}
