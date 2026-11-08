/**
 * Platform-neutral access to environment values and bindings.
 *
 * App code never imports `cloudflare:workers`, so it builds and runs on Vercel
 * (plain Next.js) as well as on Cloudflare (vinext). On Cloudflare,
 * worker/index.ts calls `setPlatformEnv(env)` per request so D1 and Worker
 * secrets are visible here; everywhere else `process.env` is used.
 */
const KEY = Symbol.for("buzzly.platformEnv");
type Store = { [KEY]?: Record<string, unknown> };

export function setPlatformEnv(env: unknown) {
  (globalThis as Store)[KEY] = env as Record<string, unknown>;
}

/** A platform binding such as a Cloudflare D1 database, or undefined off-Cloudflare. */
export function getBinding<T>(name: string): T | undefined {
  return (globalThis as Store)[KEY]?.[name] as T | undefined;
}

/** A string setting from platform env (Worker vars/secrets) or process.env (Vercel, .env files). */
export function getEnvVar(name: string): string | undefined {
  const fromPlatform = (globalThis as Store)[KEY]?.[name];
  if (typeof fromPlatform === "string" && fromPlatform.trim()) return fromPlatform.trim();
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return fromProcess?.trim() || undefined;
}
