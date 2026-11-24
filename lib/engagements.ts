import type { PRIMARY_GOALS } from "@/lib/lead";

/**
 * Productized engagement tiers shown on /services. Each tier links to
 * /contact?scope=<slug>, which pre-selects `goal` in the lead form.
 */
export const TIER_SLUGS = ["launch-sprint", "growth-engine", "full-stack-partner"] as const;
export type TierSlug = (typeof TIER_SLUGS)[number];

export type EngagementTier = {
  slug: TierSlug;
  number: string;
  name: string;
  term: string;
  badge?: string;
  summary: string;
  deliverables: string[];
  goal: (typeof PRIMARY_GOALS)[number];
};

export const engagementTiers: EngagementTier[] = [
  {
    slug: "launch-sprint",
    number: "01",
    name: "Content Launch Sprint",
    term: "30 days",
    summary: "A focused first month that gives your brand a clear voice, a flagship film and a bank of reels built to hold attention.",
    deliverables: [
      "Positioning and hook research",
      "1 flagship brand film",
      "8 high-retention short-form reels",
      "Scripting for every piece",
      "Cinema-grade shoot and editing",
      "Publishing playbook",
    ],
    goal: "Brand Awareness & Organic Reach",
  },
  {
    slug: "growth-engine",
    number: "02",
    name: "Monthly Growth Engine",
    term: "Monthly",
    badge: "Most popular",
    summary: "A steady monthly engine that keeps publishing, learns from every post and points viewers toward an enquiry.",
    deliverables: [
      "16–20 short-form reels a month",
      "AI-assisted retention scripting",
      "Distribution on Instagram, YouTube Shorts and LinkedIn",
      "Bi-weekly analytics and iteration",
      "Conversion funnel optimization",
    ],
    goal: "Inbound Lead Generation",
  },
  {
    slug: "full-stack-partner",
    number: "03",
    name: "Full-Stack Brand & Tech Partner",
    term: "Monthly",
    summary: "Content, distribution and the technology that turns attention into pipeline, run by one team.",
    deliverables: [
      "Everything in the Monthly Growth Engine",
      "Custom high-converting landing pages",
      "Automated lead-capture workflows",
      "Dedicated creative and engineering squad",
    ],
    goal: "Full Content & Distribution Engine",
  },
];

export const tierBySlug = (slug: string | null | undefined) => engagementTiers.find(tier => tier.slug === slug);

/**
 * Buyer questions answered on /contact. Review these answers with the team
 * before launch: they describe how engagements run, so keep them true.
 */
export const leadFaqs: { question: string; answer: string }[] = [
  {
    question: "How quickly will I hear back, and how soon can work start?",
    answer: "We reply personally to every inquiry. Once we have agreed a scope together, we schedule the strategy call and the first shoot. The Content Launch Sprint runs over 30 days from kickoff.",
  },
  {
    question: "Where do shoots happen? Do I need a studio?",
    answer: "No studio needed. We are based in Hyderabad and usually shoot on location at your business: the kitchen, clinic, site or office your customers already know. Shoots in other cities are planned as part of your scope before anything is booked.",
  },
  {
    question: "Who approves scripts, and how do revisions work?",
    answer: "You approve every script before shoot day and every edit before it is published. Feedback goes to one point of contact, and the number of revision rounds is written into your scope, so there are no surprises.",
  },
  {
    question: "Is there a minimum commitment?",
    answer: "The Content Launch Sprint is a single 30-day engagement. The Monthly Growth Engine and the Full-Stack Brand & Tech Partner are monthly engagements, and any minimum term is set out in your proposal before you sign anything.",
  },
];
