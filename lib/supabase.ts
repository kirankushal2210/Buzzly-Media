/**
 * Minimal server-only Supabase client for the inquiries database.
 *
 * Calls the database functions in supabase/migrations through Supabase's REST
 * API (PostgREST) with plain fetch, so it runs unchanged on Vercel (Node) and
 * Cloudflare Workers without an extra dependency.
 *
 * The secret key bypasses Row Level Security. It must only ever be read here,
 * on the server, and must never be given a NEXT_PUBLIC_ name.
 */
import { getEnvVar } from "@/lib/runtime-env";

export type SupabaseConfig = { url: string; key: string };

/** Short, log-safe failure categories; never contain responses, keys or personal data. */
export type DbErrorCode = "not_configured" | "timeout" | "network" | "unauthorized" | "missing_schema" | `http_${number}` | "bad_response";

export class SupabaseError extends Error {
  constructor(readonly code: DbErrorCode) {
    super(`Supabase request failed: ${code}`);
    this.name = "SupabaseError";
  }
}

export function supabaseConfig(): SupabaseConfig | null {
  if (typeof window !== "undefined") throw new Error("lib/supabase.ts is server-only");
  const rawUrl = getEnvVar("SUPABASE_URL");
  // SUPABASE_SECRET_KEY is the current key type (sb_secret_...); the legacy service_role JWT also works.
  const key = getEnvVar("SUPABASE_SECRET_KEY") || getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
  if (!rawUrl || !key) return null;
  try {
    const url = new URL(rawUrl);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".test");
    if (url.protocol !== "https:" && !(local && process.env.NODE_ENV !== "production")) {
      console.error("SUPABASE_URL must use https; ignoring it.");
      return null;
    }
    return { url: url.origin, key };
  } catch {
    console.error("SUPABASE_URL is not a valid URL; ignoring it.");
    return null;
  }
}

/** Call a Postgres function exposed by Supabase. Throws SupabaseError on any failure. */
export async function callRpc<T>(fn: string, args: Record<string, unknown>, timeoutMs = 8000): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new SupabaseError("not_configured");
  const headers: Record<string, string> = { apikey: config.key, "Content-Type": "application/json", Accept: "application/json" };
  // New sb_secret_ keys go in the apikey header only; legacy JWT keys are also sent as a bearer token.
  if (!config.key.startsWith("sb_")) headers.Authorization = `Bearer ${config.key}`;

  let response: Response;
  try {
    response = await fetch(`${config.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers,
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    throw new SupabaseError(name === "TimeoutError" || name === "AbortError" ? "timeout" : "network");
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    if (response.status === 401 || response.status === 403) throw new SupabaseError("unauthorized");
    if (response.status === 404) throw new SupabaseError("missing_schema"); // migration not applied
    throw new SupabaseError(`http_${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try { return JSON.parse(text) as T; } catch { throw new SupabaseError("bad_response"); }
}
