/**
 * Case studies shown on /work and /work/[slug].
 *
 * Every stat here must be true and approved before launch. Entries marked
 * `illustrative` render a visible notice that their numbers are not client results.
 */
export type WorkCategory = "food" | "health" | "real-estate" | "partner";

export const workCategories: { id: WorkCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food" },
  { id: "health", label: "Health" },
  { id: "real-estate", label: "Real Estate" },
  { id: "partner", label: "Partner Content" },
];

export type CaseStudyStat = { value: string; label: string };

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  category: WorkCategory;
  categoryLabel: string;
  year: string;
  summary: string;
  services: string[];
  problem: string;
  solution: string[];
  results: string;
  stats: CaseStudyStat[];
  video: string;
  poster: string;
  accent: string;
  illustrative?: boolean;
  isSubCompany?: boolean;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "de-food-kampney",
    title: "Giving a food platform its appetite.",
    client: "De Food Kampney",
    isSubCompany: true,
    category: "food",
    categoryLabel: "Food Sub-Company",
    year: "2026",
    summary: "Building the brand world for De Food Kampney, an internal sub-company of Buzzly Media for the food and restaurant industry.",
    services: ["Brand strategy", "Company film", "Social content", "Distribution"],
    problem:
      "Restaurants and food businesses are crowded with platforms that all sound the same. De Food Kampney needed a voice that felt like the industry itself—warm, busy, and full of craft—before it could ask anyone to join.",
    solution: [
      "Defined the platform’s story around the people who cook, serve, and run kitchens.",
      "Produced a company film that shows the energy of the food world rather than describing features.",
      "Built a content system of reels, stills, and captions that can be published week after week.",
    ],
    results:
      "De Food Kampney now has a recognisable visual identity and a library of launch content. Audience and growth figures will be published here once they are measured and approved.",
    stats: [
      { value: "01", label: "Company film produced" },
      { value: "Sub-Company", label: "Buzzly Venture" },
      { value: "In build", label: "Stage" },
    ],
    video: "/media/de-food-kampney.mp4",
    poster: "/media/de-food-kampney-poster.webp",
    accent: "#d69454",
  },
  {
    slug: "buzzly-health",
    title: "Making care feel close.",
    client: "Buzzly Health",
    isSubCompany: true,
    category: "health",
    categoryLabel: "Health Sub-Company",
    year: "2026",
    summary: "A calm, human brand language for Buzzly Health, a dedicated sub-company founded and built by Buzzly Media.",
    services: ["Positioning", "Company film", "Content direction"],
    problem:
      "Health brands often lean clinical or loud. Buzzly Health needed to earn trust first: content that feels steady, clear, and centred on people rather than procedures.",
    solution: [
      "Set a quiet visual direction built on natural light, space, and real moments of care.",
      "Produced a company film that introduces the brand without overpromising.",
      "Wrote content principles so every post stays accurate, gentle, and useful.",
    ],
    results:
      "The brand has a clear tone and a film that carries it. Measured outcomes will be added once the company launches publicly.",
    stats: [
      { value: "01", label: "Company film produced" },
      { value: "Sub-Company", label: "Buzzly Venture" },
      { value: "In build", label: "Stage" },
    ],
    video: "/media/buzzly-health.mp4",
    poster: "/media/buzzly-health-poster.webp",
    accent: "#b5c9b1",
  },
  {
    slug: "buzzly-properties",
    title: "Space to grow, on screen.",
    client: "Buzzly Properties",
    isSubCompany: true,
    category: "real-estate",
    categoryLabel: "Property Sub-Company",
    year: "2026",
    summary: "Developing the brand world and film walkthroughs for Buzzly Properties, an internal real estate sub-company of Buzzly Media.",
    services: ["Brand world", "Company film", "Listing content"],
    problem:
      "Property marketing is usually a grid of identical photos. Buzzly Properties needed content that helps people imagine living or working in a space before they visit it.",
    solution: [
      "Built a cinematic style for walkthroughs that follows light and movement through a space.",
      "Produced a company film that sets the tone for every future listing.",
      "Created reusable formats for short-form tours and neighbourhood stories.",
    ],
    results:
      "Buzzly Properties launches with a distinctive film language. Enquiry and reach figures will appear here once verified.",
    stats: [
      { value: "01", label: "Company film produced" },
      { value: "Sub-Company", label: "Buzzly Venture" },
      { value: "In build", label: "Stage" },
    ],
    video: "/media/buzzly-properties.mp4",
    poster: "/media/buzzly-properties-poster.webp",
    accent: "#b7c8c8",
  },
  {
    slug: "the-cafe-story",
    title: "From cafe brief to customers.",
    client: "The Cafe Story",
    category: "partner",
    categoryLabel: "Partner Content",
    year: "2026",
    summary: "A 48-second walkthrough of how a partner brief becomes a reel, finds an audience, and brings people through the door.",
    services: ["Reel scripting", "Filming & editing", "Instagram setup", "Optional Meta ads"],
    problem:
      "A cafe owner wants more people to discover the cafe, but has no time to plan, film, or post content—and no clear idea of what would work.",
    solution: [
      "A social media writer turns the brief into a reel script and sets up the cafe’s Instagram page.",
      "A videographer films the food, the space, and the people; an editor cuts, colours, captions, and scores the reel.",
      "Captions and page details are optimised for discovery, with optional Meta ads planned around the launch.",
    ],
    results:
      "The reel goes live and starts reaching people nearby. In this scenario, views climb toward 100K and 10–20 new customers visit the cafe.",
    stats: [
      { value: "48s", label: "Story film" },
      { value: "100K", label: "Possible views" },
      { value: "10–20", label: "Possible new customers" },
    ],
    video: "/media/buzzly-cafe-story.mp4",
    poster: "/media/buzzly-cafe-story-poster.jpg",
    accent: "#ef342d",
    illustrative: true,
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find(study => study.slug === slug);
}

export function isCategory(value: string | null | undefined): value is WorkCategory {
  return workCategories.some(category => category.id !== "all" && category.id === value);
}
