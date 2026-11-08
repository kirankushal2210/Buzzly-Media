import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { sendAutoReply, sendInboxNotification, type Inquiry } from "@/lib/email";
import { clientIp, hashIp, isRateLimited, isRateLimitedInMemory } from "@/lib/rate-limit";
import { autoReplyEnabled, emailConfig, ipSalt } from "@/lib/server-env";

const MAX_BODY_BYTES = 8000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedInterests = new Set(["content", "brand", "distribution", "partnership", "other"]);
const noStore = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...noStore, ...headers } });
}

function tryGetDb() {
  try { return getDb(); } catch (error) {
    console.error("Contact inquiries: database unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}

/** The form is usable when inquiries can be stored or emailed. */
export function GET() {
  return json({ ready: Boolean(tryGetDb() || emailConfig()) });
}

function stringField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length <= max ? clean : null;
}

/** Rejects cross-site submissions: browsers always send Origin on POST fetches. */
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited
  try { return new URL(origin).host === (request.headers.get("x-forwarded-host") || request.headers.get("host")); } catch { return false; }
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Invalid request." }, 415);
  if (!sameOrigin(request)) return json({ error: "Invalid request." }, 403);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return json({ error: "Message is too long." }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "Message is too long." }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "Invalid request." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
  if (body.website) return json({ ok: true }); // honeypot: pretend success to bots

  const name = stringField(body.name, 100), email = stringField(body.email, 200)?.toLowerCase(), company = stringField(body.company, 120) ?? "", interest = stringField(body.interest, 30), message = stringField(body.message, 5000);
  if (!name || name.length < 2 || !email || !emailPattern.test(email) || !interest || !allowedInterests.has(interest) || !message || message.length < 20) {
    return json({ error: "Please complete the required fields." }, 400);
  }
  const inquiry: Inquiry = { name, email, company, interest, message };
  const ipHash = await hashIp(clientIp(request.headers), ipSalt());
  const db = tryGetDb();

  // 0. Rate limit: durable via the inquiries table, or per-isolate memory if the DB is down.
  let limited = false;
  try {
    limited = db ? await isRateLimited(db, ipHash, email) : isRateLimitedInMemory(ipHash);
  } catch (error) {
    console.error("Contact inquiries: rate-limit check failed", error instanceof Error ? error.message : error);
    limited = isRateLimitedInMemory(ipHash);
  }
  if (limited) return json({ error: "Too many messages in a short time. Please try again in an hour, or email us directly." }, 429, { "Retry-After": "3600" });

  // 1. Persist first, so the lead survives any email failure.
  let id: number | null = null;
  if (db) {
    try {
      const [row] = await db.insert(contactInquiries)
        .values({ ...inquiry, ipHash, userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null })
        .returning({ id: contactInquiries.id });
      id = row?.id ?? null;
    } catch (error) {
      console.error("Contact inquiries: insert failed", error instanceof Error ? error.message : error);
    }
  }

  // 2. Notify the inbox, then confirm to the customer (only once we actually have the inquiry).
  const notification = await sendInboxNotification(inquiry, id);
  const received = id !== null || notification.status === "sent";
  const autoReply = received && autoReplyEnabled() ? await sendAutoReply(inquiry, id) : { status: "skipped" as const };

  // 3. Record delivery outcomes against the stored inquiry.
  if (db && id !== null) {
    try {
      await db.update(contactInquiries).set({
        status: notification.status === "sent" ? "emailed" : notification.status === "failed" ? "email_failed" : "email_skipped",
        emailId: notification.status === "sent" ? notification.id : null,
        emailError: notification.status === "failed" ? notification.error.slice(0, 1000) : null,
        emailedAt: notification.status === "sent" ? new Date().toISOString() : null,
        autoReplyStatus: autoReply.status,
      }).where(eq(contactInquiries.id, id));
    } catch (error) {
      console.error("Contact inquiries: status update failed", error instanceof Error ? error.message : error);
    }
  }

  if (received) return json({ ok: true, reference: id, confirmationSent: autoReply.status === "sent" });
  if (notification.status === "skipped") return json({ error: "The contact form is being configured. Please try again later." }, 503);
  return json({ error: "Your message could not be sent. Please try again." }, 502);
}
