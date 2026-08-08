import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { MonthlyPlanDetailsDto } from "../dtos/monthly-plan-details-dto";
import type { UpsertMonthlyPlanItemDto } from "../dtos/upsert-monthly-plan-dto";
import type { CategoryRepository } from "../ports/category-repository";
import type { FinanceRepository } from "../ports/finance-repository";
import { resolveMonthRange } from "../../domain/services/month";
import { validateMonthlyPlanRules } from "../../domain/services/validate-monthly-plan";

export interface UpsertMonthlyPlanInput {
  items: UpsertMonthlyPlanItemDto[];
  minimumFreeReserveInCents: number;
  notes: string | null;
  yearMonth: string;
}

export class UpsertMonthlyPlan {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly financeRepository: FinanceRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: UpsertMonthlyPlanInput): Promise<MonthlyPlanDetailsDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const yearMonth = resolveMonthRange(input.yearMonth).monthDate.slice(0, 7);
    const normalizedItems = input.items.map((item) => ({
      ...item,
      description: item.description?.trim() || null,
    }));
    const categoryIds = normalizedItems
      .filter((item) => item.categoryId !== null)
      .map((item) => item.categoryId as string);
    const categories = await Promise.all(
      Array.from(new Set(categoryIds)).map((categoryId) =>
        this.categoryRepository.findByIdForUser(categoryId, user.id),
      ),
    );
    const categoriesById = new Map(
      categories.filter((category) => category !== null).map((category) => [category.id, category]),
    );

    validateMonthlyPlanRules(
      yearMonth,
      input.minimumFreeReserveInCents,
      normalizedItems.map((item) => ({
        ...item,
        category: item.categoryId === null ? null : (categoriesById.get(item.categoryId) ?? null),
        yearMonth,
      })),
    );

    return this.financeRepository.upsertMonthlyPlan({
      items: normalizedItems,
      minimumFreeReserveInCents: input.minimumFreeReserveInCents,
      notes: input.notes?.trim() || null,
      userId: user.id,
      yearMonth,
    });
  }
}
