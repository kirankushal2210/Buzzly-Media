/**
 * Public site settings shared by metadata, the sitemap, robots and share cards.
 * Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://buzzly.in").replace(/\/$/, "");

export const siteName = "Buzzly";
export const siteTitle = "Buzzly — Building Brands Through Content";
export const siteDescription =
  "Buzzly is a technology-led company builder. We build brands through content—our own sub-companies and ambitious outside partners’ businesses.";

export type NavLink = { href: string; label: string; caret?: boolean };

export const primaryNav: NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", caret: true },
  { href: "/companies", label: "Our sub-companies" },
  { href: "/clients", label: "Clients" },
];

/**
 * Footer status indicator. Update these when availability changes; set
 * `accepting` to false to show a muted "booked" state instead.
 */
export const studioStatus = {
  accepting: true,
  label: "Taking on new projects",
  detail: "Replies to new inquiries within two working days",
};

/**
 * Official social profiles, used in the Organization schema (`sameAs`) so
 * Google can connect them to the site. Add full URLs, e.g.
 * "https://www.instagram.com/buzzly", "https://www.linkedin.com/company/buzzly".
 */
export const socialLinks: string[] = [];

/**
 * Buzzly's WhatsApp Business number in international format, digits only
 * (country code first, no "+", spaces or dashes), e.g. "919876543210".
 * The contact page hides its WhatsApp button while this is null.
 */
export const whatsappNumber: string | null = null;

/** wa.me chat link with a prefilled greeting, or null when no number is set. */
export function whatsappLink(message = "Hi Buzzly Media, I would like to discuss a project for my brand.") {
  const digits = whatsappNumber?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
