import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Category } from "../../domain/entities/category";
import type { CategoryRepository } from "../ports/category-repository";

export class ListCategories {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<Category[]> {
    const user = await this.requireAuthenticatedUser.execute();

    return this.categoryRepository.listByUser(user.id);
  }
}

