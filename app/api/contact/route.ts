import { NextRequest, NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedInterests = new Set(["content", "brand", "distribution", "partnership", "other"]);

export function GET() {
  const ready = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL);
  return NextResponse.json({ ready }, { headers: { "Cache-Control": "no-store" } });
}

function stringField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length <= max ? clean : null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] || ch);
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8000) return NextResponse.json({ error: "Message is too long." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  const name = stringField(body.name, 100), email = stringField(body.email, 200), company = stringField(body.company, 120) ?? "", interest = stringField(body.interest, 30), message = stringField(body.message, 5000);
  if (!name || name.length < 2 || !email || !emailPattern.test(email) || !interest || !allowedInterests.has(interest) || !message || message.length < 20) return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return NextResponse.json({ error: "The contact form is being configured. Please try again later." }, { status: 503 });
  const html = `<h1>New Buzzly inquiry</h1><p><b>Name:</b> ${escapeHtml(name)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Company:</b> ${escapeHtml(company)}</p><p><b>Interest:</b> ${escapeHtml(interest)}</p><p><b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`;
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: CONTACT_FROM_EMAIL, to: [CONTACT_TO_EMAIL], reply_to: email, subject: `Buzzly inquiry: ${name}`, html }), cache: "no-store" });
    if (!response.ok) { console.error("Contact delivery failed", response.status); return NextResponse.json({ error: "Your message could not be sent. Please try again." }, { status: 502 }); }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Your message could not be sent. Please try again." }, { status: 502 }); }
}
