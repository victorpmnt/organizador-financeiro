import { z } from "zod";

import { yearMonthSchema } from "./year-month-schema";

export const listTransactionsByMonthSchema = z.object({
  yearMonth: yearMonthSchema,
});

export type ListTransactionsByMonthSchemaInput = z.infer<typeof listTransactionsByMonthSchema>;
