/**
 * DEMO DATA for the client portal. "Aarav Kitchens" is a fictional brand and every
 * figure, date and amount here is sample data for the demo workspace. The
 * portal labels it as such on every page. Never reuse these numbers as client
 * results on the public site.
 */
export type DeliverableStatus = "Needs Review" | "Approved" | "Revision Requested" | "Scheduled";
export type DeliverableFormat = "Vertical Reel" | "Brand Film" | "Founder Clip";
export type Platform = "Instagram" | "YouTube Shorts" | "LinkedIn";

export type Revision = { id: string; timestamp: string; note: string; author: string; createdAt: string };

export type Deliverable = {
  id: string;
  title: string;
  format: DeliverableFormat;
  platform: Platform;
  hookLine: string;
  duration: string; // m:ss
  posterUrl: string;
  scheduledDate: string; // ISO date
  status: DeliverableStatus;
  revisions: Revision[];
};

export const DELIVERABLE_STATUSES: DeliverableStatus[] = ["Needs Review", "Approved", "Revision Requested", "Scheduled"];

export const demoCredentials = { email: "demo@aaravkitchens.example", password: "demo-workspace" };

/** Shown as the author on notes the signed-in client writes. */
export const CLIENT_AUTHOR = "Client";

export const clientProfile = {
  brandName: "Aarav Kitchens",
  industry: "Food & restaurants",
  planName: "Monthly Growth Engine",
  planSlug: "growth-engine",
  status: "Active" as const,
  billingCycle: { start: "2026-11-01", end: "2026-11-30" },
  nextRenewal: "2026-12-01",
  nextShoot: "2026-11-27",
  strategistRole: "Account strategist, Buzzly growth team",
  quotas: [
    { id: "reels", label: "Short-Form Reels", used: 14, total: 20 },
    { id: "sprints", label: "Hook & Script Sprints", used: 4, total: 4 },
    { id: "reporting", label: "Distribution & Reporting Cycles", used: 3, total: 4 },
  ],
};

export const deliverables: Deliverable[] = [
  {
    id: "afd-101",
    title: "Tandoor at 6 AM",
    format: "Vertical Reel",
    platform: "Instagram",
    hookLine: "Our tandoor is lit before the city wakes up.",
    duration: "0:28",
    posterUrl: "/media/de-food-kampney-poster.webp",
    scheduledDate: "2026-11-26",
    status: "Needs Review",
    revisions: [
      { id: "n1", timestamp: "00:00", note: "First cut uploaded with two opening options. Option B leads with the flame.", author: "Buzzly", createdAt: "2026-11-22T10:15:00+05:30" },
    ],
  },
  {
    id: "afd-102",
    title: "Why we grind our own masala",
    format: "Vertical Reel",
    platform: "YouTube Shorts",
    hookLine: "Store-bought garam masala was costing us regulars.",
    duration: "0:34",
    posterUrl: "/media/de-food-kampney-poster.webp",
    scheduledDate: "2026-11-28",
    status: "Needs Review",
    revisions: [],
  },
  {
    id: "afd-103",
    title: "Aarav Kitchens — Kitchen to Table",
    format: "Brand Film",
    platform: "LinkedIn",
    hookLine: "Forty covers, one kitchen, zero shortcuts.",
    duration: "1:42",
    posterUrl: "/media/buzzly-properties-poster.webp",
    scheduledDate: "2026-12-02",
    status: "Approved",
    revisions: [
      { id: "n2", timestamp: "00:41", note: "Love the pass shot. Approved as is.", author: "Client", createdAt: "2026-11-20T18:02:00+05:30" },
    ],
  },
  {
    id: "afd-104",
    title: "The recipe my mother refused to share",
    format: "Founder Clip",
    platform: "LinkedIn",
    hookLine: "It took me eleven years to get this recipe out of my mother.",
    duration: "0:52",
    posterUrl: "/media/buzzly-health-poster.webp",
    scheduledDate: "2026-11-30",
    status: "Revision Requested",
    revisions: [
      { id: "n3", timestamp: "00:08", note: "Tighten the opening cut — the pause before the line feels long.", author: "Client", createdAt: "2026-11-21T12:30:00+05:30" },
      { id: "n4", timestamp: "00:08", note: "Noted. Re-cut with the line starting on frame one; new version tomorrow.", author: "Buzzly", createdAt: "2026-11-21T15:10:00+05:30" },
    ],
  },
  {
    id: "afd-105",
    title: "Lunch rush in 30 seconds",
    format: "Vertical Reel",
    platform: "Instagram",
    hookLine: "1:00 PM. Forty orders. Watch the pass.",
    duration: "0:30",
    posterUrl: "/media/de-food-kampney-poster.webp",
    scheduledDate: "2026-11-24",
    status: "Scheduled",
    revisions: [],
  },
  {
    id: "afd-106",
    title: "Three dishes under ₹200",
    format: "Vertical Reel",
    platform: "YouTube Shorts",
    hookLine: "Lunch for under ₹200 that doesn’t taste like a compromise.",
    duration: "0:26",
    posterUrl: "/media/de-food-kampney-poster.webp",
    scheduledDate: "2026-11-25",
    status: "Scheduled",
    revisions: [],
  },
];

