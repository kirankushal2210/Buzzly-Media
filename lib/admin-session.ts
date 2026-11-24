import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-auth";

const noStore = { "Cache-Control": "no-store" };

export async function isAdmin() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

/** Route-handler guard: null when signed in, otherwise a 401 to return. */
export async function requireAdmin() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "Please sign in." }, { status: 401, headers: noStore });
}

export const adminJson = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** Rejects cross-site writes: browsers always send Origin on these requests. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}
