/**
 * Content planning for clients: every piece has a post date, and each stage has
 * a job that must be done some days before that date. Working backwards from
 * the post date tells you what to do today. Promises (reels, stories, posts per
 * month) live on the client record; progress is measured against them.
 * Pure functions, so they're easy to test (tests/content-plan.test.ts).
 */
import { CONTENT_STAGES, CONTENT_TYPES, type CrmRecord } from "@/lib/crm-config";

export type ContentType = (typeof CONTENT_TYPES)[number];
export type ContentStage = (typeof CONTENT_STAGES)[number];

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/** What has to happen next for a piece in each stage. */
const ACTION: Record<ContentStage, Record<ContentType, string> | null> = {
  "Idea": { Reel: "Write the script and caption", Story: "Plan the story frames", Post: "Write the caption and design brief" },
  "Script ready": { Reel: "Shoot it", Story: "Shoot or design it", Post: "Design it" },
  "Shot or designed": { Reel: "Edit it", Story: "Edit it", Post: "Polish the design" },
  "Edited": { Reel: "Send it to the client for review", Story: "Send it to the client for review", Post: "Send it to the client for review" },
  "In client review": { Reel: "Get the client's approval", Story: "Get the client's approval", Post: "Get the client's approval" },
  "Approved": { Reel: "Schedule it", Story: "Schedule it", Post: "Schedule it" },
  "Scheduled": { Reel: "Check it went live", Story: "Check it went live", Post: "Check it went live" },
  "Posted": null,
};

/** Days before the post date by which each stage's job should be done. Reels need the longest runway. */
const LEAD_DAYS: Record<ContentType, Record<Exclude<ContentStage, "Posted">, number>> = {
  Reel: { "Idea": 6, "Script ready": 5, "Shot or designed": 3, "Edited": 2, "In client review": 1, "Approved": 1, "Scheduled": 0 },
  Post: { "Idea": 4, "Script ready": 3, "Shot or designed": 2, "Edited": 2, "In client review": 1, "Approved": 1, "Scheduled": 0 },
  Story: { "Idea": 2, "Script ready": 1, "Shot or designed": 1, "Edited": 1, "In client review": 0, "Approved": 0, "Scheduled": 0 },
};

export const PROMISE_KEYS: Record<ContentType, string> = { Reel: "reelsPerMonth", Story: "storiesPerMonth", Post: "postsPerMonth" };
export const PLURAL: Record<ContentType, string> = { Reel: "Reels", Story: "Stories", Post: "Posts" };

/** YYYY-MM-DD for a date in local time (or IST on the server, via `istToday`). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const istToday = (now = new Date()) => new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const monthOf = (iso: string) => iso.slice(0, 7);
export const daysInMonth = (month: string) => new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();

export const nextStage = (stage: string): ContentStage | null => {
  const i = CONTENT_STAGES.indexOf(stage as ContentStage);
  return i >= 0 && i < CONTENT_STAGES.length - 1 ? CONTENT_STAGES[i + 1] : null;
};

export type Task = { piece: CrmRecord; action: string; due: string; overdue: boolean; clientId: string };

/** The next job for one piece, and the day it is due. Posted pieces have none. */
export function nextTask(piece: CrmRecord, today: string): Task | null {
  const stage = str(piece.data.stage) as ContentStage;
  const type = (str(piece.data.type) || "Post") as ContentType;
  const postDate = str(piece.data.postDate);
  const action = ACTION[stage]?.[type];
  if (!action || !postDate || stage === "Posted") return null;
  const due = addDays(postDate, -LEAD_DAYS[type][stage as Exclude<ContentStage, "Posted">]);
  return { piece, action, due, overdue: due < today, clientId: str(piece.data.clientId) };
}

/** Everything due today or earlier, oldest first: the "what do I do today" list. */
export function tasksDue(pieces: CrmRecord[], today: string): Task[] {
  return pieces.map(p => nextTask(p, today)).filter((t): t is Task => !!t && t.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due) || str(a.piece.data.postDate).localeCompare(str(b.piece.data.postDate)));
}

export type TypeProgress = {
  type: ContentType; promised: number; planned: number; posted: number;
  /** How many should be posted by today if the month is paced evenly. */
  expected: number; behind: number; unplanned: number;
};

/** One client's month against what was promised, per content type. */
export function monthProgress(client: CrmRecord, pieces: CrmRecord[], month: string, today: string): TypeProgress[] {
  const days = daysInMonth(month);
  const elapsed = monthOf(today) > month ? days : monthOf(today) < month ? 0 : Number(today.slice(8, 10));
  const mine = pieces.filter(p => p.data.clientId === client.id && monthOf(str(p.data.postDate)) === month);
  return CONTENT_TYPES.map(type => {
    const promised = num(client.data[PROMISE_KEYS[type]]);
    const ofType = mine.filter(p => p.data.type === type);
    const posted = ofType.filter(p => p.data.stage === "Posted").length;
    const expected = Math.floor((promised * elapsed) / days);
    return { type, promised, planned: ofType.length, posted, expected, behind: Math.max(0, expected - posted), unplanned: Math.max(0, promised - ofType.length) };
  });
}

/**
 * Post dates for the pieces still to plan: spread evenly over the rest of the
 * month, starting far enough ahead to leave time for the work.
 */
export function spreadDates(count: number, month: string, today: string, type: ContentType): string[] {
  if (count <= 0) return [];
  const first = monthOf(today) === month ? addDays(today, LEAD_DAYS[type].Idea) : `${month}-01`;
  const last = `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
  // Late in the month there isn't a full runway left: start tomorrow rather than pile everything on the last day.
  const tomorrow = addDays(today, 1);
  const start = first <= last ? first : tomorrow <= last ? tomorrow : last;
  const span = Math.round((Date.parse(`${last}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
  return Array.from({ length: count }, (_, i) => addDays(start, count === 1 ? 0 : Math.round((i * span) / (count - 1))));
}
