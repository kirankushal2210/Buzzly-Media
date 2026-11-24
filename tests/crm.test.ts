import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSession, verifySession, loginRateLimited, safeEqual } from "../lib/admin-auth.ts";
import { entities, parseAmount, schemaFor, type CrmRecord } from "../lib/crm-config.ts";
import { campaignAlert, crmSummary, derivedColumns, leadScore, weekStart, weeklyScorecard } from "../lib/crm-metrics.ts";

const KEY = "test-signing-key-123456";

describe("admin sessions", () => {
  it("accepts its own signed session until it expires", async () => {
    const now = Date.UTC(2026, 10, 24, 10);
    const token = await createSession(now, KEY);
    assert.equal(await verifySession(token, now + 1000, KEY), true);
    assert.equal(await verifySession(token, now + 13 * 3600 * 1000, KEY), false, "expired after 12 hours");
  });

  it("rejects tampered or foreign tokens", async () => {
    const now = Date.now();
    const token = await createSession(now, KEY);
    const [expires, signature] = token.split(".");
    assert.equal(await verifySession(`${Number(expires) + 99999}.${signature}`, now, KEY), false, "edited expiry");
    assert.equal(await verifySession(token, now, "a-different-key-000000"), false, "other key");
    assert.equal(await verifySession("garbage", now, KEY), false);
    assert.equal(await verifySession(undefined, now, KEY), false);
  });

  it("compares secrets exactly", async () => {
    assert.equal(await safeEqual("abc", "abc"), true);
    assert.equal(await safeEqual("abc", "abd"), false);
  });

  it("brakes repeated login attempts per IP", () => {
    const now = 1_000_000;
    for (let i = 0; i < 8; i++) assert.equal(loginRateLimited("203.0.113.9", now), false);
    assert.equal(loginRateLimited("203.0.113.9", now), true);
    assert.equal(loginRateLimited("203.0.113.9", now + 16 * 60 * 1000), false, "resets after 15 minutes");
  });
});

describe("CRM field validation", () => {
  const leads = schemaFor(entities.leads);
  it("accepts a valid lead and drops blank optional fields", () => {
    const result = leads.safeParse({ name: "Asha", email: "asha@example.com", status: "New", estValue: "45000", phone: "" });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.estValue, 45000);
      assert.equal("phone" in result.data && result.data.phone !== undefined, false);
    }
  });
  it("rejects missing required fields, bad emails, unknown options and extra keys", () => {
    assert.equal(leads.safeParse({ status: "New" }).success, false, "name required");
    assert.equal(leads.safeParse({ name: "A", status: "New", email: "nope" }).success, false);
    assert.equal(leads.safeParse({ name: "A", status: "Hot" }).success, false);
    assert.equal(leads.safeParse({ name: "A", status: "New", isAdmin: true }).success, false);
  });
  it("keeps probability within 0–100", () => {
    const deals = schemaFor(entities.deals);
    assert.equal(deals.safeParse({ title: "X", stage: "Proposal", probability: 120 }).success, false);
    assert.equal(deals.safeParse({ title: "X", stage: "Proposal", probability: 60 }).success, true);
  });
});

const rec = (entity: CrmRecord["entity"], data: CrmRecord["data"], createdAt = "2026-11-10T10:00:00.000Z"): CrmRecord =>
  ({ id: crypto.randomUUID(), entity, data, createdAt, updatedAt: createdAt });

