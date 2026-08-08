import { z } from "zod";

export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "yearMonth must use the YYYY-MM format.")
  .refine((value) => {
    const month = Number(value.slice(5, 7));
    return month >= 1 && month <= 12;
  }, "yearMonth must contain a month from 01 to 12.");
