import { z } from "zod";

import { INCOME_SOURCES } from "../../domain/enums/income-source";

export const createIncomeEntrySchema = z.object({
  accountId: z.string().uuid(),
  amountInCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  description: z.string().trim().max(500).nullish().transform((value) => value ?? null),
  incomeSource: z.enum(INCOME_SOURCES),
  occurredOn: z.string().date(),
});

export type CreateIncomeEntrySchemaInput = z.infer<typeof createIncomeEntrySchema>;
