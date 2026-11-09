import { emailConfig } from "@/lib/server-env";
import { siteUrl } from "@/lib/site";
import { interestLabels } from "@/lib/notify";

export type Inquiry = { name: string; email: string; company: string; interest: string; message: string };

/**
 * `sent` means the provider ACCEPTED the message for delivery (Resend returned 2xx).
 * It is not proof that the message reached an inbox; delivery can still bounce or be filtered.
 */
export type SendResult =
  | { status: "sent"; id: string | null }
  /** `error` is a short category (e.g. "http_502", "timeout", "quota_exceeded"); never a provider response. */
  | { status: "failed"; error: string }
  | { status: "skipped" };

/** Log- and database-safe failure category for a thrown fetch error. */
export function fetchErrorCategory(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  return name === "TimeoutError" || name === "AbortError" ? "timeout" : "network";
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] || ch);
}

/** The bare address inside a sender like `Buzzly <hello@example.com>`. */
export function senderAddress(from: string) {
  return (from.match(/<([^>]+)>/)?.[1] ?? from).trim().toLowerCase();
}

/**
 * Resend's shared test sender (onboarding@resend.dev) can only deliver to the Resend
 * account owner's own address, so visitor confirmations from it would always be rejected.
 */
export const usesResendTestSender = (from: string) => senderAddress(from).endsWith("@resend.dev");

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Short, safe category for a Resend error. Only the error `name` is read; the body is never logged or stored. */
async function resendErrorCategory(response: Response) {
  const body = await response.json().catch(() => ({})) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name : "";
  if (response.status === 429) {
    if (/quota/.test(name)) return "quota_exceeded"; // daily or monthly sending quota used up
    return "rate_limited"; // too many requests per second
  }
  if (response.status === 409) return "idempotency_conflict";
  return `http_${response.status}`;
}

/**
 * POST one email to Resend.
 *
 * `idempotencyKey` makes Resend treat repeats of the same request (within 24 hours) as one
 * email, so even a retry that slips past our own database claim cannot send a duplicate.
 * A per-second rate-limit response is retried once after a short pause; quota errors are not.
 */
async function sendViaResend(payload: Record<string, unknown>, idempotencyKey?: string): Promise<SendResult> {
  const config = emailConfig();
  if (!config) return { status: "skipped" };
  const headers: Record<string, string> = { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);
  const body = JSON.stringify({ from: config.from, ...payload });

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", headers, body, cache: "no-store", signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const result = await response.json().catch(() => ({})) as { id?: string };
        return { status: "sent", id: result.id ?? null };
      }
      const category = await resendErrorCategory(response);
      if (category === "rate_limited" && attempt === 1) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await wait(Math.min(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000, 2000));
        continue;
      }
      console.error("Resend request failed", response.status, category);
      return { status: "failed", error: category };
    } catch (error) {
      const category = fetchErrorCategory(error);
      console.error("Resend request failed", category);
      return { status: "failed", error: category };
    }
  }
  return { status: "failed", error: "rate_limited" };
}

const field = (label: string, value: string) =>
  `<tr><td style="padding:6px 16px 6px 0;color:#6b6460;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#151313">${value}</td></tr>`;

/**
 * Internal notification to the Buzzly inbox (CONTACT_TO_EMAIL). Reply-To is the visitor,
 * so pressing Reply in Gmail writes to them. Every user-supplied value is HTML-escaped.
 */
