import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { FinancePersistenceError } from "../../../application/errors/finance-persistence-error";
import type {
  CreateTransactionRecord,
  TransactionRepository,
} from "../../../application/ports/transaction-repository";
import type { Transaction } from "../../../domain/entities/transaction";
import { mapTransactionRow } from "../mappers/transaction-mapper";

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateTransactionRecord): Promise<Transaction> {
    const { data, error } = await this.client
      .from("transactions")
      .insert({
        account_id: input.accountId,
        amount_in_cents: input.amountInCents,
        balance_bucket: input.bucket,
        category_id: input.categoryId,
        description: input.description,
        direction: input.direction,
        expense_nature: input.expenseNature,
        income_source: input.incomeSource,
        occurred_on: input.occurredOn,
        user_id: input.userId,
      })
      .select()
      .single();

    if (error) {
      throw new FinancePersistenceError("Unable to create transaction.", error.code);
    }

    return mapTransactionRow(data);
  }

  async listBalanceAffectingByUser(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from("transactions")
      .select()
      .eq("user_id", userId)
      .eq("affects_balance", true)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new FinancePersistenceError("Unable to list balance-affecting transactions.", error.code);
    }

    return data.map(mapTransactionRow);
  }

  async listByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from("transactions")
      .select()
      .eq("user_id", userId)
      .gte("occurred_on", startDate)
      .lte("occurred_on", endDate)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new FinancePersistenceError("Unable to list transactions.", error.code);
    }

    return data.map(mapTransactionRow);
  }
}
