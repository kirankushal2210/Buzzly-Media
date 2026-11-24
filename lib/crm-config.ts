/**
 * The CRM's single source of truth: every section, its fields, and how they
 * are validated, shown in tables and edited in forms. Add a field here and it
 * appears everywhere, with no database change (records are stored as JSON).
 */
import { z } from "zod";

export type FieldType = "text" | "email" | "tel" | "url" | "textarea" | "select" | "number" | "money" | "percent" | "date" | "datetime";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  /** Shown as a column in the list view. */
  column?: boolean;
  placeholder?: string;
};

export type EntityKey = "leads" | "clients" | "deals" | "calls" | "campaigns" | "outreach" | "weekly" | "adResearch" | "creators" | "creativeTests" | "experiments" | "aiChecks" | "prospects" | "content" | "seoKeywords";

export const PROSPECT_CATEGORIES = ["Restaurant, café or cloud kitchen", "Clinic or wellness", "Real estate", "Retail or boutique", "Salon or fitness", "Other local business"] as const;
export const CALL_OUTCOMES = ["Not called", "No answer", "Call back", "Spoke, not interested", "Spoke, interested", "Do not call"] as const;
export const PREVIEW_STATUSES = ["Not started", "Ready", "Sent", "Viewed"] as const;
/**
 * Performance marketing channels: every campaign sits in one. `types` and
 * `platforms` describe what belongs in each (shown on the Performance page).
 */
export const AD_CHANNELS = [
  { name: "Paid search", short: "PPC / SEM", types: ["Search campaign", "Shopping ads", "Performance Max"], platforms: ["Google Ads", "Microsoft Ads (Bing)"] },
  { name: "Paid social", short: "Social ads", types: ["Feed / stories ads", "Video ads", "Lead-form ads"], platforms: ["Meta (Facebook & Instagram)", "LinkedIn", "YouTube", "TikTok", "Snapchat", "X", "Pinterest"] },
  { name: "Influencer (tracked)", short: "Paid on results", types: ["Promo code", "UTM link", "Affiliate link"], platforms: ["Instagram creator", "YouTube creator", "Other creator"] },
  { name: "Lead generation", short: "Lead forms & landing pages", types: ["Lead-form ads", "Landing page"], platforms: ["Meta (Facebook & Instagram)", "LinkedIn", "Google Ads", "Website landing page"] },
  { name: "Marketplace ads", short: "Sponsored listings", types: ["Sponsored listings"], platforms: ["Amazon", "Flipkart", "Swiggy / Zomato", "Other marketplace"] },
  { name: "Email marketing", short: "Newsletters & flows", types: ["Newsletter", "Automated flow"], platforms: ["Email tool"] },
] as const;
export const AD_CHANNEL_NAMES = AD_CHANNELS.map(c => c.name);
const uniq = (list: readonly string[]) => [...new Set(list)];
export const AD_PLATFORMS = uniq([...AD_CHANNELS.flatMap(c => c.platforms), "Other"]);
export const AD_TYPES = uniq([...AD_CHANNELS.flatMap(c => c.types), "Other"]);
export const SEO_STATUSES = ["Not started", "Content planned", "Published", "Ranking", "Top 3"] as const;
export const CONTENT_TYPES = ["Reel", "Story", "Post"] as const;
export const CONTENT_STAGES = ["Idea", "Script ready", "Shot or designed", "Edited", "In client review", "Approved", "Scheduled", "Posted"] as const;
export const CONTENT_PLATFORMS = ["Instagram", "Facebook", "YouTube", "LinkedIn", "Other"] as const;

export type Entity = {
  key: EntityKey;
  label: string;
  singular: string;
  /** Field holding the record's display name. */
  titleField: string;
  /** Select field used for the status filter and badges. */
  statusField?: string;
  fields: Field[];
};

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal sent", "Won", "Lost", "Nurture"] as const;
export const DEAL_STAGES = ["Discovery", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] as const;
export const SOURCES = ["Website", "Referral", "Outreach", "Instagram", "LinkedIn", "Ads", "Event", "Other"] as const;
export const PACKAGES = ["Content Launch Sprint", "Monthly Growth Engine", "Full-Stack Brand & Tech Partner", "Custom"] as const;
export const INDUSTRIES = ["Food & restaurants", "Healthcare & wellness", "Real estate", "D2C & e-commerce", "B2B services", "Other"] as const;
export const BUDGETS = ["Over ₹1L/month", "₹50k–1L/month", "₹25k–50k/month", "Under ₹25k/month", "Unknown"] as const;
export const TIMELINES = ["This month", "1–3 months", "3+ months", "Just exploring"] as const;

