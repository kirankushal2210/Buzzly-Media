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
    quote: "Buzzly transformed our brand storytelling. Their content gave our brand an authentic voice that connected immediately with our target audience.",
    name: "Partner Name",
    role: "Founder & CEO",
    company: "Partner Brand",
    approved: false,
  },
  {
    quote: "They understood our positioning and built a social-first content engine that drove real engagement and lasting organic reach.",
    name: "Partner Name",
    role: "Marketing Director",
    company: "Partner Brand",
    approved: false,
  },
  {
    quote: "From initial creative strategy to campaign rollout, Buzzly delivered video and social distribution that made our brand stand out.",
    name: "Partner Name",
    role: "Brand Lead",
    company: "Partner Brand",
    approved: false,
  },
];

export type ClientLogo = { name: string; field: string; href?: string };

export const clientLogos: ClientLogo[] = [
  { name: "Hospitality & Dining", field: "Partner Category", href: "/contact" },
  { name: "Health & Wellness", field: "Partner Category", href: "/contact" },
  { name: "Real Estate & Living", field: "Partner Category", href: "/contact" },
  { name: "Your Brand", field: "Next Partner", href: "/contact" },
];
