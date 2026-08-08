import { z } from "zod";

import { ACCOUNT_TYPES } from "../../domain/enums/account-type";
import { BALANCE_BUCKETS } from "../../domain/enums/balance-bucket";

export const createAccountSchema = z.object({
  accountType: z.enum(ACCOUNT_TYPES),
  bucket: z.enum(BALANCE_BUCKETS),
  initialBalanceInCents: z
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER),
  name: z.string().trim().min(1).max(100),
});

export type CreateAccountSchemaInput = z.infer<typeof createAccountSchema>;

