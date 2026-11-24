import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, SESSION_SECONDS, adminConfigured, createSession, loginRateLimited, passwordMatches } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/admin-session";
import { clientIp } from "@/lib/rate-limit";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request." }, { status: 403, headers: noStore });
  if (!adminConfigured()) return NextResponse.json({ error: "Admin login isn’t set up yet (ADMIN_PASSWORD, at least 12 characters)." }, { status: 503, headers: noStore });
  if (loginRateLimited(clientIp(request.headers))) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429, headers: noStore });

  const body = await request.json().catch(() => ({})) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!(await passwordMatches(password))) return NextResponse.json({ error: "That password isn’t right." }, { status: 401, headers: noStore });

  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
