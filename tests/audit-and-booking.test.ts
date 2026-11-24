import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AUDIT_QUESTIONS, decodeAudit, encodeAudit, scoreContentEngine, type AuditAnswers } from "../lib/audit-engine.ts";
import { formatSlotTime, nextBusinessDaysIST } from "../lib/booking.ts";

const weak: AuditAnswers = { industry: "food", cadence: "none", bottleneck: "views", capture: "none" };
const strong: AuditAnswers = { industry: "food", cadence: "frequent", bottleneck: "leads", capture: "funnel" };

describe("scoreContentEngine", () => {
  it("is deterministic and stays within 0–100", () => {
    assert.deepEqual(scoreContentEngine(weak), scoreContentEngine(weak));
    for (const answers of [weak, strong]) {
      const { score } = scoreContentEngine(answers);
      assert.ok(score >= 0 && score <= 100);
    }
  });

  it("scores a stronger setup higher and returns three diagnostic points", () => {
    assert.ok(scoreContentEngine(strong).score > scoreContentEngine(weak).score);
    const ids = scoreContentEngine(weak).points.map(point => point.id).sort();
    assert.deepEqual(ids, ["conversion", "distribution", "hook"]);
  });

  it("scores every combination of answers without throwing", () => {
    const [industry, cadence, bottleneck, capture] = AUDIT_QUESTIONS.map(question => question.options.map(option => option.id));
    for (const i of industry) for (const c of cadence) for (const b of bottleneck) for (const p of capture) {
      const { score } = scoreContentEngine({ industry: i, cadence: c, bottleneck: b, capture: p } as AuditAnswers);
      assert.ok(Number.isInteger(score));
    }
  });
});

describe("audit codes", () => {
  it("round-trips answers through the URL code", () => {
    assert.deepEqual(decodeAudit(encodeAudit(weak)), weak);
  });

  it("rejects malformed or unknown codes", () => {
    assert.equal(decodeAudit("food.none.views"), null);
    assert.equal(decodeAudit("food.never.views.none"), null);
    assert.equal(decodeAudit(""), null);
  });
});

describe("booking slots", () => {
  it("returns the next five weekdays, starting the day after today in IST", () => {
    // Friday 27 Nov 2026, 23:00 IST (17:30 UTC)
    const days = nextBusinessDaysIST(5, new Date("2026-11-27T17:30:00Z"));
    assert.deepEqual(days.map(day => day.iso), ["2026-11-30", "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04"]);
  });

  it("uses the IST date, not UTC, near midnight", () => {
    // 20:00 UTC on Sunday 22 Nov is already Monday 23 Nov 01:30 in IST.
    const [first] = nextBusinessDaysIST(1, new Date("2026-11-22T20:00:00Z"));
    assert.equal(first.iso, "2026-11-24");
  });

  it("formats 24-hour times as 12-hour", () => {
    assert.equal(formatSlotTime("11:00"), "11:00 AM");
    assert.equal(formatSlotTime("16:30"), "4:30 PM");
    assert.equal(formatSlotTime("18:00"), "6:00 PM");
  });
});
