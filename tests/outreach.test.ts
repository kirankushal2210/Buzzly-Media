import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { callScript, callingWindow, gapsList, ideasFor } from "../lib/outreach.ts";

describe("cold outreach", () => {
  it("has three ideas for every kind of business, with a fallback", () => {
    assert.equal(ideasFor("Real estate").length, 3);
    assert.equal(ideasFor("Something unknown")[0].format, "Show the work");
  });
  it("reads the noticed list one line per item, without bullets", () => {
    assert.deepEqual(gapsList("- No reels\n\n• Last post in March\n"), ["No reels", "Last post in March"]);
  });
  it("personalises the script from the prospect record only", () => {
    const s = callScript({ business: "Tiffin Co", contactName: "Asha", category: "Restaurant, café or cloud kitchen", brandGaps: "Last Instagram post was in March", previewStatus: "Viewed" }, "Ravi");
    assert.match(s.opener, /Hi Asha, this is Ravi from Buzzly/);
    assert.match(s.reason, /saw it was opened/);
    assert.match(s.noticed, /last Instagram post was in March/);
    assert.ok(s.objections.some(o => /number/.test(o.q)), "answers how we got their number");
  });
  it("knows the 9 AM–9 PM calling window", () => {
    assert.equal(callingWindow(new Date(2026, 10, 25, 8, 59)).open, false);
    assert.equal(callingWindow(new Date(2026, 10, 25, 9, 0)).open, true);
    assert.equal(callingWindow(new Date(2026, 10, 25, 21, 0)).open, false);
  });
});
