import { getEnvVar } from "@/lib/runtime-env";

type StringVar =
  | "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL"
  | "SLACK_WEBHOOK_URL" | "DISCORD_WEBHOOK_URL"
  | "TELEGRAM_BOT_TOKEN" | "TELEGRAM_CHAT_ID"
  | "LEAD_WEBHOOK_URL" | "LEAD_WEBHOOK_SECRET"
  | "CONTACT_AUTO_REPLY" | "CONTACT_IP_SALT" | "MAINTAINER_TOKEN";

export function serverVar(name: StringVar): string | undefined {
  return getEnvVar(name);
}

export function emailConfig() {
  const apiKey = serverVar("RESEND_API_KEY");
  const to = serverVar("CONTACT_TO_EMAIL");
  const from = serverVar("CONTACT_FROM_EMAIL");
  return apiKey && to && from ? { apiKey, to, from } : null;
}

/** Only real Slack/Discord webhook hosts are accepted (plus localhost outside production, for testing). */
function webhookUrl(name: "SLACK_WEBHOOK_URL" | "DISCORD_WEBHOOK_URL", allowedHosts: string[], pathPrefix: string) {
  const raw = serverVar(name);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = process.env.NODE_ENV !== "production" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (local) return url.toString();
    if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname) || !url.pathname.startsWith(pathPrefix)) {
      console.error(`${name} is not a valid webhook URL; ignoring it.`);
      return null;
    }
    return url.toString();
  } catch {
    console.error(`${name} is not a valid URL; ignoring it.`);
    return null;
  }
}

export function slackWebhook() {
  return webhookUrl("SLACK_WEBHOOK_URL", ["hooks.slack.com"], "/services/");
}

export function discordWebhook() {
  return webhookUrl("DISCORD_WEBHOOK_URL", ["discord.com", "discordapp.com", "ptb.discord.com", "canary.discord.com"], "/api/webhooks/");
}

/**
 * Telegram bot delivery: create a bot with @BotFather (token), message it once,
 * then read your chat id from https://api.telegram.org/bot<token>/getUpdates.
 * No email account or domain needed.
 */
export function telegramConfig() {
  const token = serverVar("TELEGRAM_BOT_TOKEN");
  const chatId = serverVar("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return null;
  // Token shape: "<digits>:<35 url-safe chars>"; chat ids are integers (negative for groups).
  if (!/^\d+:[A-Za-z0-9_-]{30,}$/.test(token) || !/^-?\d+$/.test(chatId)) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID looks malformed; ignoring Telegram.");
    return null;
  }
  return { token, chatId };
}

/**
 * Generic JSON webhook owned by the maintainer (Google Apps Script, Zapier,
 * Make, n8n, Airtable automation…). Lets leads be stored in a spreadsheet on
 * hosts without a database. HTTPS only; localhost allowed outside production.
 */
export function leadWebhook() {
  const raw = serverVar("LEAD_WEBHOOK_URL");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = process.env.NODE_ENV !== "production" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (!local && url.protocol !== "https:") {
      console.error("LEAD_WEBHOOK_URL must use https; ignoring it.");
      return null;
    }
    return { url: url.toString(), secret: serverVar("LEAD_WEBHOOK_SECRET") ?? null };
  } catch {
    console.error("LEAD_WEBHOOK_URL is not a valid URL; ignoring it.");
    return null;
  }
}

/** Which lead channels are configured (names only, never secrets). */
export function leadChannels() {
  return {
    email: Boolean(emailConfig()),
    slack: Boolean(slackWebhook()),
    discord: Boolean(discordWebhook()),
    telegram: Boolean(telegramConfig()),
    webhook: Boolean(leadWebhook()),
  };
}

/** True when at least one place can receive a lead. */
export function anyLeadChannel() {
  return Object.values(leadChannels()).some(Boolean);
}

/** Bearer token that unlocks /api/admin/*. Unset means those routes don't exist (404). */
export function maintainerToken() {
  const token = serverVar("MAINTAINER_TOKEN");
  return token && token.length >= 16 ? token : null;
}

/** Customer confirmation emails are off unless CONTACT_AUTO_REPLY is "true". */
export function autoReplyEnabled() {
  return serverVar("CONTACT_AUTO_REPLY")?.toLowerCase() === "true";
}

/** Salt for hashing IPs. Set CONTACT_IP_SALT in production; the fallback only keeps local dev working. */
export function ipSalt() {
  return serverVar("CONTACT_IP_SALT") || "buzzly-local-dev-salt";
}
