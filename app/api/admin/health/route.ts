import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { adminJson, requireMaintainer } from "@/lib/maintainer-auth";
import { autoReplyEnabled, leadChannels, serverVar } from "@/lib/server-env";
import { bookingUrl, responsePromise, siteUrl, siteUrlSource, socialLinks, whatsappNumber } from "@/lib/site";

/**
 * Maintainer-only configuration check. Reports what is configured, never the
 * secret values. Use it after every deploy (see docs/10 runbook).
 *
 *   curl -H "Authorization: Bearer $MAINTAINER_TOKEN" https://<site>/api/admin/health
 */
export async function GET(request: NextRequest) {
  const denied = await requireMaintainer(request);
  if (denied) return denied;

  let storage: "d1" | "none" = "none";
  let dbUsable = false;
  let dbError: string | null = null;
  try {
    const db = getDb();
    if (db) {
      storage = "d1";
      await db.select({ id: contactInquiries.id }).from(contactInquiries).limit(1);
      dbUsable = true;
    }
  } catch (error) {
    dbError = error instanceof Error ? error.message.slice(0, 300) : String(error);
  }

  const channels = leadChannels();
  const anyChannel = Object.values(channels).some(Boolean);
  const canReceiveLeads = anyChannel || dbUsable;
  const warnings: string[] = [];
  if (!canReceiveLeads) warnings.push("No lead channel configured and no usable database: the contact form will refuse submissions.");
  if (storage === "d1" && !dbUsable) warnings.push("D1 binding present but the contact_inquiries table is not usable: apply the drizzle/ migrations.");
  if (storage === "none" && Object.values(channels).filter(Boolean).length < 2) warnings.push("No database on this host: configure at least two channels so one failure never loses a lead.");
  if (autoReplyEnabled() && !channels.email) warnings.push("CONTACT_AUTO_REPLY is on but email is not configured; no confirmations will be sent.");
  if (!serverVar("CONTACT_IP_SALT")) warnings.push("CONTACT_IP_SALT is unset; using the development fallback salt.");
  if (siteUrlSource !== "env") warnings.push(`NEXT_PUBLIC_SITE_URL is unset: canonical URLs, sitemap and share cards use ${siteUrl} (${siteUrlSource}). Set it to the real domain and redeploy.`);
  if (!bookingUrl) warnings.push("NEXT_PUBLIC_BOOKING_URL unset: the intro-call button is hidden.");
  if (!whatsappNumber) warnings.push("NEXT_PUBLIC_WHATSAPP_NUMBER unset: the WhatsApp button is hidden.");

  return adminJson({
    ok: canReceiveLeads,
    checkedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    siteUrl,
    siteUrlSource,
    leads: { canReceiveLeads, channels, storage, dbUsable, dbError, autoReply: autoReplyEnabled() },
    publicSettings: { bookingUrl, whatsappConfigured: Boolean(whatsappNumber), socialLinks, responsePromise },
    warnings,
  });
}
