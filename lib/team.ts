/**
 * The Buzzly team, shown on /team, /about and /careers.
 *
 * `team` starts EMPTY on purpose: never list a person who hasn't agreed to
 * be on the site. To add someone, append an entry and redeploy.
 * Photos: put them in public/team/, ideally a background-removed PNG
 * (a cut-out) so the person sits straight on the brand red, at least 800px.
 * Until people are added, each role group shows a "profile coming soon" tile.
 */

/** The kinds of people behind the work, listed beside the portraits. Mirrors the careers areas. */
export const roleGroups = [
  { id: "film", title: "Filmmakers & Editors", line: "People who make the films and the edit" },
  { id: "design", title: "Designers", line: "People who shape every frame" },
  { id: "strategy", title: "Strategists", line: "People who find the idea worth telling" },
  { id: "social", title: "Social Managers", line: "People who run the channels day to day" },
  { id: "growth", title: "Growth Specialists", line: "People who get the work seen" },
  { id: "tech", title: "Developers", line: "People who make it actually work" },
] as const;

export type RoleGroupId = (typeof roleGroups)[number]["id"];

export type TeamMember = {
  name: string;
  /** Their own job title, shown on hover. */
  role: string;
  group: RoleGroupId;
  /** Path under /public, e.g. "/team/jane.png". Initials are shown without one. */
  photo?: string;
  linkedin?: string;
};

export const team: TeamMember[] = [];

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]!.toUpperCase()).join("");