/**
 * Lead routing: who should pick up a lead from each industry. Fill in names
 * as the team grows; an industry without a rule shows "Unassigned".
 */
export const LEAD_ROUTING: Partial<Record<(typeof INDUSTRIES)[number], string>> = {};

export const entities: Record<EntityKey, Entity> = {
  leads: {
    key: "leads", label: "Leads", singular: "lead", titleField: "name", statusField: "status",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, column: true },
      { key: "company", label: "Company / brand", type: "text", column: true },
      { key: "email", label: "Email", type: "email", column: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "source", label: "Source", type: "select", options: SOURCES, column: true },
      { key: "interest", label: "Interested in", type: "select", options: ["Content and social media", "Brand strategy", "Distribution", "Partnership", "Something else"] },
      { key: "industry", label: "Industry", type: "select", options: INDUSTRIES },
      { key: "budget", label: "Budget", type: "select", options: BUDGETS },
      { key: "timeline", label: "Wants to start", type: "select", options: TIMELINES },
      { key: "decisionMaker", label: "Talking to the decision-maker?", type: "select", options: ["Yes", "No", "Unknown"] },
      { key: "status", label: "Status", type: "select", options: LEAD_STATUSES, required: true, column: true },
      { key: "estValue", label: "Estimated value (₹/month)", type: "money", column: true },
      { key: "owner", label: "Owner", type: "text", column: true },
      { key: "nextFollowUp", label: "Next follow-up", type: "date", column: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  clients: {
    key: "clients", label: "Clients", singular: "client", titleField: "name", statusField: "status",
    fields: [
      { key: "name", label: "Brand", type: "text", required: true, column: true },
      { key: "contactName", label: "Main contact", type: "text", column: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "industry", label: "Industry", type: "select", options: ["Food & restaurants", "Healthcare & wellness", "Real estate", "D2C & e-commerce", "B2B services", "Other"], column: true },
      { key: "package", label: "Package", type: "select", options: PACKAGES, column: true },
      { key: "monthlyRetainer", label: "Monthly retainer (₹)", type: "money", column: true },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "renewalDate", label: "Renewal date", type: "date", column: true },
      { key: "status", label: "Status", type: "select", options: ["Onboarding", "Active", "Paused", "Churned"], required: true, column: true },
      { key: "reelsPerMonth", label: "Reels promised per month", type: "number", column: true },
      { key: "storiesPerMonth", label: "Stories promised per month", type: "number", column: true },
      { key: "postsPerMonth", label: "Posts promised per month", type: "number", column: true },
      { key: "owner", label: "Account owner", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  deals: {
    key: "deals", label: "Sales pipeline", singular: "deal", titleField: "title", statusField: "stage",
    fields: [
      { key: "title", label: "Deal", type: "text", required: true, column: true, placeholder: "e.g. Tindora Kitchen, Growth Engine" },
      { key: "company", label: "Company", type: "text", column: true },
      { key: "stage", label: "Stage", type: "select", options: DEAL_STAGES, required: true, column: true },
      { key: "value", label: "Value (₹/month)", type: "money", column: true },
      { key: "probability", label: "Win probability", type: "percent", column: true },
      { key: "expectedClose", label: "Expected close", type: "date", column: true },
      { key: "source", label: "Source", type: "select", options: SOURCES },
      { key: "owner", label: "Owner", type: "text", column: true },
      { key: "nextStep", label: "Next step", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  calls: {
    key: "calls", label: "Sales calls", singular: "call", titleField: "title", statusField: "status",
    fields: [
      { key: "title", label: "Call with", type: "text", required: true, column: true, placeholder: "Person and company" },
      { key: "callType", label: "Type", type: "select", options: ["Discovery", "Strategy", "Proposal review", "Follow-up", "Client check-in"], required: true, column: true },
      { key: "scheduledAt", label: "Date and time", type: "datetime", required: true, column: true },
      { key: "durationMin", label: "Duration (minutes)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "No-show", "Rescheduled", "Cancelled"], required: true, column: true },
      { key: "outcome", label: "Outcome", type: "select", options: ["Positive", "Neutral", "Negative"], column: true },
      { key: "owner", label: "Owner", type: "text", column: true },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "nextSteps", label: "Next steps", type: "textarea" },
    ],
  },
  campaigns: {
    key: "campaigns", label: "Performance marketing", singular: "campaign", titleField: "name", statusField: "status",
    fields: [
      { key: "name", label: "Campaign", type: "text", required: true, column: true },
      { key: "client", label: "Client (blank = Buzzly)", type: "text", column: true },
      { key: "channel", label: "Channel", type: "select", options: AD_CHANNEL_NAMES, required: true, column: true },
      { key: "platform", label: "Platform", type: "select", options: AD_PLATFORMS, column: true },
      { key: "adType", label: "Ad type", type: "select", options: AD_TYPES },
      { key: "trackingCode", label: "Promo code, UTM or affiliate link (influencer)", type: "text" },
      { key: "objective", label: "Objective", type: "select", options: ["Leads", "Sales", "Awareness", "Traffic"] },
      { key: "status", label: "Status", type: "select", options: ["Planned", "Live", "Paused", "Ended"], required: true, column: true },
      { key: "startDate", label: "Start", type: "date" },
      { key: "endDate", label: "End", type: "date" },
      { key: "budget", label: "Budget (₹)", type: "money" },
      { key: "targetCpl", label: "Target cost per lead (₹)", type: "money" },
      { key: "minSpend", label: "Alert only after spending (₹)", type: "money" },
      { key: "spend", label: "Spend (₹)", type: "money", column: true },
      { key: "impressions", label: "Impressions (or emails sent)", type: "number" },
      { key: "clicks", label: "Clicks (or email clicks)", type: "number" },
      { key: "leads", label: "Leads", type: "number", column: true },
      { key: "conversions", label: "Conversions", type: "number" },
      { key: "revenue", label: "Revenue (₹)", type: "money" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  outreach: {
    key: "outreach", label: "GTM outreach", singular: "outreach campaign", titleField: "name", statusField: "status",
    fields: [
      { key: "name", label: "Campaign / sequence", type: "text", required: true, column: true },
      { key: "segment", label: "Target segment", type: "text", column: true, placeholder: "e.g. Hyderabad cloud kitchens" },
      { key: "channel", label: "Channel", type: "select", options: ["Email", "LinkedIn", "Instagram DM", "WhatsApp (opted-in only)", "Phone", "Referral", "Event"], required: true, column: true },
      { key: "status", label: "Status", type: "select", options: ["Planning", "Running", "Paused", "Done"], required: true, column: true },
      { key: "startDate", label: "Start", type: "date" },
      { key: "prospects", label: "Prospects in list", type: "number" },
      { key: "contacted", label: "Contacted", type: "number", column: true },
      { key: "replies", label: "Replies", type: "number" },
      { key: "positiveReplies", label: "Positive replies", type: "number" },
      { key: "meetings", label: "Meetings booked", type: "number", column: true },
      { key: "dealsWon", label: "Deals won", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  weekly: {
    key: "weekly", label: "Weekly inputs", singular: "week", titleField: "weekOf",
    fields: [
      { key: "weekOf", label: "Week starting (Monday)", type: "date", required: true, column: true },
      { key: "adSpend", label: "Ad spend this week (₹)", type: "money", column: true },
      { key: "notes", label: "What changed, and two hypotheses why", type: "textarea", column: true },
    ],
  },
  adResearch: {
    key: "adResearch", label: "Competitor ad research", singular: "ad", titleField: "brand", statusField: "status",
    fields: [
      { key: "brand", label: "Brand", type: "text", required: true, column: true },
      { key: "platform", label: "Platform", type: "select", options: ["Meta (Instagram/Facebook)", "Google", "YouTube", "LinkedIn", "Other"], column: true },
      { key: "adLink", label: "Ad Library link", type: "url" },
      { key: "runningSince", label: "Running since", type: "date", column: true },
      { key: "format", label: "Format", type: "select", options: ["Reel / video", "Image", "Carousel", "Story", "Other"], column: true },
      { key: "hook", label: "Hook (first line / first seconds)", type: "text" },
      { key: "offer", label: "Offer", type: "text" },
      { key: "audienceGuess", label: "Who it seems aimed at", type: "text" },
      { key: "ourIdea", label: "Our own original idea (never a copy)", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Saved", "Idea drafted", "Tested", "Dropped"], required: true, column: true },
      { key: "notes", label: "Notes (running long ≠ proof it’s profitable)", type: "textarea" },
    ],
  },
  creators: {
    key: "creators", label: "Creators", singular: "creator", titleField: "handle", statusField: "status",
    fields: [
      { key: "handle", label: "Handle / name", type: "text", required: true, column: true },
      { key: "platform", label: "Platform", type: "select", options: ["Instagram", "YouTube", "LinkedIn", "Other"], column: true },
      { key: "niche", label: "Niche", type: "text", column: true },
      { key: "followers", label: "Followers", type: "number", column: true },
      { key: "audienceFit", label: "Audience fit", type: "select", options: ["Strong", "Good", "Weak"], column: true },
      { key: "recentPost", label: "Recent post to mention", type: "url" },
      { key: "contactPreference", label: "How they prefer to be contacted", type: "text" },
      { key: "disclosure", label: "Disclosure", type: "select", options: ["Needs an ad label (paid or gifted)", "Not sponsored"] },
      { key: "rate", label: "Quoted rate (₹)", type: "money" },
      { key: "status", label: "Status", type: "select", options: ["Shortlisted", "Contacted", "Replied", "Agreed", "Declined"], required: true, column: true },
      { key: "notes", label: "Notes (authenticity checks, past brand work)", type: "textarea" },
    ],
  },
  creativeTests: {
    key: "creativeTests", label: "Creative tests", singular: "creative test", titleField: "offer", statusField: "status",
    fields: [
      { key: "offer", label: "Offer being tested", type: "text", required: true, column: true },
      { key: "client", label: "Client (blank = Buzzly)", type: "text", column: true },
      { key: "hook1", label: "Hook 1", type: "text" },
      { key: "hook2", label: "Hook 2", type: "text" },
      { key: "hook3", label: "Hook 3", type: "text" },
      { key: "campaign", label: "Campaign it runs in", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Drafting", "In production", "Testing", "Done"], required: true, column: true },
      { key: "winner", label: "Winning hook", type: "select", options: ["Hook 1", "Hook 2", "Hook 3", "No clear winner"], column: true },
      { key: "result", label: "Result and what we learned", type: "textarea" },
    ],
  },
  experiments: {
    key: "experiments", label: "Landing page experiments", singular: "experiment", titleField: "name", statusField: "status",
    fields: [
      { key: "name", label: "Experiment", type: "text", required: true, column: true },
      { key: "page", label: "Page", type: "text", column: true, placeholder: "/clients" },
      { key: "hypothesis", label: "Hypothesis", type: "textarea" },
      { key: "change", label: "The one change", type: "text" },
      { key: "metric", label: "Success metric", type: "text", column: true, placeholder: "Form submissions ÷ visitors" },
      { key: "startDate", label: "Start", type: "date", column: true },
      { key: "endDate", label: "End", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Planned", "Running", "Done"], required: true, column: true },
      { key: "result", label: "Result", type: "select", options: ["Won", "Lost", "No difference", "Inconclusive"], column: true },
      { key: "learnings", label: "Learnings", type: "textarea" },
    ],
  },
  prospects: {
    key: "prospects", label: "Cold calling prospects", singular: "prospect", titleField: "business", statusField: "callStatus",
    fields: [
      { key: "business", label: "Business", type: "text", required: true, column: true },
      { key: "category", label: "Kind of business", type: "select", options: PROSPECT_CATEGORIES, required: true, column: true },
      { key: "area", label: "Area", type: "text", column: true, placeholder: "e.g. Gachibowli" },
      { key: "callStatus", label: "Call status", type: "select", options: CALL_OUTCOMES, required: true, column: true },
      { key: "previewStatus", label: "Preview", type: "select", options: PREVIEW_STATUSES, required: true, column: true },
      { key: "nextCall", label: "Next call", type: "datetime", column: true },
      { key: "contactName", label: "Person to ask for", type: "text" },
      { key: "phone", label: "Business phone", type: "tel" },
      { key: "email", label: "Business email", type: "email" },
      { key: "website", label: "Website", type: "url" },
      { key: "instagram", label: "Instagram", type: "url" },
      { key: "mapsLink", label: "Google Maps listing", type: "url" },
      { key: "brandGaps", label: "What we noticed (one per line, shown on their preview)", type: "textarea", placeholder: "Last Instagram post was in March\nNo reels, only menu photos\nGoogle listing has no recent photos" },
      { key: "previewNote", label: "Personal note on their preview", type: "textarea" },
      { key: "attempts", label: "Call attempts", type: "number" },
      { key: "owner", label: "Caller", type: "text" },
      { key: "previewViewedAt", label: "Preview first opened", type: "text" },
      { key: "notes", label: "Call notes", type: "textarea" },
    ],
  },
  aiChecks: {
    key: "aiChecks", label: "AI search visibility", singular: "check", titleField: "question", statusField: "mentioned",
    fields: [
      { key: "question", label: "Buyer question asked", type: "text", required: true, column: true },
      { key: "engine", label: "AI tool", type: "select", options: ["ChatGPT", "Google AI Overview", "Perplexity", "Gemini", "Copilot", "Claude"], required: true, column: true },
      { key: "checkedOn", label: "Checked on", type: "date", required: true, column: true },
      { key: "mentioned", label: "Buzzly mentioned?", type: "select", options: ["Yes", "No"], required: true, column: true },
      { key: "citedPage", label: "Page cited", type: "text", column: true },
      { key: "competitorsMentioned", label: "Others mentioned", type: "text" },
      { key: "notes", label: "Notes (answers vary run to run)", type: "textarea" },
    ],
  },
  seoKeywords: {
    key: "seoKeywords", label: "SEO keywords", singular: "keyword", titleField: "keyword", statusField: "status",
    fields: [
      { key: "keyword", label: "Keyword", type: "text", required: true, column: true, placeholder: "e.g. social media agency in Hyderabad" },
      { key: "page", label: "Target page", type: "text", column: true, placeholder: "e.g. /services" },
      { key: "intent", label: "Search intent", type: "select", options: ["Informational", "Commercial", "Transactional", "Local"], column: true },
      { key: "status", label: "Status", type: "select", options: SEO_STATUSES, required: true, column: true },
      { key: "position", label: "Google position now", type: "number", column: true },
      { key: "previousPosition", label: "Position last check", type: "number" },
      { key: "volume", label: "Monthly searches", type: "number" },
      { key: "checkedOn", label: "Checked on", type: "date", column: true },
      { key: "client", label: "Client (blank = Buzzly)", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  /** Content pieces belong to a client; the planner (components/crm/ContentPlanner.tsx) is their main screen. */
  content: {
    key: "content", label: "Content plan", singular: "piece", titleField: "title", statusField: "stage",
    fields: [
      { key: "title", label: "Title or idea", type: "text", required: true, column: true },
      { key: "clientId", label: "Client", type: "text", required: true },
      { key: "type", label: "Type", type: "select", options: CONTENT_TYPES, required: true, column: true },
      { key: "stage", label: "Stage", type: "select", options: CONTENT_STAGES, required: true, column: true },
      { key: "postDate", label: "Post date", type: "date", required: true, column: true },
      { key: "platform", label: "Platform", type: "select", options: CONTENT_PLATFORMS },
      { key: "owner", label: "Who is on it", type: "text" },
      { key: "hook", label: "Hook / brief", type: "textarea" },
      { key: "link", label: "Link (draft or live post)", type: "url" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
};

export const entityKeys = Object.keys(entities) as EntityKey[];
export const isEntityKey = (value: string): value is EntityKey => (entityKeys as string[]).includes(value);

/**
 * Postel's law: accept money the way people type it. "₹45,000", "45000", "45k",
 * "1.2L", "1.2 lakh" and "2 cr" all become plain rupees. Anything else is left
 * for the validator to reject with a clear message.
 */
export function parseAmount(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const cleaned = value.trim().toLowerCase().replace(/[₹,\s]|rs\.?|inr|\/(month|mo)$/g, "");
  if (!cleaned) return "";
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(k|l|lac|lakh|lakhs|cr|crore|crores)?$/);
  if (!match) return value;
  const scale: Record<string, number> = { k: 1e3, l: 1e5, lac: 1e5, lakh: 1e5, lakhs: 1e5, cr: 1e7, crore: 1e7, crores: 1e7 };
  return Math.round(Number(match[1]) * (match[2] ? scale[match[2]] : 1));
}

/** Builds the validator for one section from its field list. Empty optional fields are dropped. */
export function schemaFor(entity: Entity) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of entity.fields) {
    let rule: z.ZodTypeAny;
    switch (field.type) {
      case "number": rule = z.coerce.number().finite().min(0).max(1e12); break;
      case "money": rule = z.preprocess(parseAmount, z.coerce.number({ invalid_type_error: "Use an amount like 45000, 45k or 1.2L" }).finite().min(0).max(1e12)); break;
      case "percent": rule = z.coerce.number().min(0).max(100); break;
      case "email": rule = z.string().trim().email().max(200); break;
      case "url": rule = z.string().trim().url().max(500); break;
      case "date": rule = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"); break;
      case "datetime": rule = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Use a valid date and time"); break;
      case "select": rule = z.enum(field.options as [string, ...string[]]); break;
      case "textarea": rule = z.string().trim().max(5000); break;
      default: rule = z.string().trim().min(field.required ? 1 : 0).max(300);
    }
    const blankToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
    shape[field.key] = z.preprocess(blankToUndefined, field.required ? rule : rule.optional());
  }
  return z.object(shape).strict();
}

export type CrmRecord = { id: string; entity: EntityKey; data: Record<string, string | number>; createdAt: string; updatedAt: string };
