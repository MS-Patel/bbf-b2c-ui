import { z } from "zod";

/**
 * Schema for the per-card "generate report" form.
 *
 * - `period === "custom"` requires both `fromDate` and `toDate`.
 * - `fromDate` must be on or before `toDate`.
 * - The range cannot extend into the future.
 * - The range is capped at 5 years (1825 days) to keep generation bounded.
 */
export const reportRequestSchema = z
  .object({
    format: z.enum(["pdf", "xlsx", "csv"]),
    period: z.enum(["current_fy", "previous_fy", "last_30d", "last_90d", "ytd", "custom"]),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.period !== "custom") return;

    if (!val.fromDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fromDate"],
        message: "From date is required",
      });
    }
    if (!val.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toDate"],
        message: "To date is required",
      });
    }
    if (!val.fromDate || !val.toDate) return;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (val.fromDate > val.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toDate"],
        message: "To date must be on or after From date",
      });
    }
    if (val.toDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toDate"],
        message: "To date cannot be in the future",
      });
    }
    const fiveYearsMs = 1825 * 86_400_000;
    if (val.toDate.getTime() - val.fromDate.getTime() > fiveYearsMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fromDate"],
        message: "Range cannot exceed 5 years",
      });
    }
  });

export type ReportRequestFormValues = z.infer<typeof reportRequestSchema>;
