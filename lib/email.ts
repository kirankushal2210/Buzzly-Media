import { emailConfig } from "@/lib/server-env";
import { siteUrl } from "@/lib/site";
import { interestLabels } from "@/lib/notify";

export type Inquiry = { name: string; email: string; company: string; interest: string; message: string };

export type SendResult =
  | { status: "sent"; id: string | null }
  /** `error` is a short category (e.g. "http_502", "timeout"); never a provider response. */
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

async function sendViaResend(payload: Record<string, unknown>): Promise<SendResult> {
  const config = emailConfig();
  if (!config) return { status: "skipped" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.from, ...payload }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      // Provider bodies can echo addresses; log the status only.
      await response.body?.cancel().catch(() => {});
      console.error("Resend request failed", response.status);
      return { status: "failed", error: `http_${response.status}` };
    }
    const result = await response.json().catch(() => ({})) as { id?: string };
    return { status: "sent", id: result.id ?? null };
  } catch (error) {
    const category = fetchErrorCategory(error);
    console.error("Resend request failed", category);
    return { status: "failed", error: category };
  }
}

/** Internal notification to the Buzzly inbox, with reply-to set to the sender. */
export function sendInboxNotification(inquiry: Inquiry, reference: string | null) {
  const config = emailConfig();
  if (!config) return Promise.resolve<SendResult>({ status: "skipped" });
  const { name, email, company, interest, message } = inquiry;
  const html = `<h1>New Buzzly inquiry${reference ? ` #${reference}` : ""}</h1><p><b>Name:</b> ${escapeHtml(name)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Company:</b> ${escapeHtml(company)}</p><p><b>Interest:</b> ${escapeHtml(interestLabels[interest] ?? interest)}</p><p><b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`;
  return sendViaResend({ to: [config.to], reply_to: email, subject: `Buzzly inquiry: ${name}`, html });
}

/**
 * Confirmation sent to the person who filled in the form.
 *
 * Deliberately generic: it never repeats the submitted name, company or
 * message, so the form cannot be used to send arbitrary text to arbitrary
 * addresses. Replies go to the Buzzly inbox.
 */
export function sendAutoReply(inquiry: Inquiry, reference: string | null) {
  const config = emailConfig();
  if (!config) return Promise.resolve<SendResult>({ status: "skipped" });
  const topic = interestLabels[inquiry.interest] ?? "your project";
  const ref = reference ? `Your reference is #${reference}. ` : "";
  const text = [
    "Hi there,",
    "",
    `Thanks for getting in touch with Buzzly about ${topic.toLowerCase()}. We’ve received your message and someone from the team will reply personally.`,
    "",
    `${ref}If you have anything to add, just reply to this email.`,
    "",
    "— Buzzly",
    "Building brands through content.",
    siteUrl,
    "",
    "You’re receiving this because this address was used on the Buzzly contact form. If that wasn’t you, you can ignore this email.",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#151313;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#f5efdf">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto">
<tr><td style="font-size:12px;letter-spacing:3px;color:#ef342d;font-weight:bold;padding-bottom:24px">BUZZLY</td></tr>
<tr><td style="font-family:Georgia,serif;font-size:40px;line-height:1.05;padding-bottom:20px">We got your message.<br><em style="color:#ef342d">Talk soon.</em></td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d8d0c3;padding-bottom:16px">Thanks for getting in touch about ${escapeHtml(topic.toLowerCase())}. Someone from the Buzzly team will reply to you personally.</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#d8d0c3;padding-bottom:28px">${escapeHtml(ref)}If you have anything to add, just reply to this email.</td></tr>
<tr><td style="padding-bottom:32px"><a href="${siteUrl}/work" style="background:#ef342d;color:#111;text-decoration:none;font-weight:bold;padding:13px 20px;display:inline-block">See our work ↗</a></td></tr>
<tr><td style="border-top:1px solid #403b38;padding-top:18px;font-size:12px;line-height:1.5;color:#8a847b">Buzzly — building brands through content.<br>You’re receiving this because this address was used on the Buzzly contact form. If that wasn’t you, you can ignore this email.</td></tr>
</table></body></html>`;
  return sendViaResend({ to: [inquiry.email], reply_to: config.to, subject: "We got your message — Buzzly", text, html });
}
