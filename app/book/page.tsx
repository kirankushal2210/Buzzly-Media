import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { bookingLink, CALL_MINUTES } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Book an intro call",
  description: "Schedule a 15-minute introductory call with Buzzly about your brand, your goals, and how content could help.",
  alternates: { canonical: "/book" },
};

const expectations = [
  { label: "Duration", text: `${CALL_MINUTES} minutes, online.` },
  { label: "What we’ll cover", text: "Your brand, your audience, and what you want content and distribution to achieve." },
  { label: "Before the call", text: "Add a line about your brand when you book, so we arrive prepared." },
  { label: "Your time zone", text: "Available times appear in your local time automatically." },
];

export default function Book() {
  const link = bookingLink();
  return (
    <Interior eyebrow="BUZZLY / INTRO CALL" title="Let’s talk for fifteen minutes." intro="A short introductory call about your brand and your marketing needs, and whether Buzzly is the right partner to help.">
      <section className="interior-content book-layout" aria-label="Book an intro call">
        <aside className="book-details">
          <h2>What to expect</h2>
          <dl>
            {expectations.map(item => (
              <div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>
            ))}
          </dl>
          <p className="book-alt">Prefer to write? <Link href="/contact">Send us a message</Link> instead.</p>
        </aside>
        <BookingScheduler link={link} />
      </section>
    </Interior>
  );
}
