import type { ExpenseNature } from "../enums/expense-nature";
import type { CategoryKind } from "../enums/category-kind";
import { FinanceDomainError } from "../errors/finance-domain-error";

export interface CategoryRulesInput {
  expenseNature: ExpenseNature | null;
  kind: CategoryKind;
  name: string;
}

export function validateCategoryRules(input: CategoryRulesInput): void {
  if (!input.name || input.name.length > 100) {
    throw new FinanceDomainError("Category name must contain between 1 and 100 characters.");
  }

  if (input.kind === "expense" && input.expenseNature === null) {
    throw new FinanceDomainError("Expense categories require an expense nature.");
  }

  if (input.kind !== "expense" && input.expenseNature !== null) {
    throw new FinanceDomainError("Only expense categories may define an expense nature.");
  }
}

