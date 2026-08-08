import { z } from "zod";

import { yearMonthSchema } from "./year-month-schema";

export const getMonthlyDashboardSchema = z.object({
  yearMonth: yearMonthSchema,
});

export type GetMonthlyDashboardSchemaInput = z.infer<typeof getMonthlyDashboardSchema>;
