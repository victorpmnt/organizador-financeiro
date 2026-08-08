import { z } from "zod";

import { yearMonthSchema } from "./year-month-schema";

export const upsertMonthlyPlanSchema = z.object({
  items: z.array(
    z.object({
      amountInCents: z.number().int().positive(),
      bucket: z.enum(["free", "meal_benefit", "transport_benefit"]),
      categoryId: z.string().uuid().nullable(),
      description: z.string().trim().max(255).nullable(),
      expectedOn: z.string().date().nullable(),
      incomeSource: z.enum(["salary", "vr", "vt", "extra_income"]).nullable(),
      kind: z.enum(["income", "expense"]),
    }),
  ),
  minimumFreeReserveInCents: z.number().int().min(0),
  notes: z.string().trim().max(1000).nullable(),
  yearMonth: yearMonthSchema,
});

export type UpsertMonthlyPlanSchemaInput = z.infer<typeof upsertMonthlyPlanSchema>;
