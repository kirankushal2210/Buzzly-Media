import { fetchErrorCategory, type Inquiry, type SendResult } from "@/lib/email";
import { discordWebhook, slackWebhook } from "@/lib/server-env";
import { siteUrl } from "@/lib/site";

export const interestLabels: Record<string, string> = {
  content: "Content and social media",
  brand: "Brand strategy",
  distribution: "Distribution",
  partnership: "Partnership",
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

async function postJson(url: string, payload: unknown, label: string): Promise<SendResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      console.error(`${label} webhook failed`, response.status);
      return { status: "failed", error: `http_${response.status}` };
    }
    return { status: "sent", id: null };
  } catch (error) {
    const category = fetchErrorCategory(error);
    console.error(`${label} webhook failed`, category);
    return { status: "failed", error: category };
  }
}

export function sendSlack(inquiry: Inquiry, reference: string | null): Promise<SendResult> {
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

export function sendDiscord(inquiry: Inquiry, reference: string | null): Promise<SendResult> {
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
