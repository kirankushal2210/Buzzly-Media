import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEAD_FIELDS, MONTHLY_BUDGETS, PRIMARY_GOALS, leadFieldErrors, leadSchema } from "../lib/lead.ts";

const valid = {
  fullName: "  Asha   Rao ",
  email: "Asha@Brand.COM",
  brandUrl: " @brandco ",
  primaryGoal: PRIMARY_GOALS[0],
  monthlyBudget: MONTHLY_BUDGETS[1],
};

describe("leadSchema", () => {
  it("accepts a valid lead and normalises it", () => {
    const result = leadSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.data.fullName, "Asha Rao");
    assert.equal(result.data.email, "asha@brand.com");
    assert.equal(result.data.brandUrl, "@brandco");
  });

  it("reports one message for every missing field", () => {
    const result = leadSchema.safeParse({});
    assert.equal(result.success, false);
    if (result.success) return;
    const errors = leadFieldErrors(result.error);
    assert.deepEqual(Object.keys(errors).sort(), [...LEAD_FIELDS].sort());
  });

  it("rejects a malformed email", () => {
    const result = leadSchema.safeParse({ ...valid, email: "asha@brand" });
    assert.equal(result.success, false);
    if (!result.success) assert.ok(leadFieldErrors(result.error).email);
  });

  it("rejects a goal or budget that is not one of the options", () => {
    const result = leadSchema.safeParse({ ...valid, primaryGoal: "Anything", monthlyBudget: "₹1" });
    assert.equal(result.success, false);
    if (result.success) return;
    const errors = leadFieldErrors(result.error);
    assert.ok(errors.primaryGoal);
    assert.ok(errors.monthlyBudget);
  });

  it("accepts every listed goal and budget", () => {
    for (const primaryGoal of PRIMARY_GOALS) {
      for (const monthlyBudget of MONTHLY_BUDGETS) {
        assert.equal(leadSchema.safeParse({ ...valid, primaryGoal, monthlyBudget }).success, true);
      }
    }
  });

  it("strips control characters from text fields", () => {
    const result = leadSchema.safeParse({ ...valid, fullName: "Asha\u0000\nRao" });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.fullName, "Asha Rao");
  });
});
