import { z } from "zod";

export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "yearMonth must use the YYYY-MM format.");
