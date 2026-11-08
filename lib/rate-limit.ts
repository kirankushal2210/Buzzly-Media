import { and, count, eq, gt } from "drizzle-orm";
import type { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";

type Db = ReturnType<typeof getDb>;

/** Limits for the contact form. Generous for people, tight for scripts. */
export const CONTACT_LIMITS = {
  windowMinutes: 60,
  perIp: 5,
  perEmail: 3,
};

/** Salted SHA-256 so raw IP addresses are never stored. */
export async function hashIp(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function clientIp(headers: Headers) {
  return headers.get("cf-connecting-ip")
    || headers.get("x-real-ip")
    || headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

function windowStart() {
  // SQLite CURRENT_TIMESTAMP format: "YYYY-MM-DD HH:MM:SS" (UTC).
  return new Date(Date.now() - CONTACT_LIMITS.windowMinutes * 60_000).toISOString().replace("T", " ").slice(0, 19);
}

/** Durable limit backed by the inquiries table, so it holds across Worker isolates. */
export async function isRateLimited(db: Db, ipHash: string, email: string) {
  const since = windowStart();
  const [byIp] = await db.select({ n: count() }).from(contactInquiries)
    .where(and(eq(contactInquiries.ipHash, ipHash), gt(contactInquiries.createdAt, since)));
  if ((byIp?.n ?? 0) >= CONTACT_LIMITS.perIp) return true;
  const [byEmail] = await db.select({ n: count() }).from(contactInquiries)
    .where(and(eq(contactInquiries.email, email), gt(contactInquiries.createdAt, since)));
  return (byEmail?.n ?? 0) >= CONTACT_LIMITS.perEmail;
}

/** Best-effort fallback when the database is unavailable: per-isolate memory. */
const memory = new Map<string, number[]>();
export function isRateLimitedInMemory(key: string, limit = CONTACT_LIMITS.perIp) {
  const now = Date.now(), cutoff = now - CONTACT_LIMITS.windowMinutes * 60_000;
  const hits = (memory.get(key) ?? []).filter(time => time > cutoff);
  if (hits.length >= limit) { memory.set(key, hits); return true; }
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.delete(memory.keys().next().value as string);
  return false;
}
