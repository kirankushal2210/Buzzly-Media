import type { Inquiry, SendResult } from "@/lib/email";
import { discordWebhook, leadWebhook, slackWebhook, telegramConfig } from "@/lib/server-env";
import { siteUrl } from "@/lib/site";

export const interestLabels: Record<string, string> = {
  content: "Content and social media",
  brand: "Brand strategy",
  distribution: "Distribution",
  partnership: "Partnership",
  careers: "Joining the team",
  other: "Something else",
};

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Slack mrkdwn: escape control characters so user text can't create links or <!channel> mentions. */
export function escapeSlack(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Discord markdown: neutralise formatting, links and mentions in user text. */
export function escapeDiscord(value: string) {
  return value
    .replace(/([\\`*_~|>#\[\]()-])/g, "\\$1")
    .replace(/@/g, "@​")
    .replace(/https?:\/\//gi, match => match.replace("//", "/​/"));
}

/** Telegram HTML mode: only these three need escaping. */
export function escapeTelegram(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function postJson(url: string, payload: unknown, label: string, headers: Record<string, string> = {}): Promise<SendResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      // Never log the response URL: Telegram and webhook URLs embed secrets.
      const detail = (await response.text()).slice(0, 300);
      console.error(`${label} webhook failed`, response.status, detail);
      return { status: "failed", error: `HTTP ${response.status}: ${detail}` };
    }
    return { status: "sent", id: null };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`${label} webhook failed`, detail);
    return { status: "failed", error: detail };
  }
}

export function sendSlack(inquiry: Inquiry, reference: number | null): Promise<SendResult> {
  const url = slackWebhook();
  if (!url) return Promise.resolve({ status: "skipped" });
  const { name, email, company, interest, message } = inquiry;
  const title = `New Buzzly inquiry${reference ? ` #${reference}` : ""}`;
  return postJson(url, {
    text: `${title} from ${escapeSlack(clip(name, 100))}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: clip(title, 150) } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name*\n${escapeSlack(clip(name, 100))}` },
          { type: "mrkdwn", text: `*Email*\n${escapeSlack(clip(email, 200))}` },
          { type: "mrkdwn", text: `*Company*\n${escapeSlack(clip(company || "—", 120))}` },
          { type: "mrkdwn", text: `*Interest*\n${escapeSlack(interestLabels[interest] ?? interest)}` },
        ],
      },
      { type: "section", text: { type: "mrkdwn", text: `*Message*\n${escapeSlack(clip(message, 2800))}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `Reply to ${escapeSlack(email)} · ${escapeSlack(siteUrl)}/contact` }] },
    ],
    unfurl_links: false,
    unfurl_media: false,
  }, "Slack");
}

export function sendDiscord(inquiry: Inquiry, reference: number | null): Promise<SendResult> {
  const url = discordWebhook();
  if (!url) return Promise.resolve({ status: "skipped" });
  const { name, email, company, interest, message } = inquiry;
  return postJson(url, {
    username: "Buzzly Leads",
    // Never ping @everyone/@here/roles/users, whatever the visitor typed.
    allowed_mentions: { parse: [] },
    embeds: [{
      title: clip(`New Buzzly inquiry${reference ? ` #${reference}` : ""}`, 256),
      color: 0xef342d,
      description: clip(escapeDiscord(message), 4000),
      fields: [
        { name: "Name", value: clip(escapeDiscord(name), 1024), inline: true },
        { name: "Email", value: clip(escapeDiscord(email), 1024), inline: true },
        { name: "Company", value: clip(escapeDiscord(company || "—"), 1024), inline: true },
        { name: "Interest", value: interestLabels[interest] ?? "Other", inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "buzzly contact form" },
    }],
  }, "Discord");
}

/** Telegram bot message to the maintainer's chat. Free, instant on the phone, no email needed. */
export function sendTelegram(inquiry: Inquiry, reference: number | null): Promise<SendResult> {
  const config = telegramConfig();
  if (!config) return Promise.resolve({ status: "skipped" });
  const { name, email, company, interest, message } = inquiry;
  const title = `New Buzzly inquiry${reference ? ` #${reference}` : ""}`;
  const text = [
    `<b>${escapeTelegram(title)}</b>`,
    "",
    `<b>Name:</b> ${escapeTelegram(clip(name, 100))}`,
    `<b>Email:</b> ${escapeTelegram(clip(email, 200))}`,
    `<b>Company:</b> ${escapeTelegram(clip(company || "—", 120))}`,
    `<b>Interest:</b> ${escapeTelegram(interestLabels[interest] ?? interest)}`,
    "",
    `<b>Message:</b>`,
    escapeTelegram(clip(message, 3000)),
    "",
    `Reply to ${escapeTelegram(email)} · ${escapeTelegram(siteUrl)}/contact`,
  ].join("\n");
  return postJson(`https://api.telegram.org/bot${config.token}/sendMessage`, {
    chat_id: config.chatId,
    text: clip(text, 4096), // Telegram's hard limit per message
    parse_mode: "HTML",
    disable_web_page_preview: true,
  }, "Telegram");
}

/**
 * Generic JSON webhook (Google Apps Script, Zapier, Make, n8n…). Sends the
 * plain inquiry so the receiver can append it to a sheet or CRM. If
 * LEAD_WEBHOOK_SECRET is set it is sent as `X-Buzzly-Secret` so the receiver
 * can reject posts that don't come from this site.
 */
export function sendLeadWebhook(inquiry: Inquiry, reference: number | null): Promise<SendResult> {
  const config = leadWebhook();
  if (!config) return Promise.resolve({ status: "skipped" });
  const payload = {
    source: "buzzly-contact-form",
    reference,
    receivedAt: new Date().toISOString(),
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    interest: inquiry.interest,
    interestLabel: interestLabels[inquiry.interest] ?? inquiry.interest,
    message: inquiry.message,
  };
  return postJson(config.url, payload, "Lead webhook", config.secret ? { "X-Buzzly-Secret": config.secret } : {});
}
