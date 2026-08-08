import { z } from "zod";

export const createImmediateExpenseSchema = z.object({
  accountId: z.string().uuid(),
  amountInCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  categoryId: z.string().uuid(),
  description: z.string().trim().max(500).nullish().transform((value) => value ?? null),
  occurredOn: z.string().date(),
});

export type CreateImmediateExpenseSchemaInput = z.infer<typeof createImmediateExpenseSchema>;
