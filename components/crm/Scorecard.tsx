"use client";

import { useEffect, useState } from "react";
import type { WeeklyScorecard } from "@/lib/crm-metrics";
import { date, money, percent } from "@/components/crm/format";
import { Download } from "lucide-react";

const delta = (value: number | null) =>
  value === null ? <span className="crm-muted">—</span>
    : <span className={value > 0 ? "crm-up" : value < 0 ? "crm-down" : "crm-muted"}>{value > 0 ? "▲" : value < 0 ? "▼" : "•"} {percent(Math.abs(value))}</span>;

/** Last 8 weeks side by side, the week-on-week change, and a CSV export. */
export function Scorecard() {
  const [data, setData] = useState<WeeklyScorecard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/crm/scorecard")
      .then(async response => {
        if (response.status === 401) { window.location.assign("/admin/login"); return; }
        const body = await response.json() as { scorecard?: WeeklyScorecard; error?: string };
        if (body.scorecard) setData(body.scorecard); else setError(body.error || "Couldn’t load the scorecard.");
      })
      .catch(() => setError("Couldn’t load the scorecard."));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const header = ["Week starting", "Leads", "Qualified", "Conversion", "Calls held", "Deals won", "Ad spend (INR)", "Cost per lead (INR)"];
    const lines = data.rows.map(r => [r.week, r.leads, r.qualified, r.conversion === null ? "" : (r.conversion * 100).toFixed(1) + "%", r.callsHeld, r.dealsWon, r.spend, r.costPerLead === null ? "" : Math.round(r.costPerLead)].join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `buzzly-scorecard-${data.rows.at(-1)?.week ?? "export"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (error) return <p className="crm-error">{error}</p>;
  if (!data) return <p className="crm-muted">Loading…</p>;
  const last = data.rows.at(-1)!;

  return (
    <section className="crm-section" aria-labelledby="scorecard-title">
      <div className="crm-section-head">
        <div>
          <h2 id="scorecard-title">Weekly scorecard</h2>
          <p className="crm-muted">This week vs last week. Changes show what moved, not why</p>
        </div>
        <button type="button" className="crm-btn" onClick={exportCsv}><Download aria-hidden="true" />Export CSV</button>
      </div>
      <div className="crm-stats crm-stats-5">
        <div className="crm-stat"><span className="crm-stat-label">Leads</span><strong>{last.leads}</strong><small>{delta(data.change.leads)}</small></div>
        <div className="crm-stat"><span className="crm-stat-label">Qualified</span><strong>{last.qualified}</strong><small>{delta(data.change.qualified)}</small></div>
        <div className="crm-stat"><span className="crm-stat-label">Calls held</span><strong>{last.callsHeld}</strong><small>{delta(data.change.callsHeld)}</small></div>
        <div className="crm-stat"><span className="crm-stat-label">Deals won</span><strong>{last.dealsWon}</strong><small>{delta(data.change.dealsWon)}</small></div>
        <div className="crm-stat"><span className="crm-stat-label">Ad spend</span><strong>{money(last.spend)}</strong><small>{delta(data.change.spend)}</small></div>
      </div>
      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead><tr><th scope="col">Week of</th><th scope="col">Leads</th><th scope="col">Qualified</th><th scope="col">Conversion</th><th scope="col">Calls held</th><th scope="col">Deals won</th><th scope="col">Ad spend</th><th scope="col">Cost per lead</th></tr></thead>
          <tbody>
            {[...data.rows].reverse().map(r => (
              <tr key={r.week}>
                <td>{date(r.week)}</td><td>{r.leads}</td><td>{r.qualified}</td><td>{percent(r.conversion, 1)}</td>
                <td>{r.callsHeld}</td><td>{r.dealsWon}</td><td>{money(r.spend)}</td><td>{r.costPerLead === null ? "—" : money(Math.round(r.costPerLead))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
