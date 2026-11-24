import type { Metadata } from "next";
import { RetentionChart } from "@/components/portal/RetentionChart";
import { Badge, SurfaceCard } from "@/components/ui/core";
import { formatPortalDate, analytics } from "@/data/portal-mock";

export const metadata: Metadata = { title: "Distribution & Retention", description: "Hook hold rate, organic reach, funnel clicks and retention for your published content." };

const number = new Intl.NumberFormat("en-IN");

export default function PortalAnalytics() {
  const ranked = [...analytics.topAssets].sort((a, b) => b.hookHold - a.hookHold);
  return (
    <>
      <section className="portal-hero">
        <div>
          <p className="bz-eyebrow">Distribution &amp; retention · last 30 days</p>
          <h1>Content is <em>the distribution.</em></h1>
          <p>What people watched, how long they stayed, and how many came looking for you afterwards.</p>
        </div>
      </section>

      <section aria-label="Key metrics" className="kpi-grid">
        {analytics.kpis.map(kpi => (
          <SurfaceCard key={kpi.id} className="kpi">
            <span className="bz-mono">{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <span className={`kpi-delta${kpi.delta >= 0 ? " is-up" : " is-down"}`}>
              <span aria-hidden="true">{kpi.delta >= 0 ? "▲" : "▼"}</span>
              <span className="sr-only">{kpi.delta >= 0 ? "Up" : "Down"}</span>
              {Math.abs(kpi.delta)}{kpi.deltaUnit === "%" ? "%" : " pts"} <small>{kpi.note}</small>
            </span>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard as="section" className="portal-panel" aria-labelledby="retention-title">
        <div className="portal-panel-head">
          <h2 id="retention-title">Retention drop-off</h2>
          <Badge>Avg. across reels</Badge>
        </div>
        <p className="portal-panel-lede">The first three seconds decide whether the rest is seen. The shaded band is the hook window.</p>
        <RetentionChart />
      </SurfaceCard>

      <SurfaceCard as="section" className="portal-panel" aria-labelledby="top-assets-title">
        <div className="portal-panel-head">
          <h2 id="top-assets-title">Top-performing assets</h2>
          <Badge>Ranked by hook hold</Badge>
        </div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr><th scope="col">#</th><th scope="col">Asset</th><th scope="col">Platform</th><th scope="col" className="num">3-sec hold</th><th scope="col" className="num">Avg. watch</th><th scope="col" className="num">Link clicks</th></tr>
            </thead>
            <tbody>
              {ranked.map((asset, index) => (
                <tr key={asset.id}>
                  <td className="rank">{String(index + 1).padStart(2, "0")}</td>
                  <th scope="row"><span>{asset.title}</span><small>Published {formatPortalDate(asset.publishedOn)}</small></th>
                  <td>{asset.platform}</td>
                  <td className="num"><span className="hold-bar" style={{ ["--hold" as string]: `${asset.hookHold}%` }}>{asset.hookHold}%</span></td>
                  <td className="num">{asset.avgWatchSeconds}s</td>
                  <td className="num">{number.format(asset.linkClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </>
  );
}
