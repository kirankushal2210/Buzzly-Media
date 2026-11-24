import { z } from "zod";
import { TIER_SLUGS } from "@/lib/engagements";

/**
 * Lead qualifier form: field options and client-side validation for
 * components/LeadQualifierForm.tsx. Reuse this schema on the server when the
 * backend phase adds a Server Action.
 */
export const PRIMARY_GOALS = [
  "Inbound Lead Generation",
  "Brand Awareness & Organic Reach",
  "Full Content & Distribution Engine",
] as const;

export const MONTHLY_BUDGETS = [
  "Under ₹50,000",
  "₹50,000 – ₹1,50,000",
  "₹1,50,000+",
] as const;

// Strip control characters and collapse whitespace before validating.
const clean = (value: unknown) => (typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim() : "");
const optional = (value: unknown) => clean(value) || undefined;

export const leadSchema = z.object({
  fullName: z.preprocess(clean, z.string().min(2, "Please tell us your full name.").max(100, "Please keep your name under 100 characters.")),
  email: z.preprocess(
    value => clean(value).toLowerCase(),
    z.string().min(1, "Please add your work email so we can reply.").max(200, "That email is too long.").email("That email doesn’t look right — please check it."),
  ),
  brandUrl: z.preprocess(clean, z.string().min(2, "Please add your website or Instagram handle.").max(200, "Please keep this under 200 characters.")),
  primaryGoal: z.preprocess(clean, z.enum(PRIMARY_GOALS, { errorMap: () => ({ message: "Please choose your primary goal." }) })),
  monthlyBudget: z.preprocess(clean, z.enum(MONTHLY_BUDGETS, { errorMap: () => ({ message: "Please choose a monthly budget." }) })),
  // Optional context carried from /services: the chosen tier and the readiness diagnostic code.
  scope: z.preprocess(optional, z.enum(TIER_SLUGS).optional()),
  audit: z.preprocess(optional, z.string().max(80).optional()),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = "fullName" | "email" | "brandUrl" | "primaryGoal" | "monthlyBudget";
export type LeadFieldErrors = Partial<Record<LeadField, string>>;
export const LEAD_FIELDS: LeadField[] = ["fullName", "email", "brandUrl", "primaryGoal", "monthlyBudget"];

/** First message per field from a failed parse. */
export function leadFieldErrors(error: z.ZodError): LeadFieldErrors {
  const errors: LeadFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as LeadField | undefined;
    if (field && LEAD_FIELDS.includes(field) && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
