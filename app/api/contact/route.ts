import { NextRequest, NextResponse } from "next/server";
import type { Inquiry } from "@/lib/email";
import { notifyInquiry, saveInquiry } from "@/lib/inquiries";
import { validateInquiry } from "@/lib/inquiry-validation";
import { clientIp, hashIp } from "@/lib/rate-limit";
import { ipSalt } from "@/lib/server-env";
import { SupabaseError, supabaseConfig } from "@/lib/supabase";

const MAX_BODY_BYTES = 8000;
const noStore = { "Cache-Control": "no-store" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...noStore, ...headers } });
}

/** The form can accept inquiries only when the database is configured. */
export function GET() {
  return json({ ready: Boolean(supabaseConfig()) });
}

/** Rejects cross-site submissions (CSRF): browsers always send Origin on POST fetches. */
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still validated and rate limited
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}

const errorCode = (error: unknown) => (error instanceof SupabaseError ? error.code : "unexpected");

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

  if (!supabaseConfig()) return json({ error: "Our inbox is being set up. Please try again a little later." }, 503);

  // The browser sends one key per submission attempt and reuses it on retry, so a retry
  // returns the original result instead of saving or notifying twice. Callers without a
  // key (non-browser clients) get a fresh one: no retry protection, everything else applies.
  const idempotencyKey = typeof body.idempotencyKey === "string" && UUID.test(body.idempotencyKey)
    ? body.idempotencyKey.toLowerCase()
    : crypto.randomUUID();
  const ipHash = await hashIp(clientIp(request.headers), ipSalt());

  // 1. Save first. Nothing is reported as received until the database confirms it.
  let saved: Awaited<ReturnType<typeof saveInquiry>>;
  try {
    saved = await saveInquiry(inquiry, idempotencyKey, ipHash);
  } catch (error) {
    console.error("Contact inquiries: save failed", errorCode(error));
    return json({ error: "We couldn’t save your message just now, so nothing was sent. Please try again in a moment." }, 503);
  }

  if (saved.outcome === "rate_limited") {
    return json({ error: "You’ve sent several messages in a short time. Please try again in an hour." }, 429, { "Retry-After": "3600" });
  }
  if (saved.outcome === "key_conflict" || !saved.id) {
    return json({ error: "This form was already submitted with different details. Please refresh the page and try again." }, 409);
  }

  // 2. Notify. The inquiry is already stored, so a failure here is recorded, not surfaced as an error.
  try {
    const outcome = await notifyInquiry(inquiry, saved.id);
    if (outcome === "failed") console.error("Contact inquiries: notification failed; inquiry is saved", { outcome });
  } catch (error) {
    console.error("Contact inquiries: notification step errored; inquiry is saved", errorCode(error));
  }

  // The message is stored with Buzzly. This deliberately makes no claim about email delivery.
  return json({ ok: true, received: true });
}
