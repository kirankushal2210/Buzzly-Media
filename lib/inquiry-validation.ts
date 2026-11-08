/**
 * Shared contact-form rules, used by the browser (instant feedback) and the
 * API route (the source of truth). Values are trimmed and length-capped here;
 * HTML/markdown escaping happens at each output (email, Slack, Discord).
 */
export const LIMITS = { name: [2, 100], email: [3, 200], company: [0, 120], message: [20, 5000] } as const;
export const INTERESTS = ["content", "brand", "distribution", "partnership", "other"] as const;

export type InquiryField = "name" | "email" | "company" | "interest" | "message";
export type InquiryErrors = Partial<Record<InquiryField, string>>;
export type ValidInquiry = { name: string; email: string; company: string; interest: string; message: string };

const emailPattern = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Strip control characters except newline/tab, which messages may contain.
const clean = (value: unknown) => (typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "");

export function validateInquiry(input: Record<string, unknown>): { ok: true; value: ValidInquiry } | { ok: false; errors: InquiryErrors } {
  const name = clean(input.name).replace(/\s+/g, " ");
  const email = clean(input.email).toLowerCase();
  const company = clean(input.company).replace(/\s+/g, " ");
  const interest = clean(input.interest);
  const message = clean(input.message);
  const errors: InquiryErrors = {};

  if (!name) errors.name = "Please tell us your name.";
  else if (name.length < LIMITS.name[0]) errors.name = "Your name needs at least 2 characters.";
  else if (name.length > LIMITS.name[1]) errors.name = "Please keep your name under 100 characters.";

  if (!email) errors.email = "Please add your email so we can reply.";
  else if (email.length > LIMITS.email[1] || !emailPattern.test(email)) errors.email = "That email doesn’t look right — please check it.";

  if (company.length > LIMITS.company[1]) errors.company = "Please keep this under 120 characters.";

  if (!interest) errors.interest = "Please choose what you’d like to build.";
  else if (!(INTERESTS as readonly string[]).includes(interest)) errors.interest = "Please choose one of the options.";

  if (!message) errors.message = "Please tell us a little about your project.";
  else if (message.length < LIMITS.message[0]) errors.message = `A few more words, please — at least ${LIMITS.message[0]} characters (${message.length} so far).`;
  else if (message.length > LIMITS.message[1]) errors.message = "Please keep your message under 5,000 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, email, company, interest, message } };
}
