import type { Database } from "@/lib/supabase/database.types";

import type { Commitment } from "../../../domain/entities/commitment";

type CommitmentRow = Database["public"]["Tables"]["commitments"]["Row"];

export function mapCommitmentRow(row: CommitmentRow): Commitment {
  return {
    accountId: row.account_id,
    amountInCents: row.amount_in_cents,
    bucket: row.balance_bucket,
    categoryId: row.category_id,
    createdAt: row.created_at,
    description: row.description,
    dueOn: row.due_on,
    id: row.id,
    installmentCount: row.installment_count,
    installmentNumber: row.installment_number,
    logicalGroupId: row.logical_group_id,
    settlementTransactionId: row.settlement_transaction_id,
    settledAt: row.settled_at,
    sourceTransactionId: row.source_transaction_id,
    type: row.type,
    userId: row.user_id,
  };
}
