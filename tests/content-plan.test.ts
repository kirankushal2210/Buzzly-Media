import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { monthProgress, nextStage, nextTask, spreadDates, tasksDue } from "../lib/content-plan.ts";
import type { CrmRecord } from "../lib/crm-config.ts";

const piece = (data: Record<string, string | number>, id = Math.random().toString(36).slice(2)): CrmRecord =>
  ({ id, entity: "content", data: { clientId: "c1", ...data }, createdAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T00:00:00Z" });
const client: CrmRecord = { id: "c1", entity: "clients", data: { name: "Test café", status: "Active", reelsPerMonth: 10, storiesPerMonth: 10, postsPerMonth: 10 }, createdAt: "", updatedAt: "" };

describe("content planning", () => {
  it("works back from the post date to today's job", () => {
    const t = nextTask(piece({ type: "Reel", stage: "Script ready", postDate: "2026-11-30" }), "2026-11-25");
    assert.equal(t?.action, "Shoot it");
    assert.equal(t?.due, "2026-11-25");
    assert.equal(t?.overdue, false);
  });
  it("flags work that should already be done and skips posted pieces", () => {
    const tasks = tasksDue([
      piece({ type: "Reel", stage: "Idea", postDate: "2026-11-28" }),
      piece({ type: "Post", stage: "Posted", postDate: "2026-11-20" }),
      piece({ type: "Story", stage: "Idea", postDate: "2026-12-20" }),
    ], "2026-11-25");
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].overdue, true);
  });
  it("moves a piece to the next stage and stops after Posted", () => {
    assert.equal(nextStage("Idea"), "Script ready");
    assert.equal(nextStage("Posted"), null);
  });
  it("measures the month against the promise", () => {
    const pieces = [
      piece({ type: "Reel", stage: "Posted", postDate: "2026-11-03" }),
      piece({ type: "Reel", stage: "Idea", postDate: "2026-11-28" }),
      piece({ type: "Story", stage: "Posted", postDate: "2026-10-03" }),
    ];
    const [reels, stories] = monthProgress(client, pieces, "2026-11", "2026-11-15");
    assert.deepEqual([reels.promised, reels.planned, reels.posted, reels.expected, reels.behind, reels.unplanned], [10, 2, 1, 5, 4, 8]);
    assert.equal(stories.planned, 0);
  });
  it("spreads the unplanned pieces over the rest of the month", () => {
    const dates = spreadDates(3, "2026-11", "2026-11-10", "Reel");
    assert.deepEqual(dates, ["2026-11-16", "2026-11-23", "2026-11-30"]);
    assert.deepEqual(spreadDates(0, "2026-11", "2026-11-10", "Reel"), []);
    // late in the month: from tomorrow, not all on the last day
    assert.deepEqual(spreadDates(3, "2026-11", "2026-11-26", "Reel"), ["2026-11-27", "2026-11-29", "2026-11-30"]);
  });
});
