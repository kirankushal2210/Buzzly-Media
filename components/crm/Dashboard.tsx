"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ENTITY_EMOJI, Emoji } from "@/components/crm/emoji";
import Link from "@/components/Link";
import type { CrmSummary, WeeklyScorecard } from "@/lib/crm-metrics";
import { dateTime, money, number, percent } from "@/components/crm/format";

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = <><span className="crm-stat-label">{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</>;
  return href ? <Link href={href} className="crm-stat">{body}</Link> : <div className="crm-stat">{body}</div>;
}

/** Bars stay neutral; only the row that matters (`highlight`) carries the accent. */
/** Leads vs qualified leads, week by week, as two smooth lines drawn from CRM records. */
function Trend({ rows }: { rows: WeeklyScorecard["rows"] }) {
  const w = 600, h = 180;
  const max = Math.max(4, ...rows.map(r => r.leads)) * 1.15;
  const pts = (key: "leads" | "qualified") => rows.map((r, i) => [i * w / Math.max(1, rows.length - 1), h - (r[key] / max) * h] as const);
  const curve = (p: readonly (readonly [number, number])[]) => p.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = p[i - 1];
    const mx = (x + px) / 2;
    return `${d} C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
  }, "");
  const leads = curve(pts("leads")), qual = curve(pts("qualified"));
  const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return (
    <figure className="gd-trend" aria-label={`Leads per week: ${rows.map(r => `${fmt(r.week)} ${r.leads} leads, ${r.qualified} qualified`).join("; ")}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {[0, 1, 2, 3, 4].map(i => <line key={i} className="grid" x1="0" x2={w} y1={(h * i) / 4} y2={(h * i) / 4} />)}
        <g className="gd-trend-line">
          <path className="area" d={`${qual} L ${w} ${h} L 0 ${h} Z`} />
          <path className="line is-leads" d={leads} />
          <path className="line is-qual" d={qual} />
        </g>
      </svg>
      <div className="gd-trend-axis" aria-hidden="true">{rows.map(r => <span key={r.week}>{fmt(r.week)}</span>)}</div>
    </figure>
  );
}

function Bars({ rows, format = (n: number) => String(n), highlight }: { rows: { label: string; count: number }[]; format?: (n: number) => string; highlight?: string }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <ul className="crm-bars">
      {rows.map(row => (
        <li key={row.label} className={row.label === highlight ? "is-key" : undefined}>
          <span>{row.label}</span>
          <span className="crm-bar"><i style={{ width: `${(row.count / max) * 100}%` }} /></span>
          <b>{format(row.count)}</b>
        </li>
      ))}
    </ul>
  );
}

type Recent = CrmSummary["recent"];

const ENTITY_HREF: Record<string, string> = {
  leads: "/admin/leads", deals: "/admin/sales", calls: "/admin/sales", clients: "/admin/clients",
  prospects: "/admin/calling", outreach: "/admin/outreach", creators: "/admin/outreach",
  campaigns: "/admin/performance", creativeTests: "/admin/performance", adResearch: "/admin/research",
  experiments: "/admin/research", aiChecks: "/admin/ai-visibility", weekly: "/admin/scorecard", content: "/admin/content", seoKeywords: "/admin/seo",
};

function ago(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return dateTime(iso);
}

