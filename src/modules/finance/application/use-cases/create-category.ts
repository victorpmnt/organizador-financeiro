import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Category } from "../../domain/entities/category";
import type { CategoryKind } from "../../domain/enums/category-kind";
import type { ExpenseNature } from "../../domain/enums/expense-nature";
import { validateCategoryRules } from "../../domain/services/validate-category";
import type { CategoryRepository } from "../ports/category-repository";

export interface CreateCategoryInput {
  color?: string | null;
  expenseNature?: ExpenseNature | null;
  kind: CategoryKind;
  name: string;
}

export class CreateCategory {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const user = await this.requireAuthenticatedUser.execute();
    const normalizedInput = {
      color: input.color?.trim() || null,
      expenseNature: input.expenseNature ?? null,
      kind: input.kind,
      name: input.name.trim(),
    };

    validateCategoryRules(normalizedInput);

    return this.categoryRepository.create({
      ...normalizedInput,
      userId: user.id,
    });
  }
}