describe("CRM dashboard numbers", () => {
  const now = new Date("2026-11-24T12:00:00Z");
  const all = [
    rec("leads", { name: "A", status: "Won", source: "Website" }),
    rec("leads", { name: "B", status: "Lost", source: "Referral" }),
    rec("leads", { name: "C", status: "New", source: "Website", nextFollowUp: "2026-11-20" }, "2026-10-01T00:00:00.000Z"),
    rec("deals", { title: "D1", stage: "Proposal", value: 50000, probability: 50 }),
    rec("deals", { title: "D2", stage: "Won", value: 80000 }),
    rec("deals", { title: "D3", stage: "Lost", value: 30000 }),
    rec("clients", { name: "K", status: "Active", monthlyRetainer: 80000, renewalDate: "2026-12-10" }),
    rec("clients", { name: "L", status: "Churned", monthlyRetainer: 40000 }),
    rec("calls", { title: "Call", callType: "Discovery", status: "Scheduled", scheduledAt: "2026-11-26T11:00" }),
    rec("calls", { title: "Old", callType: "Discovery", status: "No-show", scheduledAt: "2026-11-02T11:00" }),
    rec("calls", { title: "Done", callType: "Discovery", status: "Completed", scheduledAt: "2026-11-05T11:00" }),
    rec("campaigns", { name: "Meta", channel: "Google", status: "Live", spend: 20000, leads: 40, revenue: 60000, clicks: 500, impressions: 20000 }),
    rec("outreach", { name: "Kitchens", channel: "Email", status: "Running", contacted: 200, replies: 16, positiveReplies: 6, meetings: 4 }),
  ];
  const s = crmSummary(all, now);

  it("computes lead figures", () => {
    assert.equal(s.leads.total, 3);
    assert.equal(s.leads.newThisMonth, 2);
    assert.equal(s.leads.winRate, 0.5);
    assert.equal(s.leads.followUpsDue, 1);
  });
  it("computes pipeline and MRR", () => {
    assert.equal(s.sales.openDeals, 1);
    assert.equal(s.sales.pipelineValue, 50000);
    assert.equal(s.sales.weightedValue, 25000);
    assert.equal(s.sales.wonValue, 80000);
    assert.equal(s.clients.mrr, 80000);
    assert.equal(s.clients.renewalsNext30, 1);
  });
  it("computes calls, ad and outreach rates", () => {
    assert.equal(s.calls.upcoming.length, 1);
    assert.equal(s.calls.showRate, 0.5);
    assert.equal(s.performance.costPerLead, 500);
    assert.equal(s.performance.roas, 3);
    assert.equal(s.gtm.replyRate, 0.08);
    assert.equal(s.gtm.meetingsPer100, 2);
  });
  it("derives per-row campaign metrics without dividing by zero", () => {
    assert.deepEqual(derivedColumns("campaigns", { spend: 1000, clicks: 0, impressions: 0, leads: 0, revenue: 0 }), { CTR: null, CPL: null, ROAS: 0, Alert: null });
  });
});

describe("lead score, alerts and weekly scorecard", () => {
  it("scores leads with transparent rules", () => {
    assert.deepEqual(leadScore({ budget: "₹50k–1L/month", timeline: "This month", decisionMaker: "Yes", industry: "Real estate" }), { score: "Hot", points: 9 });
    assert.equal(leadScore({ budget: "₹25k–50k/month", timeline: "1–3 months" }).score, "Warm");
    assert.equal(leadScore({}).score, "Cold");
  });
  it("flags campaigns only after the spend threshold and above the target", () => {
    assert.equal(campaignAlert({ spend: 1000, leads: 1 }), null, "no target set");
    assert.equal(campaignAlert({ targetCpl: 400, minSpend: 5000, spend: 1000, leads: 0 }), null, "below threshold");
    assert.equal(campaignAlert({ targetCpl: 400, minSpend: 5000, spend: 6000, leads: 10 }), "Above target");
    assert.equal(campaignAlert({ targetCpl: 700, minSpend: 5000, spend: 6000, leads: 10 }), "On target");
    assert.equal(derivedColumns("leads", { status: "New" })?.["Suggested owner"], "Unassigned");
  });
  it("builds week rows and week-on-week change", () => {
    assert.equal(weekStart("2026-11-26T10:00:00Z"), "2026-11-23", "Thursday → Monday");
    const now = new Date("2026-11-26T12:00:00Z");
    const all = [
      rec("leads", { name: "a", status: "Qualified" }, "2026-11-24T09:00:00.000Z"),
      rec("leads", { name: "b", status: "New" }, "2026-11-25T09:00:00.000Z"),
      rec("leads", { name: "c", status: "New" }, "2026-11-17T09:00:00.000Z"),
      rec("weekly", { weekOf: "2026-11-23", adSpend: 3000 }),
    ];
    const s = weeklyScorecard(all, now, 4);
    const last = s.rows.at(-1)!;
    assert.equal(s.rows.length, 4);
    assert.equal(last.week, "2026-11-23");
    assert.equal(last.leads, 2);
    assert.equal(last.qualified, 1);
    assert.equal(last.conversion, 0.5);
    assert.equal(last.costPerLead, 1500);
    assert.equal(s.change.leads, 1, "1 → 2 leads is +100%");
  });
});

describe("forgiving money input", () => {
  it("reads amounts the way people type them", () => {
    assert.equal(parseAmount("₹45,000"), 45000);
    assert.equal(parseAmount("45k"), 45000);
    assert.equal(parseAmount("1.2L"), 120000);
    assert.equal(parseAmount("1.5 lakh"), 150000);
    assert.equal(parseAmount("2 cr"), 20000000);
    assert.equal(parseAmount("80000/month"), 80000);
  });
  it("still rejects nonsense with a clear message", () => {
    const r = schemaFor(entities.leads).safeParse({ name: "A", status: "New", estValue: "lots" });
    assert.equal(r.success, false);
    if (!r.success) assert.match(r.error.flatten().fieldErrors.estValue?.[0] ?? "", /45k/);
    const ok = schemaFor(entities.leads).safeParse({ name: "A", status: "New", estValue: "₹45k" });
    assert.equal(ok.success && ok.data.estValue, 45000);
  });
});
