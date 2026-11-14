import { NextResponse, type NextRequest } from "next/server";
import { maintainerToken } from "@/lib/server-env";

const noStore = { "Cache-Control": "no-store" };

/** Constant-time comparison so a wrong token can't be guessed byte by byte from timing. */
async function tokensMatch(a: string, b: string) {
  const encoder = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const va = new Uint8Array(da), vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

/**
 * Guards /api/admin/*. Returns null when the caller is the maintainer, or the
 * response to send otherwise:
 *  - 404 when MAINTAINER_TOKEN is not configured (the routes "don't exist"),
 *  - 401 when the bearer token is missing or wrong.
 */
export async function requireMaintainer(request: NextRequest): Promise<NextResponse | null> {
  const expected = maintainerToken();
  if (!expected) return NextResponse.json({ error: "Not found." }, { status: 404, headers: noStore });
  const header = request.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!presented || !(await tokensMatch(presented, expected))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: { ...noStore, "WWW-Authenticate": "Bearer" } });
  }
  return null;
}

export function adminJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}
