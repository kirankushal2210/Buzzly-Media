"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "@/components/Link";
import { BOOKING_EMBED_SCRIPT, BOOKING_ORIGIN, bookingPageUrl } from "@/lib/booking";

type Phase = "loading" | "ready" | "slow" | "failed" | "booked";
type Booking = { start: Date | null; end: Date | null };

type CalEvent = { detail?: { data?: Record<string, unknown> } };
type CalApi = ((...args: unknown[]) => void) & { q?: unknown[] };
type CalGlobal = CalApi & { loaded?: boolean; ns: Record<string, CalApi>; q: unknown[] };
declare global { interface Window { Cal?: CalGlobal } }

const NAMESPACE = "buzzly-intro";
const SLOW_AFTER_MS = 12000;

/**
 * Cal.com's documented embed loader, typed: queues calls until embed.js arrives.
 * https://cal.com/docs/core-features/embed
 */
function loadCal(onScriptError: () => void): CalGlobal {
  const w = window;
  if (!w.Cal) {
    const push = (api: { q?: unknown[] }, args: unknown) => { (api.q ??= []).push(args); };
    const cal = function (...args: unknown[]) {
      const self = w.Cal!;
      if (!self.loaded) {
        self.ns = {};
        self.q = self.q || [];
        const script = document.createElement("script");
        script.src = BOOKING_EMBED_SCRIPT;
        script.async = true;
        script.onerror = onScriptError;
        document.head.appendChild(script);
        self.loaded = true;
      }
      if (args[0] === "init") {
        const namespace = args[1];
        if (typeof namespace === "string") {
          const api = function (...apiArgs: unknown[]) { push(api, apiArgs); } as CalApi;
          self.ns[namespace] = self.ns[namespace] || api;
          push(self.ns[namespace], args);
          push(self, ["initNamespace", namespace]);
        } else push(self, args);
        return;
      }
      push(self, args);
    } as CalGlobal;
    w.Cal = cal;
  }
  return w.Cal;
}

function toDate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Prefill from the URL (e.g. /book?name=Asha&email=asha@example.com) so a visitor arriving from the contact page types less. */
function prefillFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const config: Record<string, string> = {};
  for (const key of ["name", "email", "notes", "company"]) {
    const value = params.get(key)?.trim();
    if (value) config[key] = value.slice(0, key === "notes" ? 1000 : 200);
  }
  return config;
}

