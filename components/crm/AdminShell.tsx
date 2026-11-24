"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "@/components/Link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Bell, Building2, CalendarCheck, CalendarRange, ChartColumn, ChevronRight, ChevronsLeft, ExternalLink, FlaskConical, Handshake,
  LayoutDashboard, LogOut, Menu, PhoneCall, ScanSearch, Search, Send, Users, X, type LucideIcon,
} from "lucide-react";
import type { CrmSummary } from "@/lib/crm-metrics";
import { Emoji, PAGE_EMOJI } from "@/components/crm/emoji";

/**
 * The CRM workspace: a clean sidebar with every page grouped by job, a toolbar
 * (search, notifications, theme, sign out) and plain cards in Buzzly's colours.
 * Badges and notifications come from real CRM counts only. Styles: app/admin/shell.css (.as-*).
 */
export type ViewLink = { href: string; label: string; icon: LucideIcon; description: string };
type Group = { label: string; views: ViewLink[] };

export const GROUPS: Group[] = [
  { label: "Command", views: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Revenue, pipeline and what needs attention" },
  ] },
  { label: "Sales", views: [
    { href: "/admin/leads", label: "Leads", icon: Users, description: "Everyone who might become a client" },
    { href: "/admin/sales", label: "Sales & calls", icon: Handshake, description: "Pipeline board and every sales call" },
  ] },
  { label: "Clients", views: [
    { href: "/admin/clients", label: "Clients", icon: Building2, description: "Packages, retainers, renewals and monthly content promises" },
    { href: "/admin/content", label: "Content planner", icon: CalendarCheck, description: "What each client was promised, what is posted, and what to do today" },
  ] },
  { label: "Growth", views: [
    { href: "/admin/calling", label: "Cold calling", icon: PhoneCall, description: "Prospects, brand previews and the call copilot" },
    { href: "/admin/outreach", label: "Outreach", icon: Send, description: "Outreach campaigns and creator shortlist" },
    { href: "/admin/research", label: "Research", icon: FlaskConical, description: "Competitor ads and landing-page tests" },
  ] },
  { label: "Performance marketing", views: [
    { href: "/admin/performance", label: "Paid campaigns", icon: ChartColumn, description: "Paid search, paid social, tracked influencers, lead generation, marketplace ads and email" },
  ] },
  { label: "SEO", views: [
    { href: "/admin/seo", label: "SEO keywords", icon: Search, description: "Keywords, target pages and Google positions" },
    { href: "/admin/ai-visibility", label: "AI visibility", icon: ScanSearch, description: "Is Buzzly mentioned in AI answers?" },
  ] },
  { label: "Reports", views: [
    { href: "/admin/scorecard", label: "Weekly scorecard", icon: CalendarRange, description: "Leads, calls, wins and spend, week by week" },
  ] },
];
export const VIEWS = GROUPS.flatMap(g => g.views);

function BuzzlyMark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M38,24 L44,24 L44,45 C47,42 51,40.5 56,40.5 C66,40.5 72,48 72,58 C72,68 65,75.5 55,75.5 C50,75.5 46,73.5 44,70 L44,75 L38,75 Z" fill="currentColor" />
      <polygon points="51,50 51,66 64,58" fill="var(--as-accent-ink)" />
    </svg>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <dialog className="as-dialog" aria-label={title} onClose={onClose}
      ref={d => { if (d && !d.open) { d.showModal(); d.querySelector("input")?.focus(); } }}
      onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
      <div className="as-dialog-inner">
        <div className="as-dialog-head"><h2>{title}</h2>
          <button type="button" className="as-icon" aria-label="Close" onClick={e => e.currentTarget.closest("dialog")?.close()}><X aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

