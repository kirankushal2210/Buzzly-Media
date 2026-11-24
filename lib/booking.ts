/**
 * Strategy-call slot helpers for the booking UI shown after the lead form.
 * Times are India Standard Time (UTC+05:30, no daylight saving).
 * TODO: Swap with live Cal.com embed in backend phase — replace these generated slots with real availability.
 */
export const CALL_MINUTES = 20;
export const IST_SLOT_TIMES = ["11:00", "14:00", "16:30", "18:00"] as const;

export type BookingDay = { iso: string; weekday: string; day: string; month: string };

const istDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
const weekdayName = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });
const longDay = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** The next `count` Monday–Friday dates in IST, starting tomorrow. */
export function nextBusinessDaysIST(count = 5, now = new Date()): BookingDay[] {
  const [year, month, day] = istDate.format(now).split("-").map(Number);
  let cursor = Date.UTC(year, month - 1, day);
  const days: BookingDay[] = [];
  while (days.length < count) {
    cursor += 86_400_000;
    const date = new Date(cursor);
    const weekday = date.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    days.push({ iso: date.toISOString().slice(0, 10), weekday: weekdayName.format(date), day: String(date.getUTCDate()), month: monthName.format(date) });
  }
  return days;
}

/** "14:30" → "2:30 PM" */
export function formatSlotTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${((hours + 11) % 12) + 1}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

/** "Tuesday, 24 November · 11:00 AM IST" */
export function describeSlot(dayIso: string, time: string) {
  return `${longDay.format(new Date(`${dayIso}T00:00:00Z`))} · ${formatSlotTime(time)} IST`;
}
