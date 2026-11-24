import type { Metadata } from "next";
import { ContentApprovalBoard } from "@/components/portal/ContentApprovalBoard";
import { SurfaceCard } from "@/components/ui/core";
import { deliverables, formatPortalDate, clientProfile } from "@/data/portal-mock";

export const metadata: Metadata = { title: "Content Queue", description: "Review new cuts, approve them for publishing, or leave timestamped revision notes." };

export default function PortalHome() {
  const reels = clientProfile.quotas.find(quota => quota.id === "reels")!;
  const waiting = deliverables.filter(asset => asset.status === "Needs Review").length;
  return (
    <>
      <section className="portal-hero">
        <div>
          <p className="bz-eyebrow">{clientProfile.planName} · {clientProfile.status}</p>
          <h1>Good to see you, <em>{clientProfile.brandName}.</em></h1>
          <p>{waiting} new {waiting === 1 ? "cut" : "cuts"} arrived for review this week. Approve them for publishing, or leave a timestamped note.</p>
        </div>
        <dl className="portal-stats">
          <SurfaceCard>
            <dt>Monthly quota</dt>
            <dd><strong>{reels.used} of {reels.total}</strong> reels delivered</dd>
            <div className="quota-bar" role="progressbar" aria-label="Reels delivered" aria-valuemin={0} aria-valuemax={reels.total} aria-valuenow={reels.used}><span style={{ width: `${(reels.used / reels.total) * 100}%` }} /></div>
          </SurfaceCard>
          <SurfaceCard>
            <dt>Billing cycle</dt>
            <dd><strong>{formatPortalDate(clientProfile.billingCycle.start)} – {formatPortalDate(clientProfile.billingCycle.end)}</strong></dd>
          </SurfaceCard>
          <SurfaceCard>
            <dt>Next shoot</dt>
            <dd><strong>{formatPortalDate(clientProfile.nextShoot)}</strong></dd>
          </SurfaceCard>
        </dl>
      </section>
      <ContentApprovalBoard initial={deliverables} />
    </>
  );
}
