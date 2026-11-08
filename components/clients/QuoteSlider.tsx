"use client";

import Link from "@/components/Link";
import { useCallback, useEffect, useState } from "react";
import type { Testimonial } from "@/lib/clients";

const AUTO_ADVANCE_MS = 7000;

/** Accessible testimonial carousel: arrow buttons, dot tabs, keyboard arrows, and a pausable auto-advance. */
export function QuoteSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => go(index + 1), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, count, go]);

  if (count === 0) return null;

  return (
    <section
      className="quote-slider"
      aria-roledescription="carousel"
      aria-label="What partners say"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
      onKeyDown={event => {
        if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
      }}
    >
      <p className="quote-slider-label">
        CLIENT CONFESSIONS
        {testimonials.some(t => !t.approved) && <small>Quotes marked “awaiting approval” are layout samples and will be replaced with approved partner words.</small>}
      </p>
      <div>
        <div className="quote-stage" aria-live={paused ? "polite" : "off"}>
          {testimonials.map((t, i) => (
            <figure
              className="quote-card"
              key={i}
              data-active={i === index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span><strong>{t.name}</strong> — {t.role}, {t.company}</span>
                {!t.approved && <span className="quote-pending">Sample · awaiting approval</span>}
                {t.caseStudy && <Link href={`/work/${t.caseStudy}`} tabIndex={i === index ? 0 : -1}>Read the case study ↗</Link>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="quote-controls">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous quote">←</button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next quote">→</button>
          <div className="quote-dots">
            {testimonials.map((_, i) => (
              <button key={i} type="button" aria-label={`Show quote ${i + 1}`} aria-current={i === index} onClick={() => go(i)} />
            ))}
          </div>
          <span className="quote-count" aria-hidden="true">0{index + 1} / 0{count}</span>
        </div>
      </div>
    </section>
  );
}
