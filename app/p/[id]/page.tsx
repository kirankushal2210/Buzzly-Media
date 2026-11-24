import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { getCrm } from "@/db/crm";
import { isAdmin } from "@/lib/admin-session";
import { gapsList, ideasFor } from "@/lib/outreach";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your brand preview", robots: { index: false, follow: false, nocache: true } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A personal brand preview for one cold-outreach prospect. Reached only by
 * its unguessable link; not in the sitemap, blocked in robots.txt, noindex.
 * Shows only what the team wrote in the CRM plus Buzzly's own ideas.
 */
export default async function BrandPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const crm = await getCrm();
  const record = crm ? await crm.get("prospects", id) : null;
  if (!record || !["Ready", "Sent", "Viewed"].includes(String(record.data.previewStatus))) notFound();

  // First real open (not the Buzzly team checking it) marks the preview as viewed.
  if (crm && !record.data.previewViewedAt && !(await isAdmin())) {
    await crm.update("prospects", id, { ...record.data, previewStatus: "Viewed", previewViewedAt: new Date().toISOString() }).catch(() => null);
  }

  const p = record.data;
  const business = String(p.business);
  const gaps = gapsList(p.brandGaps);
  const ideas = ideasFor(p.category);
  const note = String(p.previewNote ?? "").trim();

  return (
    <Interior eyebrow="BUZZLY / A BRAND PREVIEW" title={`Prepared for ${business}.`} intro="A few honest observations and three ideas we’d start with. Free, and yours to keep, whether or not we work together.">
      <section className="bp-section">
        {note && <p className="bp-note">{note}</p>}
        {gaps.length > 0 && (
          <div className="bp-block">
            <span className="interior-eyebrow">WHAT WE NOTICED</span>
            <ul className="bp-gaps">{gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
          </div>
        )}
        <div className="bp-block">
          <span className="interior-eyebrow">THREE IDEAS FOR {business.toUpperCase()}</span>
          <ol className="bp-ideas">
            {ideas.map((idea, i) => (
              <li key={idea.format} className="bz-card">
                <span className="bz-mono">0{i + 1} · {idea.format}</span>
                <h2>“{idea.hook}”</h2>
                <p>{idea.why}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="bp-block bp-month">
          <span className="interior-eyebrow">WHAT A FIRST MONTH LOOKS LIKE</span>
          <ol>
            <li><b>Listen.</b> A short call about your business, your customers and what you want people to do.</li>
            <li><b>Plan.</b> One clear idea, the platforms and a posting rhythm, agreed with you before anything is booked.</li>
            <li><b>Shoot.</b> On location at your business. You approve every script and every edit.</li>
            <li><b>Publish and learn.</b> We watch what people save and share, and let that shape the next round.</li>
          </ol>
        </div>
        <div className="bp-cta">
          <h2>Like what you see?</h2>
          <p>Reply to the person who sent this, or tell us a little about {business} and we’ll set up a 20-minute call.</p>
          <div className="bp-cta-actions">
            <Link className="cta" href="/contact">Talk to Buzzly ↗</Link>
            <Link className="outlinecta" href="/services#readiness-audit">Get your free Content Engine Score</Link>
          </div>
        </div>
        <p className="bp-fine">Prepared by Buzzly from publicly available information about {business}. Buzzly is not affiliated with {business}.</p>
      </section>
    </Interior>
  );
}