const STORE = "buzzly-crm-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [modal, setModal] = useState<"search" | "notifications" | null>(null);
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(STORE) === "collapsed"); } catch { /* storage blocked */ } // eslint-disable-line react-hooks/set-state-in-effect -- read once
  }, []);
  const toggleCollapsed = () => setCollapsed(c => {
    try { localStorage.setItem(STORE, c ? "open" : "collapsed"); } catch { /* storage blocked */ }
    return !c;
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/crm/summary").catch(() => null);
    const body = await res?.json().catch(() => null) as { summary?: CrmSummary } | null;
    if (body?.summary) setSummary(body.summary);
  }, []);
  useEffect(() => { load(); setDrawer(false); }, [load, pathname]); // eslint-disable-line react-hooks/set-state-in-effect -- refresh per page

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setQuery(""); setModal("search"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Real counts only: what needs a person, shown as badges and in the bell.
  const badges: Record<string, number> = summary ? {
    "/admin/leads": summary.leads.followUpsDue,
    "/admin/sales": summary.calls.upcoming.length,
    "/admin/clients": summary.clients.renewalsNext30,
    "/admin/content": summary.content.due,
    "/admin/performance": summary.performance.alerts.length,
  } : {};
  const attention = summary ? [
    { n: summary.content.due, text: "client content jobs due today", href: "/admin/content" },
    { n: summary.leads.followUpsDue, text: "follow-ups due", href: "/admin/leads" },
    { n: summary.leads.hot, text: "hot leads open", href: "/admin/leads" },
    { n: summary.calls.upcoming.length, text: "sales calls in the next 7 days", href: "/admin/sales" },
    { n: summary.clients.renewalsNext30, text: "renewals within 30 days", href: "/admin/clients" },
    { n: summary.performance.alerts.length, text: "campaigns above target cost", href: "/admin/performance" },
  ].filter(i => i.n > 0) : null;
  const count = attention?.reduce((sum, i) => sum + i.n, 0) ?? 0;

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return VIEWS.filter(v => terms.every(t => `${v.label} ${v.description}`.toLowerCase().includes(t)));
  }, [query]);

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login");
  };

  return (
    <div className={`as-app${collapsed ? " is-collapsed" : ""}${drawer ? " is-drawer" : ""}`}>
      <aside className="as-side" aria-label="CRM navigation">
        <Link href="/admin" className="as-brand">
          <span className="as-logo"><BuzzlyMark /></span>
          <span className="as-brand-text"><strong>Buzzly.</strong><small>CRM workspace</small></span>
        </Link>
        <nav className="as-nav">
          {GROUPS.map(group => (
            <div key={group.label} className="as-group">
              <p className="as-group-label">{group.label}</p>
              {group.views.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} title={collapsed ? label : undefined}>
                  <Icon aria-hidden="true" /><span className="as-nav-text">{label}</span>
                  {badges[href] > 0 && <b className="as-badge" aria-label={`${badges[href]} need attention`}>{badges[href]}</b>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="as-side-foot">
          <Link href="/" target="_blank" title={collapsed ? "View site" : undefined}><ExternalLink aria-hidden="true" /><span className="as-nav-text">View site</span></Link>
          <button type="button" className="as-hide" onClick={toggleCollapsed} aria-expanded={!collapsed} title={collapsed ? "Show sidebar" : undefined}>
            <ChevronsLeft aria-hidden="true" /><span className="as-nav-text">Hide</span>
          </button>
        </div>
      </aside>
      <button type="button" className="as-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawer(false)} />

      <div className="as-main">
        <div className="as-toolbar">
          <button type="button" className="as-icon as-menu" aria-label="Open menu" onClick={() => setDrawer(true)}><Menu aria-hidden="true" /></button>
          <button type="button" className="as-searchbtn" onClick={() => { setQuery(""); setModal("search"); }} aria-label="Search the CRM">
            <Search aria-hidden="true" /><span>Search</span><kbd>Ctrl K</kbd>
          </button>
          <button type="button" className="as-icon" aria-label={`Notifications${count ? `, ${count} items` : ""}`} onClick={() => setModal("notifications")}>
            <Bell aria-hidden="true" />{count > 0 && <i className="as-dot" aria-hidden="true" />}
          </button>
          <ThemeToggle showLabel={false} className="as-icon as-theme" />
          <button type="button" className="as-icon" aria-label="Sign out" title="Sign out" onClick={signOut}><LogOut aria-hidden="true" /></button>
        </div>
        <main className="as-content" key={pathname}>{children}</main>
      </div>

      {modal === "search" && (
        <Dialog title="Go to" onClose={() => setModal(null)}>
          <label className="as-search"><Search aria-hidden="true" />
            <input type="search" placeholder="Find a page" aria-label="Find a CRM page" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && results[0]) { setModal(null); router.push(results[0].href); } }} />
          </label>
          <div className="as-list">
            {results.map(({ href, label, description }) => (
              <button key={href} type="button" onClick={() => { setModal(null); router.push(href); }}>
                <span className="as-tile"><Emoji name={PAGE_EMOJI[href] ?? "pin"} /></span><span><strong>{label}</strong><small>{description}</small></span><ChevronRight aria-hidden="true" />
              </button>
            ))}
            {results.length === 0 && <p className="as-empty" role="status">No matching page</p>}
          </div>
        </Dialog>
      )}
      {modal === "notifications" && (
        <Dialog title="Needs attention" onClose={() => setModal(null)}>
          <div className="as-list">
            {(attention ?? []).map(item => (
              <button key={item.text} type="button" onClick={() => { setModal(null); router.push(item.href); }}>
                <span className="as-tile"><Emoji name={PAGE_EMOJI[item.href] ?? "bell"} /></span><span><strong>{item.n} {item.text}</strong><small>Open {VIEWS.find(v => v.href === item.href)?.label}</small></span><ChevronRight aria-hidden="true" />
              </button>
            ))}
            {attention && attention.length === 0 && <p className="as-empty">You’re all caught up</p>}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default AdminShell;
