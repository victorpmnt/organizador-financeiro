import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { FinancePersistenceError } from "../../../application/errors/finance-persistence-error";
import type {
  AccountRepository,
  CreateAccountRecord,
} from "../../../application/ports/account-repository";
import type { Account } from "../../../domain/entities/account";
import { mapAccountRow } from "../mappers/account-mapper";

export class SupabaseAccountRepository implements AccountRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateAccountRecord): Promise<Account> {
    const { data, error } = await this.client
      .from("accounts")
      .insert({
        account_type: input.accountType,
        balance_bucket: input.bucket,
        initial_balance_in_cents: input.initialBalanceInCents,
        name: input.name,
        user_id: input.userId,
      })
      .select()
      .single();

    if (error) {
      throw new FinancePersistenceError("Unable to create account.", error.code);
    }

    return mapAccountRow(data);
  }

  async findByIdForUser(accountId: string, userId: string): Promise<Account | null> {
    const { data, error } = await this.client
      .from("accounts")
      .select()
      .eq("id", accountId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new FinancePersistenceError("Unable to load account.", error.code);
    }

    return data ? mapAccountRow(data) : null;
  }

  async listByUser(userId: string): Promise<Account[]> {
    const { data, error } = await this.client
      .from("accounts")
      .select()
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      throw new FinancePersistenceError("Unable to list accounts.", error.code);
    }

    return data.map(mapAccountRow);
  }
}
