import { z } from "zod";

import { ACCOUNT_TYPES } from "../../domain/enums/account-type";
import { BALANCE_BUCKETS } from "../../domain/enums/balance-bucket";

export const createAccountSchema = z.object({
  accountType: z.enum(ACCOUNT_TYPES),
  bucket: z.enum(BALANCE_BUCKETS),
  creditLimitInCents: z
    .number()
    .int()
    .positive()
    .max(Number.MAX_SAFE_INTEGER)
    .nullable()
    .optional()
    .default(null),
  initialBalanceInCents: z
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER),
  name: z.string().trim().min(1).max(100),
  statementDueDay: z.number().int().min(1).max(31).nullable().optional().default(null),
});

export type CreateAccountSchemaInput = z.infer<typeof createAccountSchema>;
