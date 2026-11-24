/**
 * Admin login for the CRM: one password (ADMIN_PASSWORD) and a signed,
 * HttpOnly session cookie that expires after 12 hours. The cookie holds only
 * an expiry and an HMAC signature, never the password.
 */
export const ADMIN_COOKIE = "buzzly_admin";
export const SESSION_SECONDS = 12 * 60 * 60;

const adminPassword = () => process.env.ADMIN_PASSWORD?.trim() || "";
/** Signing key: ADMIN_SESSION_SECRET if set, otherwise derived from the password (so changing it logs everyone out). */
const signingKey = () => process.env.ADMIN_SESSION_SECRET?.trim() || `buzzly-admin:${adminPassword()}`;

export const adminConfigured = () => adminPassword().length >= 12;

const encoder = new TextEncoder();
const toHex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");

async function hmac(message: string, key = signingKey()) {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)));
}

/** Constant-time string comparison via fixed-length digests. */
export async function safeEqual(a: string, b: string) {
  const [da, db] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(a)), crypto.subtle.digest("SHA-256", encoder.encode(b))]);
  const va = new Uint8Array(da), vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

export async function passwordMatches(candidate: string) {
  return adminConfigured() && (await safeEqual(candidate, adminPassword()));
}

export async function createSession(now = Date.now(), key?: string) {
  const expires = String(now + SESSION_SECONDS * 1000);
  return `${expires}.${await hmac(expires, key)}`;
}

export async function verifySession(value: string | undefined, now = Date.now(), key?: string) {
  if (!value || (!key && !adminConfigured())) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return safeEqual(signature, await hmac(expires, key));
}

/** Simple per-instance brake on password guessing: 8 tries per 15 minutes per IP. */
const attempts = new Map<string, { count: number; resetAt: number }>();
export function loginRateLimited(ip: string, now = Date.now()) {
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}
