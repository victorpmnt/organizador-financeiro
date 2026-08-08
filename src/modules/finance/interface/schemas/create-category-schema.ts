import { z } from "zod";

import { CATEGORY_KINDS } from "../../domain/enums/category-kind";
import { EXPENSE_NATURES } from "../../domain/enums/expense-nature";

export const createCategorySchema = z
  .object({
    color: z.string().trim().max(32).nullable().optional(),
    expenseNature: z.enum(EXPENSE_NATURES).nullable().optional(),
    kind: z.enum(CATEGORY_KINDS),
    name: z.string().trim().min(1).max(100),
  })
  .superRefine((value, context) => {
    if (value.kind === "expense" && !value.expenseNature) {
      context.addIssue({
        code: "custom",
        message: "Expense categories require an expense nature.",
        path: ["expenseNature"],
      });
    }

    if (value.kind !== "expense" && value.expenseNature) {
      context.addIssue({
        code: "custom",
        message: "Only expense categories may define an expense nature.",
        path: ["expenseNature"],
      });
    }
  });

export type CreateCategorySchemaInput = z.infer<typeof createCategorySchema>;

