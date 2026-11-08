/**
 * Public site settings shared by metadata, the sitemap, robots and share cards.
 * Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://buzzly.media").replace(/\/$/, "");

export const siteName = "Buzzly";
export const siteTitle = "Buzzly — Building Brands Through Content";
export const siteDescription =
  "Buzzly is a technology-led company builder. We build brands through content—our own companies and ambitious partners’ businesses.";

export type NavLink = { href: string; label: string; caret?: boolean };

export const primaryNav: NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", caret: true },
  { href: "/companies", label: "Our companies" },
  { href: "/clients", label: "Clients" },
  { href: "/logo", label: "Logo" },
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
