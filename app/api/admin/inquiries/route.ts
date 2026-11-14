import { desc } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { adminJson, requireMaintainer } from "@/lib/maintainer-auth";

const MAX_LIMIT = 200;

/**
 * Maintainer-only inbox. Lists the newest stored inquiries (Cloudflare D1
 * only; on hosts without a database it says so instead of failing).
 *
 *   curl -H "Authorization: Bearer $MAINTAINER_TOKEN" "https://<site>/api/admin/inquiries?limit=50&full=1"
 *
 * `full=1` includes the message text and delivery diagnostics.
 */
export async function GET(request: NextRequest) {
  const denied = await requireMaintainer(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.get("limit")) || 50));
  const full = params.get("full") === "1";

  let db: ReturnType<typeof getDb>;
  try { db = getDb(); } catch { db = null; }
  if (!db) return adminJson({ storage: "none", inquiries: [], note: "This host has no database; leads are delivered to the configured channels only." });

  try {
    const rows = await db.select().from(contactInquiries).orderBy(desc(contactInquiries.id)).limit(limit);
    const inquiries = rows.map(row => {
      const base = {
        id: row.id,
        createdAt: row.createdAt,
        name: row.name,
        email: row.email,
        company: row.company,
        interest: row.interest,
        status: row.status,
        channels: row.channels ? JSON.parse(row.channels) as Record<string, string> : null,
      };
      return full
        ? { ...base, message: row.message, emailId: row.emailId, emailError: row.emailError, autoReplyStatus: row.autoReplyStatus, emailedAt: row.emailedAt, userAgent: row.userAgent }
        : base;
    });
    return adminJson({ storage: "d1", count: inquiries.length, inquiries });
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 300) : String(error);
    return adminJson({ storage: "d1", error: `Could not read inquiries: ${detail}` }, 500);
  }
}
