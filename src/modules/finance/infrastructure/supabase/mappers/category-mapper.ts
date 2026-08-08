import type { Database } from "@/lib/supabase/database.types";

import type { Category } from "../../../domain/entities/category";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    color: row.color,
    createdAt: row.created_at,
    expenseNature: row.expense_nature,
    id: row.id,
    kind: row.kind,
    name: row.name,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

