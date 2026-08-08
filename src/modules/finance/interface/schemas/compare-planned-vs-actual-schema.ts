import { z } from "zod";

import { yearMonthSchema } from "./year-month-schema";

export const comparePlannedVsActualSchema = z.object({
  yearMonth: yearMonthSchema,
});

export type ComparePlannedVsActualSchemaInput = z.infer<typeof comparePlannedVsActualSchema>;
