import type { Metadata } from "next";
import { ReceiptButton } from "@/components/portal/ReceiptButton";
import { RetainerManager } from "@/components/portal/RetainerManager";
import { Badge, SurfaceCard } from "@/components/ui/core";
import { formatPortalDate, formatRupees, invoices, clientProfile, milestones } from "@/data/portal-mock";
import { tierBySlug } from "@/lib/engagements";

export const metadata: Metadata = { title: "Scope & Billing", description: "Your retainer plan, this cycle’s deliverables, production schedule and invoices." };

export default function PortalScope() {
  const tier = tierBySlug(clientProfile.planSlug);
  return (
    <>
      <section className="portal-hero">
        <div>
          <p className="bz-eyebrow">Scope &amp; billing</p>
          <h1>Your retainer, <em>in the open.</em></h1>
          <p>What your plan includes, what has been delivered this cycle, and what is coming next.</p>
        </div>
      </section>

      <div className="scope-grid">
        <SurfaceCard as="section" className="plan-card" aria-labelledby="plan-title">
          <div className="plan-card-top">
            <span className="bz-mono">Current tier</span>
            <Badge tone="cream">{clientProfile.status}</Badge>
          </div>
          <h2 id="plan-title">{clientProfile.planName}</h2>
          {tier && <p>{tier.summary}</p>}
          <dl className="plan-facts">
            <div><dt>Billing cycle</dt><dd>{formatPortalDate(clientProfile.billingCycle.start)} – {formatPortalDate(clientProfile.billingCycle.end)}</dd></div>
            <div><dt>Next renewal</dt><dd>{formatPortalDate(clientProfile.nextRenewal)}</dd></div>
            <div><dt>Account lead</dt><dd>{clientProfile.strategistRole}</dd></div>
          </dl>
          <RetainerManager currentSlug={clientProfile.planSlug} />
        </SurfaceCard>

        <SurfaceCard as="section" className="portal-panel quota-panel" aria-labelledby="quota-title">
          <div className="portal-panel-head">
            <h2 id="quota-title">This cycle’s deliverables</h2>
            <Badge>{formatPortalDate(clientProfile.billingCycle.end)} close</Badge>
          </div>
          <ul className="quota-list">
            {clientProfile.quotas.map(quota => {
              const complete = quota.used >= quota.total;
              return (
                <li key={quota.id}>
                  <div className="quota-row"><span>{quota.label}</span><strong>{quota.used}/{quota.total}{complete && <span className="quota-done"> · Complete</span>}</strong></div>
                  <div className={`quota-bar${complete ? " is-complete" : ""}`} role="progressbar" aria-label={quota.label} aria-valuemin={0} aria-valuemax={quota.total} aria-valuenow={quota.used}>
                    <span style={{ width: `${Math.min(100, (quota.used / quota.total) * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard as="section" className="portal-panel" aria-labelledby="schedule-title">
        <div className="portal-panel-head"><h2 id="schedule-title">Production schedule</h2><Badge>Next 2 weeks</Badge></div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead><tr><th scope="col">Date</th><th scope="col">Milestone</th><th scope="col">Type</th></tr></thead>
            <tbody>
              {milestones.map(item => (
                <tr key={item.id}>
                  <td className="nowrap">{formatPortalDate(item.date)}</td>
                  <th scope="row"><span>{item.label}</span></th>
                  <td><Badge tone={item.kind === "Shoot" ? "accent" : "neutral"}>{item.kind}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard as="section" className="portal-panel" aria-labelledby="invoices-title">
        <div className="portal-panel-head"><h2 id="invoices-title">Invoices</h2><Badge tone="muted">Sample amounts</Badge></div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead><tr><th scope="col">Invoice</th><th scope="col">Period</th><th scope="col">Issued</th><th scope="col" className="num">Amount</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Receipt</span></th></tr></thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="mono">{invoice.id}</td>
                  <th scope="row"><span>{invoice.period}</span></th>
                  <td className="nowrap">{formatPortalDate(invoice.issuedOn)}</td>
                  <td className="num">{formatRupees(invoice.amount)}</td>
                  <td><Badge tone={invoice.status === "Paid" ? "cream" : "accent"}>{invoice.status}</Badge></td>
                  <td className="num"><ReceiptButton invoice={invoice} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </>
  );
}
