import { DEAL_STAGES, LEAD_ROUTING, LEAD_STATUSES, PACKAGES, SOURCES, entities, type CrmRecord, type EntityKey } from "@/lib/crm-config";
import { istToday, tasksDue } from "@/lib/content-plan";

const num = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);
const str = (value: unknown) => (typeof value === "string" ? value : "");
export const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : null);

const countBy = (records: CrmRecord[], key: string, order: readonly string[]) =>
  order.map(label => ({ label, count: records.filter(record => record.data[key] === label).length }));

export type LeadScore = "Hot" | "Warm" | "Cold";

/**
 * Rule-based lead score from what the lead told us. Transparent on purpose:
 * budget (0–3) + timeline (0–3) + decision-maker (2) + focus industry (1) + referral (1).
 * Hot = 7+, Warm = 4–6, Cold = under 4.
 */
export function leadScore(data: Record<string, string | number>): { score: LeadScore; points: number } {
  const budget: Record<string, number> = { "Over ₹1L/month": 3, "₹50k–1L/month": 3, "₹25k–50k/month": 2, "Under ₹25k/month": 1 };
  const timeline: Record<string, number> = { "This month": 3, "1–3 months": 2, "3+ months": 1 };
  const focus = ["Food & restaurants", "Healthcare & wellness", "Real estate"];
  const points = (budget[str(data.budget)] ?? 0) + (timeline[str(data.timeline)] ?? 0)
    + (data.decisionMaker === "Yes" ? 2 : 0) + (focus.includes(str(data.industry)) ? 1 : 0) + (data.source === "Referral" ? 1 : 0);
  return { score: points >= 7 ? "Hot" : points >= 4 ? "Warm" : "Cold", points };
}

/** Who should own a lead, from LEAD_ROUTING in lib/crm-config.ts. */
export const suggestedOwner = (data: Record<string, string | number>) =>
  str(data.owner) || LEAD_ROUTING[str(data.industry) as keyof typeof LEAD_ROUTING] || "Unassigned";

/** A campaign is flagged once it has spent past its threshold and its cost per lead is above target. */
export function campaignAlert(data: Record<string, string | number>): "Above target" | "On target" | null {
  const target = num(data.targetCpl);
  if (!target) return null;
  const spend = num(data.spend), leads = num(data.leads);
  if (spend < num(data.minSpend)) return null;
  return leads === 0 || spend / leads > target ? "Above target" : "On target";
}

