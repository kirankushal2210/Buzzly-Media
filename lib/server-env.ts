import { env } from "cloudflare:workers";

type StringVar = "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL" | "CONTACT_AUTO_REPLY" | "CONTACT_IP_SALT";

/** Reads a secret/var from the Worker environment, falling back to process.env (local .env files). */
export function serverVar(name: StringVar): string | undefined {
  const fromWorker = (env as unknown as Record<string, unknown>)[name];
  if (typeof fromWorker === "string" && fromWorker.trim()) return fromWorker.trim();
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return fromProcess?.trim() || undefined;
}

export function emailConfig() {
  const apiKey = serverVar("RESEND_API_KEY");
  const to = serverVar("CONTACT_TO_EMAIL");
  const from = serverVar("CONTACT_FROM_EMAIL");
  return apiKey && to && from ? { apiKey, to, from } : null;
}

/** Customer confirmation emails are on unless CONTACT_AUTO_REPLY is "false". */
export function autoReplyEnabled() {
  return serverVar("CONTACT_AUTO_REPLY")?.toLowerCase() !== "false";
}

/** Salt for hashing IPs. Set CONTACT_IP_SALT in production; the fallback only keeps local dev working. */
export function ipSalt() {
  return serverVar("CONTACT_IP_SALT") || "buzzly-local-dev-salt";
}
