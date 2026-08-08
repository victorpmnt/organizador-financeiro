import type { Category } from "../../domain/entities/category";
import type { CategoryKind } from "../../domain/enums/category-kind";
import type { ExpenseNature } from "../../domain/enums/expense-nature";

export interface CreateCategoryRecord {
  color: string | null;
  expenseNature: ExpenseNature | null;
  kind: CategoryKind;
  name: string;
  userId: string;
}

export interface CategoryRepository {
  create(input: CreateCategoryRecord): Promise<Category>;
  findByIdForUser(categoryId: string, userId: string): Promise<Category | null>;
  listByUser(userId: string): Promise<Category[]>;
}