export function sendInboxNotification(inquiry: Inquiry, reference: string | null, idempotencyKey?: string) {
  const config = emailConfig();
  if (!config) return Promise.resolve<SendResult>({ status: "skipped" });
  const { name, email, company, interest, message } = inquiry;
  const type = interestLabels[interest] ?? interest;
  const ref = reference ? ` #${reference}` : "";
  const html = `<!doctype html><html><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#151313;background:#ffffff">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;color:#ef342d;font-weight:bold">BUZZLY WEBSITE INQUIRY${escapeHtml(ref)}</p>
<h1 style="margin:0 0 16px;font-size:22px">New inquiry from ${escapeHtml(name)}</h1>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
${field("Name", escapeHtml(name))}
${field("Email", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`)}
${field("Company", company ? escapeHtml(company) : "—")}
${field("Inquiry type", escapeHtml(type))}
</table>
<p style="margin:0 0 6px;color:#6b6460">Message</p>
<div style="padding:14px 16px;background:#f6f2ea;border-left:3px solid #ef342d;white-space:normal">${escapeHtml(message).replace(/\r?\n/g, "<br>")}</div>
<p style="margin:20px 0 0;font-size:13px;color:#6b6460">Reply to this email to answer ${escapeHtml(name)} directly. The inquiry is also saved in the Buzzly inquiries database.</p>
</body></html>`;
  const text = [
    `New Buzzly website inquiry${ref}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "—"}`,
    `Inquiry type: ${type}`,
    "",
    "Message:",
    message,
    "",
    `Reply to this email to answer ${name} directly.`,
  ].join("\n");
  return sendViaResend({
    to: config.to.split(",").map(address => address.trim()).filter(Boolean),
    reply_to: email,
    subject: `New inquiry${ref}: ${name} — ${type}`,
    html,
    text,
  }, idempotencyKey);
}

/**
 * Confirmation to the visitor that Buzzly received their inquiry.
 *
 * Deliberately generic: it never repeats the submitted name, company or message, so the
 * form cannot be used to send arbitrary text to someone else's address. It makes no promise
 * about response times. Replies go to the Buzzly inbox.
 */
export function sendAutoReply(inquiry: Inquiry, reference: string | null, idempotencyKey?: string) {
  const config = emailConfig();
  if (!config) return Promise.resolve<SendResult>({ status: "skipped" });
  if (usesResendTestSender(config.from)) return Promise.resolve<SendResult>({ status: "skipped" });
  const topic = (interestLabels[inquiry.interest] ?? "your project").toLowerCase();
  const ref = reference ? `For your records, your reference is ${reference}. ` : "";
  const replyTo = config.to.split(",")[0].trim();
  const text = [
    "Hello,",
    "",
    `Thank you for reaching out to Buzzly about ${topic}. We’ve received your inquiry, and a member of our team will read it carefully and be in touch.`,
    "",
    `${ref}If there’s anything you’d like to add in the meantime, simply reply to this email.`,
    "",
    "Warm regards,",
    "The Buzzly team",
    "Building brands through content.",
    siteUrl,
    "",
    "You’re receiving this because this email address was entered on the Buzzly website contact form. If that wasn’t you, you can safely ignore this message.",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#151313;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#f5efdf">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto">
<tr><td style="font-size:12px;letter-spacing:3px;color:#ef342d;font-weight:bold;padding-bottom:24px">BUZZLY</td></tr>
<tr><td style="font-family:Georgia,serif;font-size:38px;line-height:1.05;padding-bottom:20px">Thank you for<br><em style="color:#ef342d">reaching out.</em></td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d8d0c3;padding-bottom:16px">We’ve received your inquiry about ${escapeHtml(topic)}. A member of our team will read it carefully and be in touch.</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d8d0c3;padding-bottom:28px">${escapeHtml(ref)}If there’s anything you’d like to add in the meantime, simply reply to this email.</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d8d0c3;padding-bottom:28px">Warm regards,<br>The Buzzly team</td></tr>
<tr><td style="padding-bottom:32px"><a href="${escapeHtml(siteUrl)}/work" style="background:#ef342d;color:#111;text-decoration:none;font-weight:bold;padding:13px 20px;display:inline-block">See our work ↗</a></td></tr>
<tr><td style="border-top:1px solid #403b38;padding-top:18px;font-size:12px;line-height:1.5;color:#8a847b">Buzzly — building brands through content.<br>You’re receiving this because this email address was entered on the Buzzly website contact form. If that wasn’t you, you can safely ignore this message.</td></tr>
</table></body></html>`;
  return sendViaResend({ to: [inquiry.email], reply_to: replyTo, subject: "We’ve received your inquiry — Buzzly", text, html }, idempotencyKey);
}
