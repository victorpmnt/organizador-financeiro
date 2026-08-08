"use server";

import type { Category } from "@/modules/finance/domain/entities/category";
import { createCategorySchema } from "@/modules/finance/interface/schemas/create-category-schema";

import { createFinancePhaseOneUseCases } from "../_composition/finance-phase-one";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "./action-result";
import { revalidateCategoryViews } from "./revalidation";

export async function createCategoryAction(input: unknown): Promise<ActionResult<Category>> {
  const parsedInput = createCategorySchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { createCategory } = await createFinancePhaseOneUseCases();
    const category = await createCategory.execute(parsedInput.data);
    revalidateCategoryViews();
    return actionSuccess(category);
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const { listCategories } = await createFinancePhaseOneUseCases();
    return actionSuccess(await listCategories.execute());
  } catch (error) {
    return actionFailure(error);
  }
}
