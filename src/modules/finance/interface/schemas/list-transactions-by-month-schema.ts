import { z } from "zod";

export const listTransactionsByMonthSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "yearMonth must use the YYYY-MM format."),
});

export type ListTransactionsByMonthSchemaInput = z.infer<typeof listTransactionsByMonthSchema>;
