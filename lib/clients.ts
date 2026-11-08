/**
 * Client proof shown on /clients.
 *
 * Only publish quotes that a client has approved in writing. Entries with
 * `approved: false` are layout placeholders: the page labels them clearly so
 * they can never be mistaken for real endorsements. Swap in approved quotes and
 * set `approved: true` to remove the label.
 */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  caseStudy?: string;
  approved: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Buzzly gave our kitchen a voice. The film made people feel the place before they ever walked in.",
    name: "Partner name",
    role: "Founder",
    company: "Food & restaurant partner",
    caseStudy: "de-food-kampney",
    approved: false,
  },
  {
    quote: "They understood that in health, trust comes first. Every piece of content felt calm and honest.",
    name: "Partner name",
    role: "Director",
    company: "Health partner",
    caseStudy: "buzzly-health",
    approved: false,
  },
  {
    quote: "Our listings finally look like places people want to be, not just rooms with furniture.",
    name: "Partner name",
    role: "Head of Sales",
    company: "Property partner",
    caseStudy: "buzzly-properties",
    approved: false,
  },
];

export type ClientLogo = { name: string; field: string; href?: string };

export const clientLogos: ClientLogo[] = [
  { name: "De Food Kampney", field: "Food", href: "/companies/de-food-kampney" },
  { name: "Buzzly Health", field: "Health", href: "/companies/buzzly-health" },
  { name: "Buzzly Properties", field: "Property", href: "/companies/buzzly-properties" },
  { name: "Your brand", field: "Next partner", href: "/contact" },
];
