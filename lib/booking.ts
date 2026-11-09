/**
 * Intro-call booking (Cal.com).
 *
 * Set NEXT_PUBLIC_CAL_LINK to the Cal.com event, e.g. "buzzly/intro-call" (a full
 * https://cal.com/... URL is accepted too). It is public on purpose: it is the same
 * link anyone can open. Until it is set, /book shows an "opening soon" state that
 * points visitors to the contact form instead of a broken calendar.
 */
export const BOOKING_ORIGIN = "https://app.cal.com";
export const BOOKING_EMBED_SCRIPT = `${BOOKING_ORIGIN}/embed/embed.js`;
export const CALL_MINUTES = 15;

export function bookingLink(): string | null {
  const raw = process.env.NEXT_PUBLIC_CAL_LINK?.trim();
  if (!raw) return null;
  const link = raw
    .replace(/^https?:\/\/(app\.)?cal\.com\//i, "")
    .replace(/[?#].*$/, "")
    .replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9][a-z0-9_.-]*(\/[a-z0-9][a-z0-9_.-]*)?$/i.test(link) ? link : null;
}

/** The same event on cal.com, used as a fallback if the embedded calendar cannot load. */
export const bookingPageUrl = (link: string) => `https://cal.com/${link}`;
