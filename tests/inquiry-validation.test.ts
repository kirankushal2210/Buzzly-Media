import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INTERESTS, LIMITS, validateInquiry } from "../lib/inquiry-validation.ts";

const valid = {
  name: "  Asha   Rao ",
  email: "Asha@Brand.COM",
  company: "Brand Co",
  interest: "content",
  message: "We want a content engine for our restaurant launch next quarter.",
};

describe("validateInquiry", () => {
  it("accepts a valid inquiry and normalises it", () => {
    const result = validateInquiry(valid);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.name, "Asha Rao");
    assert.equal(result.value.email, "asha@brand.com");
    assert.equal(result.value.company, "Brand Co");
  });

  it("reports every missing required field at once", () => {
    const result = validateInquiry({});
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.deepEqual(Object.keys(result.errors).sort(), ["email", "interest", "message", "name"]);
  });

  it("rejects bad emails and unknown interests", () => {
    const result = validateInquiry({ ...valid, email: "not-an-email", interest: "spam" });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.errors.email);
    assert.ok(result.errors.interest);
    assert.equal(result.errors.name, undefined);
  });

  it("enforces message length limits", () => {
    const short = validateInquiry({ ...valid, message: "too short" });
    assert.equal(short.ok, false);
    const long = validateInquiry({ ...valid, message: "x".repeat(LIMITS.message[1] + 1) });
    assert.equal(long.ok, false);
    const exact = validateInquiry({ ...valid, message: "x".repeat(LIMITS.message[0]) });
    assert.equal(exact.ok, true);
  });

  it("strips control characters but keeps newlines", () => {
    const result = validateInquiry({ ...valid, message: "line one\u0000\u0007\nline two, with enough length here." });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.message, "line one\nline two, with enough length here.");
  });

  it("accepts every declared interest", () => {
    for (const interest of INTERESTS) assert.equal(validateInquiry({ ...valid, interest }).ok, true, interest);
  });

  it("ignores non-string input safely", () => {
    const result = validateInquiry({ name: 42, email: null, interest: ["content"], message: { a: 1 } });
    assert.equal(result.ok, false);
  });
});
