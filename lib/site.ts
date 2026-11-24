/**
 * Public site settings shared by metadata, the sitemap, robots and share cards.
 * Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash).
 *
 * Business settings (booking link, WhatsApp, socials) are read from
 * NEXT_PUBLIC_* variables so the owner can change them without a code edit.
 * They are inlined at build time: changing one requires a redeploy.
 */
/**
 * Canonical origin. Order: NEXT_PUBLIC_SITE_URL (the real domain) → the
 * production URL Vercel provides at build time → the per-deployment Vercel
 * URL → localhost. Never a hard-coded domain: `buzzly.media` belongs to an
 * unrelated company and must not appear in our sitemap, canonicals or emails.
 */
function resolveSiteUrl(): { url: string; source: "env" | "vercel-production" | "vercel-deployment" | "localhost" } {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && /^https?:\/\//.test(explicit)) return { url: explicit.replace(/\/$/, ""), source: "env" };
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return { url: `https://${vercelProd.replace(/^https?:\/\//, "").replace(/\/$/, "")}`, source: "vercel-production" };
  const vercelDeploy = process.env.VERCEL_URL?.trim();
  if (vercelDeploy) return { url: `https://${vercelDeploy.replace(/^https?:\/\//, "").replace(/\/$/, "")}`, source: "vercel-deployment" };
  return { url: "http://localhost:5173", source: "localhost" };
}

const resolvedSite = resolveSiteUrl();
export const siteUrl = resolvedSite.url;
/** Where `siteUrl` came from; "env" is the only correct value in production. */
export const siteUrlSource = resolvedSite.source;

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
 * The one response-time promise shown everywhere (contact page, footer, FAQ,
 * auto-reply). Change it here only, and only to something the team can keep.
 */
export const responsePromise = "two working days";

const trimmed = (value: string | undefined) => value?.trim() || null;

/**
 * Official social profiles, used in the Organization schema (`sameAs`) so
 * Google can connect them to the site. Comma-separated full URLs in
 * NEXT_PUBLIC_SOCIAL_LINKS, e.g.
 * "https://www.instagram.com/buzzly,https://www.linkedin.com/company/buzzly".
 */
export const socialLinks: string[] = (process.env.NEXT_PUBLIC_SOCIAL_LINKS || "")
  .split(",")
  .map(link => link.trim())
  .filter(link => /^https:\/\//.test(link));

/** Instagram, YouTube and LinkedIn profiles from NEXT_PUBLIC_SOCIAL_LINKS; a channel is hidden until its URL is set. */
export const socialProfiles: { label: "Instagram" | "YouTube" | "LinkedIn"; href: string }[] = ([
  ["Instagram", /(^|\.)instagram\.com$/],
  ["YouTube", /(^|\.)(youtube\.com|youtu\.be)$/],
  ["LinkedIn", /(^|\.)linkedin\.com$/],
] as const).flatMap(([label, host]) => {
  const href = socialLinks.find(link => { try { return host.test(new URL(link).hostname); } catch { return false; } });
  return href ? [{ label, href }] : [];
});

/**
 * Public booking page for intro calls (Cal.com, Calendly, etc.) from
 * NEXT_PUBLIC_BOOKING_URL, e.g. "https://cal.com/your-handle/intro". The
 * contact page hides its booking button while this is null, so visitors never
 * land on a broken link.
 */
export const bookingUrl: string | null = (() => {
  const raw = trimmed(process.env.NEXT_PUBLIC_BOOKING_URL);
  return raw && /^https:\/\//.test(raw) ? raw : null;
})();

/**
 * Buzzly's WhatsApp Business number from NEXT_PUBLIC_WHATSAPP_NUMBER, in
 * international format, digits only (country code first, no "+", spaces or
 * dashes), e.g. "919876543210". The contact page hides its WhatsApp button
 * while this is null.
 */
export const whatsappNumber: string | null = (() => {
  const digits = trimmed(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, "") ?? "";
  return digits.length >= 8 ? digits : null;
})();

/** wa.me chat link with a prefilled greeting, or null when no number is set. */
export function whatsappLink(message = "Hi Buzzly Media, I would like to discuss a project for my brand.") {
  return whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}` : null;
}
