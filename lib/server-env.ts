import { getEnvVar } from "@/lib/runtime-env";

type StringVar =
  | "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL"
  | "SLACK_WEBHOOK_URL" | "DISCORD_WEBHOOK_URL"
  | "CONTACT_AUTO_REPLY" | "CONTACT_IP_SALT";
// Supabase settings are read in lib/supabase.ts.

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

/** True when at least one place can receive a lead. */
export function anyLeadChannel() {
  return Boolean(emailConfig() || slackWebhook() || discordWebhook());
}

/** Visitor confirmation emails are on whenever email is configured, unless CONTACT_AUTO_REPLY is "false". */
export function confirmationEnabled() {
  return serverVar("CONTACT_AUTO_REPLY")?.toLowerCase() !== "false";
}

/** Salt for hashing IPs. Set CONTACT_IP_SALT in production; the fallback only keeps local dev working. */
export function ipSalt() {
  return serverVar("CONTACT_IP_SALT") || "buzzly-local-dev-salt";
}
