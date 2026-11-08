import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { sendAutoReply, sendInboxNotification, type Inquiry, type SendResult } from "@/lib/email";
import { validateInquiry } from "@/lib/inquiry-validation";
import { sendDiscord, sendSlack } from "@/lib/notify";
import { CONTACT_LIMITS, clientIp, hashIp, isRateLimited, isRateLimitedInMemory } from "@/lib/rate-limit";
import { anyLeadChannel, autoReplyEnabled, ipSalt } from "@/lib/server-env";

const MAX_BODY_BYTES = 8000;
const noStore = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...noStore, ...headers } });
}

/** D1 on Cloudflare; null on Vercel, where leads go to email/Slack/Discord only. */
function tryGetDb() {
  try { return getDb(); } catch (error) {
    console.error("Contact inquiries: database unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}

/** The form is usable when leads can be stored or delivered somewhere. */
export function GET() {
  return json({ ready: Boolean(tryGetDb() || anyLeadChannel()) });
}

/** Rejects cross-site submissions (CSRF): browsers always send Origin on POST fetches. */
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still validated and rate limited
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}

const statusOf = (result: SendResult) => result.status;

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Invalid request." }, 415);
  if (!sameOrigin(request)) return json({ error: "Invalid request." }, 403);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return json({ error: "Your message is too long." }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "Your message is too long." }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "Invalid request." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);

  // Honeypot: real people never see the "website" field. Pretend success, do no work.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  const validation = validateInquiry(body);
  if (!validation.ok) return json({ error: "Please check the highlighted fields.", fields: validation.errors }, 400);
  const inquiry: Inquiry = validation.value;

  const db = tryGetDb();
  const ipHash = await hashIp(clientIp(request.headers), ipSalt());

  // Rate limit: durable via D1 when available, otherwise per-instance memory (see BUZZLY_HANDOFF.md).
  // Same limits either way: 5 per IP and 3 per email address per 60 minutes.
  const inMemoryLimited = () =>
    isRateLimitedInMemory(`ip:${ipHash}`, CONTACT_LIMITS.perIp) || isRateLimitedInMemory(`email:${inquiry.email}`, CONTACT_LIMITS.perEmail);
  let limited: boolean;
  try {
    limited = db ? await isRateLimited(db, ipHash, inquiry.email) : inMemoryLimited();
  } catch (error) {
    // Database busy or unreachable: fall back to the in-memory sliding window.
    console.error("Contact inquiries: rate-limit check failed", error instanceof Error ? error.message : error);
    limited = inMemoryLimited();
  }
  if (limited) return json({ error: "You’ve sent several messages in a short time. Please try again in an hour." }, 429, { "Retry-After": "3600" });

  // 1. Store first when a database exists, so the lead survives delivery failures.
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

  // 2. Deliver to every configured channel in parallel.
  const [email, slack, discord] = await Promise.all([
    sendInboxNotification(inquiry, id),
    sendSlack(inquiry, id),
    sendDiscord(inquiry, id),
  ]);
  const delivered = [email, slack, discord].some(result => result.status === "sent");
  const received = id !== null || delivered;
  if (!delivered) console.error("Contact inquiries: no channel delivered this lead", { email: email.status, slack: slack.status, discord: discord.status, stored: id !== null });

  // 3. Optional customer confirmation (off by default; see CONTACT_AUTO_REPLY).
  const autoReply: SendResult = received && autoReplyEnabled() ? await sendAutoReply(inquiry, id) : { status: "skipped" };

  // 4. Record outcomes against the stored inquiry.
  if (db && id !== null) {
    try {
      await db.update(contactInquiries).set({
        status: email.status === "sent" ? "emailed" : email.status === "failed" ? "email_failed" : "email_skipped",
        emailId: email.status === "sent" ? email.id : null,
        emailError: email.status === "failed" ? email.error.slice(0, 1000) : null,
        emailedAt: email.status === "sent" ? new Date().toISOString() : null,
        autoReplyStatus: autoReply.status,
        channels: JSON.stringify({ email: statusOf(email), slack: statusOf(slack), discord: statusOf(discord) }),
      }).where(eq(contactInquiries.id, id));
    } catch (error) {
      console.error("Contact inquiries: status update failed", error instanceof Error ? error.message : error);
    }
  }

  if (received) return json({ ok: true });
  if (!anyLeadChannel()) return json({ error: "Our inbox is being set up. Please try again a little later." }, 503);
  return json({ error: "We couldn’t send your message just now. Please try again in a moment." }, 502);
}
