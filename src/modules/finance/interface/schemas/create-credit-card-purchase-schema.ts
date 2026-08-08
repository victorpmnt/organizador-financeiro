import { z } from "zod";

export const createCreditCardPurchaseSchema = z.object({
  accountId: z.string().uuid(),
  amountInCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(1).max(280).nullable().optional().default(null),
  installmentCount: z.number().int().min(1).max(60),
  occurredOn: z.string().date(),
});

export type CreateCreditCardPurchaseSchemaInput = z.infer<
  typeof createCreditCardPurchaseSchema
>;
