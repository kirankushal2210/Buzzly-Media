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
/**
 * A client's story in three acts for the homepage story marquee, plus a
 * one-line before → after for the ticker. Written only from that client's
 * own `win` and testimonial; no numbers unless the client supplied them.
 */
export type ClientStory = { before: string; move: string; after: string; shift: [string, string]; quote?: string; by?: string };

export type ClientWin = { company: string; field: string; services: string[]; win: string; accent: string; sample: boolean; story: ClientStory };

export const clientWins: ClientWin[] = [
  { company: "Tindora Kitchen", field: "Cloud kitchen", services: ["Content", "Social media"], win: "A weekly behind-the-pass reel series that gave a delivery-only kitchen faces people recognise.", accent: "var(--red)", sample: true,
    story: { before: "Great food, invisible behind a delivery app.", move: "A weekly behind-the-pass reel series.", after: "Regulars now know the faces behind the food.", shift: ["A faceless kitchen", "faces people recognise"], quote: "Our regulars started recognising the faces behind the food.", by: "Founder" } },
  { company: "Luma Physio Studio", field: "Physiotherapy clinic", services: ["Strategy", "Content"], win: "Short explainers that answer the questions patients ask at the front desk, before they ask them.", accent: "var(--cream)", sample: true,
    story: { before: "The same questions, every day, at the front desk.", move: "Short, calm explainers that answer them first.", after: "New patients walk in already understanding the care.", shift: ["Front-desk questions", "answered before they’re asked"], quote: "They turned the questions our patients ask every day into short, calm videos.", by: "Clinic Director" } },
  { company: "Brickloom Homes", field: "Residential developer", services: ["Content", "Distribution"], win: "One walkthrough shoot cut into reels and stories, each pointing buyers to a site-visit booking.", accent: "var(--soft)", sample: true,
    story: { before: "Listings that felt like a pile of posts.", move: "One walkthrough shoot, cut into weeks of reels and stories.", after: "Every piece points buyers to a site-visit booking.", shift: ["A pile of posts", "one story buyers follow"], quote: "It finally felt like one story, not a pile of posts.", by: "Head of Marketing" } },
  { company: "Mitti Mae Skincare", field: "D2C skincare", services: ["Creators", "Social media"], win: "Local creators sharing honest routines, with paid support only behind the posts people saved.", accent: "var(--red)", sample: true,
    story: { before: "Polished ads people scrolled straight past.", move: "Local creators sharing honest routines.", after: "Paid support only behind the posts people saved.", shift: ["Ads people skipped", "routines people saved"] } },
];

export type ClientLogo = { name: string; field: string; href?: string };

export const clientLogos: ClientLogo[] = [
  { name: "Hospitality & Dining", field: "Partner Category", href: "/contact" },
  { name: "Health & Wellness", field: "Partner Category", href: "/contact" },
  { name: "Real Estate & Living", field: "Partner Category", href: "/contact" },
  { name: "Your Brand", field: "Next Partner", href: "/contact" },
];