/** All dashboard figures, computed from the records alone (no stored totals to drift). */
export function crmSummary(all: CrmRecord[], now = new Date()) {
  const by = (entity: EntityKey) => all.filter(record => record.entity === entity);
  const leads = by("leads"), clients = by("clients"), deals = by("deals"), calls = by("calls"), campaigns = by("campaigns"), outreach = by("outreach");
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = (iso: string) => new Date(iso) >= monthStart;
  const today = now.toISOString().slice(0, 10);
  const inDays = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);

  const won = leads.filter(l => l.data.status === "Won").length;
  const lost = leads.filter(l => l.data.status === "Lost").length;
  const openDeals = deals.filter(d => d.data.stage !== "Won" && d.data.stage !== "Lost");
  const wonDeals = deals.filter(d => d.data.stage === "Won");
  const lostDeals = deals.filter(d => d.data.stage === "Lost");
  const activeClients = clients.filter(c => c.data.status === "Active" || c.data.status === "Onboarding");
  const upcomingCalls = calls
    .filter(c => c.data.status === "Scheduled" && str(c.data.scheduledAt).slice(0, 10) >= today && str(c.data.scheduledAt).slice(0, 10) <= inDays(7))
    .sort((a, b) => str(a.data.scheduledAt).localeCompare(str(b.data.scheduledAt)));
  const finishedCalls = calls.filter(c => ["Completed", "No-show"].includes(str(c.data.status)));
  const spend = campaigns.reduce((sum, c) => sum + num(c.data.spend), 0);
  const adLeads = campaigns.reduce((sum, c) => sum + num(c.data.leads), 0);
  const revenue = campaigns.reduce((sum, c) => sum + num(c.data.revenue), 0);
  const contacted = outreach.reduce((sum, o) => sum + num(o.data.contacted), 0);
  const replies = outreach.reduce((sum, o) => sum + num(o.data.replies), 0);
  const positive = outreach.reduce((sum, o) => sum + num(o.data.positiveReplies), 0);
  const meetings = outreach.reduce((sum, o) => sum + num(o.data.meetings), 0);

  return {
    leads: {
      total: leads.length,
      newThisMonth: leads.filter(l => thisMonth(l.createdAt)).length,
      winRate: ratio(won, won + lost),
      followUpsDue: leads.filter(l => str(l.data.nextFollowUp) && str(l.data.nextFollowUp) <= today && !["Won", "Lost"].includes(str(l.data.status))).length,
      hot: leads.filter(l => !["Won", "Lost"].includes(str(l.data.status)) && leadScore(l.data).score === "Hot").length,
      byStatus: countBy(leads, "status", LEAD_STATUSES),
      bySource: countBy(leads, "source", SOURCES).filter(s => s.count > 0),
    },
    sales: {
      openDeals: openDeals.length,
      pipelineValue: openDeals.reduce((sum, d) => sum + num(d.data.value), 0),
      weightedValue: openDeals.reduce((sum, d) => sum + num(d.data.value) * (num(d.data.probability) / 100), 0),
      wonValue: wonDeals.reduce((sum, d) => sum + num(d.data.value), 0),
      dealWinRate: ratio(wonDeals.length, wonDeals.length + lostDeals.length),
      byStage: DEAL_STAGES.map(stage => {
        const inStage = deals.filter(d => d.data.stage === stage);
        return { label: stage, count: inStage.length, value: inStage.reduce((sum, d) => sum + num(d.data.value), 0) };
      }),
    },
    calls: {
      upcoming: upcomingCalls.slice(0, 6).map(c => ({ id: c.id, title: str(c.data.title), when: str(c.data.scheduledAt), type: str(c.data.callType) })),
      completedThisMonth: calls.filter(c => c.data.status === "Completed" && str(c.data.scheduledAt) >= monthStart.toISOString().slice(0, 10)).length,
      showRate: ratio(finishedCalls.filter(c => c.data.status === "Completed").length, finishedCalls.length),
    },
    clients: {
      active: activeClients.length,
      mrr: activeClients.reduce((sum, c) => sum + num(c.data.monthlyRetainer), 0),
      mrrByPackage: PACKAGES.map(pkg => ({ label: pkg, value: activeClients.filter(c => c.data.package === pkg).reduce((sum, c) => sum + num(c.data.monthlyRetainer), 0) })).filter(x => x.value > 0),
      renewalsNext30: clients.filter(c => str(c.data.renewalDate) >= today && str(c.data.renewalDate) <= inDays(30) && c.data.status !== "Churned").length,
      churned: clients.filter(c => c.data.status === "Churned").length,
    },
    performance: {
      live: campaigns.filter(c => c.data.status === "Live").length,
      alerts: campaigns.filter(c => c.data.status === "Live" && campaignAlert(c.data) === "Above target").map(c => str(c.data.name)),
      spend,
      leads: adLeads,
      costPerLead: adLeads > 0 ? spend / adLeads : null,
      roas: spend > 0 ? revenue / spend : null,
    },
    /** 8-week series behind the KPI cards. */
    trends: kpiTrends(all, now),
    /** Client content jobs due today or earlier (see lib/content-plan.ts). */
    content: (() => {
      const today = istToday(now);
      const tasks = tasksDue(all.filter(r => r.entity === "content"), today);
      return { due: tasks.length, overdue: tasks.filter(t => t.overdue).length };
    })(),
    /** The latest changes across the whole CRM, newest first. */
    recent: [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12).map(r => {
      const e = entities[r.entity];
      return { id: r.id, entity: r.entity, section: e.label, title: str(r.data[e.titleField]) || "Untitled", status: e.statusField ? str(r.data[e.statusField]) : "", updatedAt: r.updatedAt };
    }),
    gtm: {
      running: outreach.filter(o => o.data.status === "Running").length,
      contacted,
      replyRate: ratio(replies, contacted),
      positiveRate: ratio(positive, contacted),
      meetings,
      meetingsPer100: contacted > 0 ? (meetings / contacted) * 100 : null,
    },
  };
}

export type CrmSummary = ReturnType<typeof crmSummary>;

/** Derived columns for list views: numbers are formatted as rates or money, strings shown as badges. */
export function derivedColumns(entity: EntityKey, data: Record<string, string | number>): Record<string, number | string | null> | null {
  if (entity === "leads") {
    const { score, points } = leadScore(data);
    return { Score: `${score} · ${points}`, "Suggested owner": suggestedOwner(data) };
  }
  if (entity === "campaigns") {
    const spend = num(data.spend), clicks = num(data.clicks), impressions = num(data.impressions), leads = num(data.leads), revenue = num(data.revenue);
    return { CTR: ratio(clicks, impressions), CPL: leads ? spend / leads : null, ROAS: spend ? revenue / spend : null, Alert: campaignAlert(data) };
  }
  if (entity === "seoKeywords") {
    const now = num(data.position), before = num(data.previousPosition);
    // Lower is better on Google: moving from 12 to 7 is "up 5".
    return { Movement: now && before ? (before === now ? "No change" : before > now ? `Up ${before - now}` : `Down ${now - before}`) : null };
  }
  if (entity === "outreach") {
    const contacted = num(data.contacted);
    return { "Reply rate": ratio(num(data.replies), contacted), "Positive": ratio(num(data.positiveReplies), contacted), "Meeting rate": ratio(num(data.meetings), contacted) };
  }
  return null;
}

