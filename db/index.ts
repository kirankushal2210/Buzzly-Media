import { drizzle } from "drizzle-orm/d1";
import { getBinding } from "@/lib/runtime-env";
import * as schema from "./schema";

type D1Database = Parameters<typeof drizzle>[0];

/**
 * Returns the D1-backed database when running on Cloudflare, or null anywhere
 * else (e.g. Vercel). Callers must treat the database as optional.
 */
export function getDb() {
  const binding = getBinding<D1Database>("DB");
  return binding ? drizzle(binding, { schema }) : null;
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
