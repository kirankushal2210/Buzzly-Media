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
    quote: "We cook well, but nobody could see that from a delivery app. Buzzly put our kitchen on camera every week, and our regulars started recognising the faces behind the food.",
    name: "Ritika M.",
    role: "Founder",
    company: "Tindora Kitchen",
    approved: false,
  },
  {
    quote: "They turned the questions our patients ask every day into short, calm videos. New patients now walk in already understanding what we do.",
    name: "Dr. Arjun K.",
    role: "Clinic Director",
    company: "Luma Physio Studio",
    approved: false,
  },
  {
    quote: "One walkthrough shoot gave us weeks of content, and every piece told buyers exactly how to book a visit. It finally felt like one story, not a pile of posts.",
    name: "Neha S.",
    role: "Head of Marketing",
    company: "Brickloom Homes",
    approved: false,
  },
];

/**
 * Client wins shown on the homepage and /clients until real client stories
 * are approved. These brands are FICTIONAL samples (as are the quotes above);
 * every place that shows them labels them as samples. Buzzly's own
 * sub-companies are never listed here: they are owned ventures, not clients.
 * Replace each entry with a real, approved client story, then drop `sample`.
 */
export type ClientWin = { company: string; field: string; services: string[]; win: string; accent: string; sample: boolean };

export const clientWins: ClientWin[] = [
  { company: "Tindora Kitchen", field: "Cloud kitchen", services: ["Content", "Social media"], win: "A weekly behind-the-pass reel series that gave a delivery-only kitchen faces people recognise.", accent: "#ef342d", sample: true },
  { company: "Luma Physio Studio", field: "Physiotherapy clinic", services: ["Strategy", "Content"], win: "Short explainers that answer the questions patients ask at the front desk, before they ask them.", accent: "#f5efdf", sample: true },
  { company: "Brickloom Homes", field: "Residential developer", services: ["Content", "Distribution"], win: "One walkthrough shoot cut into reels and stories, each pointing buyers to a site-visit booking.", accent: "#bbb5a9", sample: true },
  { company: "Mitti Mae Skincare", field: "D2C skincare", services: ["Creators", "Social media"], win: "Local creators sharing honest routines, with paid support only behind the posts people saved.", accent: "#ef342d", sample: true },
];

export type ClientLogo = { name: string; field: string; href?: string };

export const clientLogos: ClientLogo[] = [
  { name: "Hospitality & Dining", field: "Partner Category", href: "/contact" },
  { name: "Health & Wellness", field: "Partner Category", href: "/contact" },
  { name: "Real Estate & Living", field: "Partner Category", href: "/contact" },
  { name: "Your Brand", field: "Next Partner", href: "/contact" },
];