export function BookingScheduler({ link }: { link: string | null }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [booking, setBooking] = useState<Booking | null>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLHeadingElement>(null);
  const timeZone = useTimeZone();

  useEffect(() => {
    if (!link || !embedRef.current) return;
    let settled = false;
    const slowTimer = window.setTimeout(() => { if (!settled) setPhase("slow"); }, SLOW_AFTER_MS);
    const cal = loadCal(() => { settled = true; setPhase("failed"); });

    cal("init", NAMESPACE, { origin: BOOKING_ORIGIN });
    const api = cal.ns[NAMESPACE];
    api("inline", {
      elementOrSelector: embedRef.current,
      calLink: link,
      config: { layout: "month_view", theme: "dark", ...prefillFromUrl() },
    });
    api("ui", {
      theme: "dark",
      layout: "month_view",
      hideEventTypeDetails: false,
      cssVarsPerTheme: { dark: { "cal-brand": "#ef342d" }, light: { "cal-brand": "#ef342d" } },
    });
    api("on", { action: "linkReady", callback: () => { settled = true; setPhase(current => (current === "booked" ? current : "ready")); } });
    api("on", { action: "linkFailed", callback: () => { settled = true; setPhase("failed"); } });

    const onBooked = (event: CalEvent) => {
      const data = event.detail?.data ?? {};
      setBooking({ start: toDate(data.startTime ?? data.date), end: toDate(data.endTime) });
      setPhase("booked");
    };
    api("on", { action: "bookingSuccessfulV2", callback: onBooked });
    api("on", { action: "bookingSuccessful", callback: onBooked });

    return () => window.clearTimeout(slowTimer);
  }, [link]);

  useEffect(() => {
    if (phase === "booked") requestAnimationFrame(() => confirmRef.current?.focus());
  }, [phase]);

  if (!link) {
    return (
      <div className="book-panel book-unavailable" role="status">
        <p className="book-kicker">ONLINE BOOKING OPENS SOON</p>
        <h2>The calendar isn’t live yet.</h2>
        <p>We’re setting up online booking. In the meantime, send us a short note and we’ll arrange a time for your 15-minute call.</p>
        <Link className="cta" href="/contact">Send a message instead ↗</Link>
      </div>
    );
  }

  if (phase === "booked") {
    return (
      <div className="book-panel book-confirmed" role="status" aria-live="polite">
        <p className="book-kicker">YOU’RE BOOKED</p>
        <h2 ref={confirmRef} tabIndex={-1}>See you soon.</h2>
        {booking?.start && (
          <p className="book-when">
            <strong>{formatWhen(booking.start, timeZone)}</strong>
            <span>{CALL_LENGTH_LABEL} · {timeZone ? friendlyZone(timeZone) : "your local time"}</span>
          </p>
        )}
        <ul className="book-next">
          <li>A calendar invitation with the meeting link is being sent to the email address you entered. It usually arrives within a few minutes; check your spam folder if you don’t see it.</li>
          <li>Accept the invitation to add the call to your calendar. The same email has links to reschedule or cancel.</li>
          <li>Anything to share beforehand? Simply reply to the invitation email.</li>
        </ul>
        <Link className="outlinecta" href="/work">Explore our work while you wait ↗</Link>
      </div>
    );
  }

  return (
    <div className="book-panel book-scheduler" aria-busy={phase === "loading"}>
      <div className="book-scheduler-head">
        <p className="book-kicker">CHOOSE A TIME</p>
        <p className="book-zone">Times are shown in {timeZone ? <strong>{friendlyZone(timeZone)}</strong> : "your local time zone"}. You can change it in the calendar.</p>
      </div>
      {(phase === "loading" || phase === "slow") && (
        <div className="book-skeleton" aria-hidden="true"><span /><span /><span /></div>
      )}
      <p className="book-status" role="status" aria-live="polite">
        {phase === "loading" && "Loading available times…"}
        {phase === "slow" && <>The calendar is taking longer than usual. <a href={bookingPageUrl(link)} target="_blank" rel="noopener noreferrer">Open it on Cal.com ↗</a></>}
        {phase === "failed" && <>We couldn’t load the calendar here. <a href={bookingPageUrl(link)} target="_blank" rel="noopener noreferrer">Book on Cal.com instead ↗</a> or <Link href="/contact">send us a message</Link>.</>}
      </p>
      <div ref={embedRef} className={`book-embed${phase === "ready" ? " is-ready" : ""}`} hidden={phase === "failed"} />
    </div>
  );
}

const CALL_LENGTH_LABEL = "15-minute intro call";

const noSubscription = () => () => {};
function browserTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { return null; }
}

/** The visitor's IANA time zone. Null during server rendering, which cannot know it. */
function useTimeZone() {
  return useSyncExternalStore(noSubscription, browserTimeZone, () => null);
}

function friendlyZone(zone: string) {
  try {
    const name = new Intl.DateTimeFormat(undefined, { timeZone: zone, timeZoneName: "long" })
      .formatToParts(new Date()).find(part => part.type === "timeZoneName")?.value;
    return name ? `${name} (${zone.replace(/_/g, " ")})` : zone.replace(/_/g, " ");
  } catch {
    return zone;
  }
}

function formatWhen(date: Date, zone: string | null) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short", ...(zone ? { timeZone: zone } : {}) }).format(date);
  } catch {
    return date.toString();
  }
}
