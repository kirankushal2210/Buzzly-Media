import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { kpiTrends } from "../lib/crm-metrics.ts";
import type { CrmRecord } from "../lib/crm-config.ts";

const rec = (entity: CrmRecord["entity"], data: CrmRecord["data"], createdAt: string, updatedAt = createdAt): CrmRecord =>
  ({ id: Math.random().toString(36).slice(2), entity, data, createdAt, updatedAt });
const now = new Date("2026-11-25T12:00:00.000Z"); // a Wednesday; this week starts 23 Nov

describe("KPI trends", () => {
  it("builds 8 weeks, oldest first, ending with the current week", () => {
    const t = kpiTrends([], now);
    assert.equal(t.weeks.length, 8);
    assert.equal(t.weeks[7], "2026-11-23");
    assert.deepEqual(t.leads.values, [0, 0, 0, 0, 0, 0, 0, 0]);
    assert.equal(t.leads.change, null);
  });
  it("counts leads and held calls per week and compares with last week", () => {
    const t = kpiTrends([
      rec("leads", { name: "a", status: "New" }, "2026-11-17T10:00:00.000Z"),
      rec("leads", { name: "b", status: "New" }, "2026-11-18T10:00:00.000Z"),
      rec("leads", { name: "c", status: "New" }, "2026-11-24T10:00:00.000Z"),
      rec("calls", { title: "x", status: "Completed", scheduledAt: "2026-11-24T11:00" }, "2026-11-20T10:00:00.000Z"),
      rec("calls", { title: "y", status: "Scheduled", scheduledAt: "2026-11-24T11:00" }, "2026-11-20T10:00:00.000Z"),
    ], now);
    assert.deepEqual(t.leads.values.slice(-2), [2, 1]);
    assert.equal(t.leads.change, -0.5);
    assert.deepEqual(t.calls.values.slice(-2), [0, 1]);
  });
  it("grows MRR from client start dates and leaves churned clients out", () => {
    const t = kpiTrends([
      rec("clients", { name: "A", status: "Active", monthlyRetainer: 50000, startDate: "2026-10-01" }, "2026-10-01T00:00:00.000Z"),
      rec("clients", { name: "B", status: "Active", monthlyRetainer: 30000, startDate: "2026-11-24" }, "2026-11-24T00:00:00.000Z"),
      rec("clients", { name: "C", status: "Churned", monthlyRetainer: 99000, startDate: "2026-09-01" }, "2026-09-01T00:00:00.000Z"),
    ], now);
    assert.deepEqual(t.mrr.values.slice(-2), [50000, 80000]);
    assert.equal(t.mrr.change, 0.6);
  });
  it("counts a deal in the pipeline only while it was open", () => {
    const t = kpiTrends([
      rec("deals", { title: "open", stage: "Proposal", value: 40000 }, "2026-11-10T00:00:00.000Z"),
      rec("deals", { title: "won last week", stage: "Won", value: 25000 }, "2026-11-03T00:00:00.000Z", "2026-11-19T00:00:00.000Z"),
    ], now);
    // week of 9 Nov: both open; week of 16 Nov: won during it, so gone by its end; this week: only the open one
    assert.deepEqual(t.pipeline.values.slice(-3), [65000, 40000, 40000]);
  });
});
