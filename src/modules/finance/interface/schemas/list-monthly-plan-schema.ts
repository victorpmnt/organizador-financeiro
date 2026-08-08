import { z } from "zod";

import { yearMonthSchema } from "./year-month-schema";

export const listMonthlyPlanSchema = z.object({
  yearMonth: yearMonthSchema,
});

export type ListMonthlyPlanSchemaInput = z.infer<typeof listMonthlyPlanSchema>;
