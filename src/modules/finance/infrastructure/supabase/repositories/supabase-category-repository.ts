import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { FinancePersistenceError } from "../../../application/errors/finance-persistence-error";
import type {
  CategoryRepository,
  CreateCategoryRecord,
} from "../../../application/ports/category-repository";
import type { Category } from "../../../domain/entities/category";
import { mapCategoryRow } from "../mappers/category-mapper";

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateCategoryRecord): Promise<Category> {
    const { data, error } = await this.client
      .from("categories")
      .insert({
        color: input.color,
        expense_nature: input.expenseNature,
        kind: input.kind,
        name: input.name,
        user_id: input.userId,
      })
      .select()
      .single();

    if (error) {
      throw new FinancePersistenceError("Unable to create category.", error.code);
    }

    return mapCategoryRow(data);
  }

  async findByIdForUser(categoryId: string, userId: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from("categories")
      .select()
      .eq("id", categoryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new FinancePersistenceError("Unable to load category.", error.code);
    }

    return data ? mapCategoryRow(data) : null;
  }

  async listByUser(userId: string): Promise<Category[]> {
    const { data, error } = await this.client
      .from("categories")
      .select()
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      throw new FinancePersistenceError("Unable to list categories.", error.code);
    }

    return data.map(mapCategoryRow);
  }
}
