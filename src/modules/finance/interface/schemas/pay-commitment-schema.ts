import { z } from "zod";

export const payCommitmentSchema = z.object({
  commitmentIds: z.array(z.string().uuid()).min(1),
  description: z.string().trim().min(1).max(280).nullable().optional().default(null),
  occurredOn: z.string().date(),
  payingAccountId: z.string().uuid(),
});

export type PayCommitmentSchemaInput = z.infer<typeof payCommitmentSchema>;