function RecentActivity({ rows }: { rows: Recent }) {
  const [q, setQ] = useState("");
  const [section, setSection] = useState("All");
  const sections = useMemo(() => ["All", ...Array.from(new Set(rows.map(r => r.section)))], [rows]);
  const shown = rows.filter(r => (section === "All" || r.section === section)
    && `${r.title} ${r.status} ${r.section}`.toLowerCase().includes(q.toLowerCase().trim()));
  return (
    <section className="crm-panel as-card as-recent" aria-labelledby="dash-recent">
      <div className="as-card-head">
        <h3 id="dash-recent">Recent activity</h3>
        {rows.length > 0 && (
          <div className="as-recent-tools">
            <label className="as-mini-search"><Search aria-hidden="true" />
              <input type="search" placeholder="Search" aria-label="Search recent activity" value={q} onChange={e => setQ(e.target.value)} />
            </label>
            <select aria-label="Filter by section" value={section} onChange={e => setSection(e.target.value)}>
              {sections.map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
        )}
      </div>
      {rows.length === 0
        ? <p className="crm-muted">Nothing yet. Add a lead or a prospect to get started.</p>
        : (
          <ul className="as-feed">
            {shown.map(r => {
              return (
                <li key={r.id}>
                  <Link href={ENTITY_HREF[r.entity] ?? "/admin"}>
                    <span className="as-tile"><Emoji name={ENTITY_EMOJI[r.entity] ?? "pin"} /></span>
                    <span className="as-feed-text"><strong>{r.title}</strong><small>{r.section}{r.status ? `, ${r.status}` : ""}</small></span>
                    <time dateTime={r.updatedAt}>{ago(r.updatedAt)}</time>
                  </Link>
                </li>
              );
            })}
            {shown.length === 0 && <li className="crm-muted">No matches</li>}
          </ul>
        )}
    </section>
  );
}

function QuickStats({ summary }: { summary: CrmSummary }) {
  const rows = [
    { label: "Lead win rate", value: summary.leads.winRate },
    { label: "Deal win rate", value: summary.sales.dealWinRate },
    { label: "Call show rate", value: summary.calls.showRate },
    { label: "Outreach reply rate", value: summary.gtm.replyRate },
  ];
  const actions = [
    { label: "Add lead", href: "/admin/leads?add=leads" },
    { label: "Log a call", href: "/admin/sales?add=calls" },
    { label: "Add prospect", href: "/admin/calling?add=prospects" },
    { label: "Plan client content", href: "/admin/content" },
  ];
  return (
    <div className="as-side-stack">
      <section className="crm-panel as-card" aria-labelledby="dash-quick">
        <h3 id="dash-quick">Quick stats</h3>
        <ul className="as-meters">
          {rows.map(r => (
            <li key={r.label}>
              <span>{r.label}</span><b>{percent(r.value, 1)}</b>
              <span className="as-meter" aria-hidden="true"><i style={{ width: `${Math.round((r.value ?? 0) * 100)}%` }} /></span>
            </li>
          ))}
        </ul>
      </section>
      <section className="crm-panel as-card" aria-labelledby="dash-actions">
        <h3 id="dash-actions">Quick actions</h3>
        <div className="as-actions">
          {actions.map(({ label, href }) => <Link key={label} href={href} className="as-action">{label}</Link>)}
        </div>
      </section>
    </div>
  );
}

/** A small line chart with a soft fill and a dot on the latest week, drawn from the CRM's weekly values. */
function Sparkline({ values, tone }: { values: number[]; tone: "ink" | "red" }) {
  const w = 300, h = 64, pad = 6;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i * w) / Math.max(1, values.length - 1), max === min ? h - pad : h - pad - ((v - min) / span) * (h - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  const id = `kpi-fill-${tone}`;
  return (
    <span className={`as-spark is-${tone}`} aria-hidden="true">
      <span className="as-spark-plot">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <i className="as-spark-dot" style={{ left: `${(lx / w) * 100}%`, top: `${(ly / h) * 100}%` }} />
      </span>
    </span>
  );
}

function StatCards({ summary }: { summary: CrmSummary }) {
  const { trends, clients, sales } = summary;
  const thisWeek = (values: number[]) => values[values.length - 1] ?? 0;
  const cards = [
    { label: "Monthly recurring revenue", value: money(clients.mrr), trend: trends.mrr, caption: "vs last week", href: "/admin/clients" },
    { label: "Open pipeline", value: money(sales.pipelineValue), trend: trends.pipeline, caption: "vs last week", href: "/admin/sales" },
    { label: "New leads this week", value: number(thisWeek(trends.leads.values)), trend: trends.leads, caption: "vs last week", href: "/admin/leads" },
    { label: "Sales calls held this week", value: number(thisWeek(trends.calls.values)), trend: trends.calls, caption: "vs last week", href: "/admin/sales" },
  ];
  return (
    <div className="as-stats as-kpis">
      {cards.map(({ label, value, trend, caption, href }) => {
        const down = trend.change !== null && trend.change < 0;
        const flat = trend.change === null || trend.change === 0;
        return (
          <Link key={label} href={href} className="crm-stat as-kpi">
            <span className="as-kpi-label">{label}</span>
            <span className="as-kpi-row">
              <strong>{value}</strong>
              {!flat && (
                <span className={`as-delta${down ? " is-down" : ""}`}>
                  <span aria-hidden="true">{down ? "−" : "+"}</span><span className="sr-only">{down ? "down" : "up"} </span>{Math.abs(trend.change! * 100).toFixed(1)}%
                </span>
              )}
            </span>
            <small>{flat ? "Last 8 weeks" : caption}</small>
            <Sparkline values={trend.values} tone={down ? "red" : "ink"} />
          </Link>
        );
      })}
    </div>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [error, setError] = useState("");
  const [weeks, setWeeks] = useState<WeeklyScorecard["rows"] | null>(null);

  useEffect(() => {
    fetch("/api/crm/scorecard").then(r => r.json() as Promise<{ scorecard?: WeeklyScorecard }>).then(b => setWeeks(b.scorecard?.rows ?? null)).catch(() => setWeeks(null));
  }, []);

  useEffect(() => {
    fetch("/api/crm/summary")
      .then(async response => {
        if (response.status === 401) { window.location.assign("/admin/login"); return; }
        const body = await response.json() as { summary?: CrmSummary; error?: string };
        if (body.summary) setSummary(body.summary); else setError(body.error || "Couldn’t load the dashboard.");
      })
      .catch(() => setError("Couldn’t load the dashboard."));
  }, []);

  if (error) return <p className="crm-error">{error}</p>;
  if (!summary) return <p className="crm-muted">Loading…</p>;
  const { leads, sales, calls, clients, performance, gtm } = summary;

  return (
    <div className="crm-dashboard">
      {(() => {
        // Von Restorff: one strip that stands out, listing only what needs a person today.
        const items = [
          { n: summary.content.due, text: summary.content.due === 1 ? "content job due for clients" : "content jobs due for clients", href: "/admin/content" },
          { n: leads.followUpsDue, text: leads.followUpsDue === 1 ? "follow-up due" : "follow-ups due", href: "/admin/leads" },
          { n: leads.hot, text: leads.hot === 1 ? "hot lead open" : "hot leads open", href: "/admin/leads" },
          { n: calls.upcoming.length, text: calls.upcoming.length === 1 ? "call in the next 7 days" : "calls in the next 7 days", href: "/admin/sales" },
          { n: clients.renewalsNext30, text: clients.renewalsNext30 === 1 ? "renewal within 30 days" : "renewals within 30 days", href: "/admin/clients" },
          { n: performance.alerts.length, text: performance.alerts.length === 1 ? "campaign above target cost" : "campaigns above target cost", href: "/admin/performance" },
        ].filter(item => item.n > 0);
        return (
          <section className={`crm-attention${items.length ? "" : " is-clear"}`} aria-label="Needs attention">
            <span className="crm-attention-title">{items.length ? "Needs attention" : "Nothing needs attention right now"}</span>
            {items.map(item => <Link key={item.text} href={item.href}><b>{item.n}</b> {item.text}</Link>)}
          </section>
        );
      })()}
      <StatCards summary={summary} />

      <div className="as-row">
        <RecentActivity rows={summary.recent} />
        <QuickStats summary={summary} />
      </div>

      {weeks && (
        <section className="crm-panel as-card gd-trend-panel" aria-labelledby="dash-trend">
          <div className="gd-trend-head">
            <h3 id="dash-trend">Leads, last 8 weeks</h3>
            <div className="gd-legend"><span><i />Leads</span><span><i className="is-qual" />Qualified</span><Link href="/admin/scorecard">Weekly scorecard</Link></div>
          </div>
          <Trend rows={weeks} />
        </section>
      )}

      <div className="crm-dash-grid">
        <section className="crm-panel is-wide" aria-labelledby="dash-funnel">
          <h3 id="dash-funnel">Lead funnel</h3>
          <Bars rows={leads.byStatus} highlight="Won" />
          {leads.bySource.length > 0 && <><h4>By source</h4><Bars rows={leads.bySource} /></>}
        </section>

        <section className="crm-panel is-narrow" aria-labelledby="dash-pipeline">
          <h3 id="dash-pipeline">Sales pipeline</h3>
          <Bars rows={sales.byStage.map(s => ({ label: s.label, count: s.value }))} format={money} highlight="Won" />
          <p className="crm-muted">Won so far: {money(sales.wonValue)}. Deal win rate: {percent(sales.dealWinRate)}.</p>
        </section>

        <section className="crm-panel is-wide" aria-labelledby="dash-calls">
          <h3 id="dash-calls">Sales calls, next 7 days</h3>
          {calls.upcoming.length
            ? <ul className="crm-list">{calls.upcoming.map(c => <li key={c.id}><b>{dateTime(c.when)}</b><span>{c.title}</span><small>{c.type}</small></li>)}</ul>
            : <p className="crm-muted">No calls scheduled</p>}
          <p className="crm-muted">Completed this month: {calls.completedThisMonth}. Show rate: {percent(calls.showRate)}.</p>
        </section>

        <section className="crm-panel is-narrow" aria-labelledby="dash-clients">
          <h3 id="dash-clients">Clients</h3>
          <div className="crm-mini">
            <Stat label="Active" value={number(clients.active)} />
            <Stat label="Renewals in 30 days" value={number(clients.renewalsNext30)} />
            <Stat label="Churned" value={number(clients.churned)} />
          </div>
        </section>

        <section className="crm-panel" aria-labelledby="dash-perf">
          <h3 id="dash-perf">Performance marketing</h3>
          <div className="crm-mini">
            <Stat label="Live campaigns" value={number(performance.live)} />
            <Stat label="Spend" value={money(performance.spend)} />
            <Stat label="Leads" value={number(performance.leads)} />
            <Stat label="Cost per lead" value={performance.costPerLead === null ? "—" : money(Math.round(performance.costPerLead))} />
            <Stat label="ROAS" value={performance.roas === null ? "—" : `${performance.roas.toFixed(2)}×`} />
          </div>
          {performance.alerts.length > 0 && (
            <>
              <h4>Above target cost per lead</h4>
              <ul className="crm-alerts">{performance.alerts.map(name => <li key={name}>{name}</li>)}</ul>
              <p className="crm-muted">Flags only. Review before changing a campaign</p>
            </>
          )}
        </section>

        <section className="crm-panel" aria-labelledby="dash-gtm">
          <h3 id="dash-gtm">GTM outreach</h3>
          <div className="crm-mini">
            <Stat label="Running" value={number(gtm.running)} />
            <Stat label="Contacted" value={number(gtm.contacted)} />
            <Stat label="Reply rate" value={percent(gtm.replyRate, 1)} />
            <Stat label="Positive" value={percent(gtm.positiveRate, 1)} />
            <Stat label="Meetings" value={number(gtm.meetings)} hint={gtm.meetingsPer100 === null ? undefined : `${gtm.meetingsPer100.toFixed(1)} per 100 contacted`} />
          </div>
        </section>
      </div>
    </div>
  );
}