/** Monday (UTC) of the week containing a date, as YYYY-MM-DD. */
export function weekStart(input: string | Date) {
  const d = new Date(input);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

/**
 * Weekly scorecard for the last `weeks` weeks: leads and qualified leads
 * (by date added), calls held, deals won (by last update), and ad spend from
 * the "Weekly inputs" entries. Conversion = qualified ÷ leads.
 */
export function weeklyScorecard(all: CrmRecord[], now = new Date(), weeks = 8) {
  const current = weekStart(now);
  const starts = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(`${current}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7 * (weeks - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const qualifiedStatuses = ["Qualified", "Proposal sent", "Won"];
  const rows = starts.map(start => {
    const inWeek = (iso: string) => Boolean(iso) && weekStart(iso) === start;
    const leads = all.filter(r => r.entity === "leads" && inWeek(r.createdAt));
    const qualified = leads.filter(r => qualifiedStatuses.includes(str(r.data.status))).length;
    const callsHeld = all.filter(r => r.entity === "calls" && r.data.status === "Completed" && inWeek(str(r.data.scheduledAt))).length;
    const dealsWon = all.filter(r => r.entity === "deals" && r.data.stage === "Won" && inWeek(r.updatedAt)).length;
    const spend = all.filter(r => r.entity === "weekly" && str(r.data.weekOf) && weekStart(`${str(r.data.weekOf)}T00:00:00Z`) === start).reduce((sum, r) => sum + num(r.data.adSpend), 0);
    return {
      week: start, leads: leads.length, qualified, callsHeld, dealsWon, spend,
      conversion: ratio(qualified, leads.length),
      costPerLead: leads.length && spend ? spend / leads.length : null,
    };
  });
  const change = (key: "leads" | "qualified" | "callsHeld" | "dealsWon" | "spend") => {
    const [prev, last] = rows.slice(-2).map(r => r[key]);
    return prev ? (last - prev) / prev : null;
  };
  return { rows, change: { leads: change("leads"), qualified: change("qualified"), callsHeld: change("callsHeld"), dealsWon: change("dealsWon"), spend: change("spend") } };
}

export type WeeklyScorecard = ReturnType<typeof weeklyScorecard>;

/**
 * Week-by-week series for the dashboard's KPI cards (oldest first, the current
 * week last), from real records only:
 * - mrr: retainers of today's active clients, counted from their start date
 *   (churned clients have no end date, so they're left out of every week);
 * - pipeline: value of deals open at the end of each week (created by then,
 *   and still open now or closed after that week);
 * - leads: leads added each week; calls: sales calls held each week.
 * `change` compares the current week with the one before (null when that was 0).
 */
export function kpiTrends(all: CrmRecord[], now = new Date(), weeks = 8) {
  const current = weekStart(now);
  const starts = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(`${current}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7 * (weeks - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  // Each week runs to the next Monday (the current week too, so a start date later this week counts).
  const endOf = (start: string) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 7);
    return d.toISOString();
  };
  const active = all.filter(r => r.entity === "clients" && r.data.status === "Active");
  const deals = all.filter(r => r.entity === "deals");
  const open = (stage: unknown) => stage !== "Won" && stage !== "Lost";
  const series = {
    mrr: starts.map(start => {
      const end = endOf(start);
      return active.filter(c => (str(c.data.startDate) ? `${str(c.data.startDate)}T00:00:00Z` : c.createdAt) < end)
        .reduce((sum, c) => sum + num(c.data.monthlyRetainer), 0);
    }),
    pipeline: starts.map(start => {
      const end = endOf(start);
      return deals.filter(d => d.createdAt < end && (open(d.data.stage) || d.updatedAt >= end))
        .reduce((sum, d) => sum + num(d.data.value), 0);
    }),
    leads: starts.map(start => all.filter(r => r.entity === "leads" && weekStart(r.createdAt) === start).length),
    calls: starts.map(start => all.filter(r => r.entity === "calls" && r.data.status === "Completed" && str(r.data.scheduledAt) && weekStart(str(r.data.scheduledAt)) === start).length),
  };
  const change = (values: number[]) => {
    const [prev, last] = values.slice(-2);
    return prev ? (last - prev) / prev : null;
  };
  return {
    weeks: starts,
    mrr: { values: series.mrr, change: change(series.mrr) },
    pipeline: { values: series.pipeline, change: change(series.pipeline) },
    leads: { values: series.leads, change: change(series.leads) },
    calls: { values: series.calls, change: change(series.calls) },
  };
}
export type KpiTrends = ReturnType<typeof kpiTrends>;
