/**
 * Contact-form rate limits. They are enforced inside the database function
 * submit_inquiry() (supabase/migrations), which counts recent rows by hashed IP
 * and by email, so the limit is shared by every server instance on Vercel.
 * Retries of an already-saved submission are never counted.
 */
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
  return headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("cf-connecting-ip")
    || headers.get("x-real-ip")
    || headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}
