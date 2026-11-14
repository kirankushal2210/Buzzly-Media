/**
 * Careers page content. Everything here is maintained by the owner.
 *
 * `openRoles` is the only list that claims something about the business
 * (that a job exists), so it starts EMPTY: never list a role that is not
 * really open. While it is empty the page invites open applications instead.
 * To publish a role, add an entry and redeploy — no layout work needed.
 */

export type OpenRole = {
  /** URL-safe id used as the anchor (#role-<slug>). */
  slug: string;
  title: string;
  team: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  summary: string;
  responsibilities: string[];
  lookingFor: string[];
};

export const openRoles: OpenRole[] = [];

/** The kinds of work Buzzly does, so candidates can see where they would fit. */
export const careerAreas = [
  { number: "01", title: "Content & film", copy: "Directors, editors, motion designers, photographers and writers: the people who make the films, reels, images and stories our brands run on." },
  { number: "02", title: "Social & community", copy: "People who run channels day to day — planning, publishing, replying, reading the numbers and adjusting the next week’s work." },
  { number: "03", title: "Strategy", copy: "Brand and content strategists who find the idea, audience, message and formats before anything is produced." },
  { number: "04", title: "Distribution & growth", copy: "Organic and paid distribution specialists who get strong work in front of the people it is made for." },
  { number: "05", title: "Technology", copy: "Engineers and designers building the sites, tools and systems behind a technology-first agency and its sub-companies." },
];

/** Why the work here is different — each point maps to something the site already says about Buzzly. */
export const whyBuzzly = [
  { title: "Brands we own, not only briefs.", copy: "De Food Kampney, Buzzly Health and Buzzly Properties are sub-companies founded and operated by Buzzly. You build for them as well as for outside partners." },
  { title: "Content with a point of view.", copy: "We would rather make one thing people want to watch than ten things they scroll past. Taste and judgement matter as much as speed." },
  { title: "Technology is part of the craft.", copy: "Tools, data and systems sit next to cameras and copy. Curiosity about how things work is expected in every role." },
];

/** What happens after someone writes in. Kept short and honest; the owner adjusts it as the process matures. */
export const hiringSteps = [
  { title: "Write to us", copy: "Use the contact form with “Joining the team” selected. Tell us what you make and link to work you are proud of." },
  { title: "A short call", copy: "If there is a fit, we set up an introductory conversation about the work and what you are looking for." },
  { title: "A practical conversation", copy: "We talk through a real piece of Buzzly work together, so both sides see how we think." },
  { title: "A clear answer", copy: "We reply to everyone who reaches the call stage, either way." },
];

/** Where an application goes: the contact form with the careers interest pre-selected. */
export const applyHref = "/contact?interest=careers";
