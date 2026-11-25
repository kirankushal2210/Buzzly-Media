/**
 * 3D icon images that tell record types apart in the activity feed, the page
 * search and notifications. Images: Microsoft Fluent Emoji 3D (MIT), stored in
 * public/admin/icons. Navigation, toolbar and content types use line icons.
 */
export type IconName =
  | "money" | "handshake" | "lead" | "phone" | "client" | "target" | "outreach" | "creator" | "chart" | "test"
  | "search" | "experiment" | "robot" | "calendar" | "reel" | "post" | "planner" | "home" | "bell" | "pin";

export function Emoji({ name }: { name: IconName }) {
  // Decorative: the text next to each tile already says what it is.
  // eslint-disable-next-line @next/next/no-img-element -- tiny static icons, no optimisation needed
  return <img className="as-emoji" src={`/admin/icons/${name}.png`} alt="" width={256} height={256} loading="lazy" decoding="async" />;
}

/** One icon per CRM section, used for activity rows. */
export const ENTITY_EMOJI: Record<string, IconName> = {
  leads: "lead", deals: "handshake", calls: "phone", clients: "client", prospects: "target", outreach: "outreach", creators: "creator",
  campaigns: "chart", creativeTests: "test", adResearch: "search", experiments: "experiment", aiChecks: "robot", weekly: "calendar", content: "reel", seoKeywords: "search",
};

/** One icon per admin page, used in the "Go to" search and notifications. */
export const PAGE_EMOJI: Record<string, IconName> = {
  "/admin": "home", "/admin/leads": "lead", "/admin/sales": "handshake", "/admin/clients": "client", "/admin/content": "planner",
  "/admin/calling": "phone", "/admin/outreach": "outreach", "/admin/performance": "chart", "/admin/research": "experiment", "/admin/seo": "search",
  "/admin/ai-visibility": "robot", "/admin/scorecard": "calendar",
};
