import type { CategoryKind } from "../enums/category-kind";
import type { ExpenseNature } from "../enums/expense-nature";

export interface Category {
  color: string | null;
  createdAt: string;
  expenseNature: ExpenseNature | null;
  id: string;
  kind: CategoryKind;
  name: string;
  updatedAt: string;
  userId: string;
}