export type Kpi = { id: string; label: string; value: string; delta: number; deltaUnit: "%" | "pts"; note: string };

const kpis: Kpi[] = [
  { id: "hook", label: "3-Sec Hook Hold Rate", value: "68.4%", delta: 6.2, deltaUnit: "pts", note: "vs. previous 30 days" },
  { id: "reach", label: "30-Day Organic Reach", value: "412.8K", delta: 18.5, deltaUnit: "%", note: "vs. previous 30 days" },
  { id: "clicks", label: "Inbound Funnel Clicks", value: "3,940", delta: 12.1, deltaUnit: "%", note: "profile + site clicks" },
  { id: "completion", label: "Avg. Watch Completion", value: "44.2%", delta: 3.8, deltaUnit: "pts", note: "vs. previous 30 days" },
];

/** Average viewer retention across reels published in the last 7 days, 0–30 seconds. */
/** Seconds at which the 3-second hook hold is measured. */
export const HOOK_THRESHOLD_SECONDS = 3;

const retentionCurve: { second: number; current: number; previous: number }[] = [
  { second: 0, current: 100, previous: 100 },
  { second: 1, current: 90.6, previous: 85.1 },
  { second: 2, current: 79.8, previous: 72.4 },
  { second: 3, current: 68.4, previous: 62.2 },
  { second: 5, current: 61.9, previous: 54.8 },
  { second: 7, current: 57.6, previous: 50.3 },
  { second: 10, current: 53.4, previous: 46.1 },
  { second: 15, current: 49.8, previous: 42.7 },
  { second: 20, current: 47.1, previous: 40.2 },
  { second: 25, current: 45.4, previous: 38.9 },
  { second: 30, current: 44.2, previous: 37.6 },
];

export type PublishedAsset = { id: string; title: string; platform: Platform; publishedOn: string; hookHold: number; avgWatchSeconds: number; linkClicks: number };

const topAssets: PublishedAsset[] = [
  { id: "afd-091", title: "The ₹90 thali that sold out by noon", platform: "Instagram", publishedOn: "2026-11-04", hookHold: 74.2, avgWatchSeconds: 19.4, linkClicks: 862 },
  { id: "afd-093", title: "Inside the 4 AM dough prep", platform: "YouTube Shorts", publishedOn: "2026-11-08", hookHold: 71.5, avgWatchSeconds: 17.8, linkClicks: 640 },
  { id: "afd-095", title: "What our chef eats after service", platform: "Instagram", publishedOn: "2026-11-12", hookHold: 69.9, avgWatchSeconds: 16.1, linkClicks: 711 },
  { id: "afd-097", title: "Founder: why we closed on Mondays", platform: "LinkedIn", publishedOn: "2026-11-14", hookHold: 63.1, avgWatchSeconds: 24.6, linkClicks: 935 },
  { id: "afd-099", title: "Packing 200 lunch orders", platform: "YouTube Shorts", publishedOn: "2026-11-18", hookHold: 61.7, avgWatchSeconds: 13.2, linkClicks: 402 },
];

export const analytics = { kpis, retentionCurve, topAssets };

export type Milestone = { id: string; date: string; label: string; kind: "Shoot" | "Review" | "Report" | "Publish" };

export const milestones: Milestone[] = [
  { id: "m1", date: "2026-11-24", label: "Lunch rush reel goes live on Instagram", kind: "Publish" },
  { id: "m2", date: "2026-11-25", label: "Review: masala and tandoor reels", kind: "Review" },
  { id: "m3", date: "2026-11-27", label: "Shoot day: winter menu, 6 reels + founder clip", kind: "Shoot" },
  { id: "m4", date: "2026-11-30", label: "Distribution & reporting cycle 4", kind: "Report" },
  { id: "m5", date: "2026-12-02", label: "Brand film premieres on LinkedIn", kind: "Publish" },
];

export type Invoice = { id: string; period: string; issuedOn: string; amount: number; status: "Paid" | "Due" };

/** Sample amounts for the demo only; not Buzzly pricing. */
export const invoices: Invoice[] = [
  { id: "BZ-AK-2026-11", period: "November 2026", issuedOn: "2026-11-01", amount: 120000, status: "Paid" },
  { id: "BZ-AK-2026-10", period: "October 2026", issuedOn: "2026-10-01", amount: 120000, status: "Paid" },
  { id: "BZ-AK-2026-09", period: "September 2026", issuedOn: "2026-09-01", amount: 85000, status: "Paid" },
];

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatPortalDate = (iso: string) => dateFormat.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
export const formatRupees = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
