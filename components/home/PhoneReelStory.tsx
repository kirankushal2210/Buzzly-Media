"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import Link from "@/components/Link";
import { useMotionPreferences } from "@/hooks/use-in-view";
import { companies, services } from "@/lib/content";

/**
 * The homepage story: the positioning statement sits beside a phone. As you
 * scroll, the statement fades, the phone glides to the centre of the stage,
 * the reels inside it advance one by one, and finally the stage releases and
 * scrolls away to reveal "Work in motion".
 *
 * How it stays smooth:
 *  - Progress is read from the section and stage only. The phone sits in
 *    `.reel-slot`, which is NEVER transformed; the motion is applied to
 *    `.reel-rig` inside it. Measuring an element while moving that same
 *    element makes every frame feed back into the next (the phone stops short
 *    of the centre and flips sideways on every scroll event), so keep it so.
 *  - The displayed progress eases toward the scroll position, so mouse-wheel
 *    notches turn into continuous motion instead of jumps.
 *  - Only `transform` and `opacity` change, written straight to three
 *    elements. Reel changes are a CSS transition on the feed, which the
 *    browser runs off the main thread.
 *  - With reduced motion nothing is pinned or moved: a static phone with tabs.
 *
 * Scene map, as a fraction of the pinned scroll distance:
 *   0.00–0.06  scroll hint fades
 *   0.05–0.20  statement fades out
 *   0.08–0.26  phone glides from its slot to the centre (on phones it rises)
 *   0.40 …     second reel; the remaining reels share what is left evenly
 *   1.00       the stage releases
 *
 * Each reel is a typographic card for now. When a vertical film exists for a
 * reel it belongs in this component as a layer above the card.
 */

type Reel = {
  id: string;
  /** Card colour. */
  tone: string;
  /** Colour of the italic second headline line (defaults to the ink colour). */
  accent?: string;
  over: string;
  headline: [string, string];
  points?: string[];
  kicker: string;
  title: string;
  href: string;
  /** Button verb, plus an optional detail that is dropped when the phone is too narrow for it. */
  cta: string;
  ctaDetail?: string;
  tab: string;
};

/** "Food is culture." → ["Food is", "culture."] so the last word can carry the italic. */
function splitHeadline(text: string): [string, string] {
  const cut = text.lastIndexOf(" ");
  return cut > 0 ? [text.slice(0, cut), text.slice(cut + 1)] : [text, ""];
}

const reels: Reel[] = [
  ...companies.map<Reel>(company => ({
    id: company.slug,
    tone: company.accent,
    over: "A Buzzly sub-company",
    headline: splitHeadline(company.word),
    kicker: company.field,
    title: company.name,
    href: `/companies/${company.slug}`,
    cta: "Explore",
    ctaDetail: company.name,
    tab: company.name,
  })),
  {
    id: "partners",
    tone: "#ef342d",
    accent: "#f5efdf",
    over: "For outside partners",
    headline: ["Bring us", "the brief."],
    points: services.map(service => service.title),
    kicker: "Ambitious brands",
    title: "Your brand next.",
    href: "/contact",
    cta: "Start a Project",
    tab: "Partners",
  },
];

const HINT_END = 0.06;
const FADE = [0.05, 0.2] as const;
const GLIDE = [0.08, 0.26] as const;
/** The second reel takes over here; the rest split the remaining distance evenly. */
const REEL_FIRST = 0.4;
/** How quickly the displayed progress follows the scroll position (time constant, ms). */
const FOLLOW_MS = 95;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
const reelStep = (count: number) => (1 - REEL_FIRST) / Math.max(1, count - 1);
const reelAt = (progress: number, count: number) =>
  progress < REEL_FIRST || count < 2 ? 0 : Math.min(count - 1, 1 + Math.floor((progress - REEL_FIRST) / reelStep(count)));

export function PhoneReelStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reducedMotion } = useMotionPreferences();
  const count = reels.length;

  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current, copy = copyRef.current, slot = slotRef.current, rig = rigRef.current, hint = hintRef.current;
    if (!section || !stage || !copy || !slot || !rig) return;
    if (reducedMotion) {
      // Hand control back to the stylesheet (static layout); tabs switch reels.
      for (const element of [copy, rig, hint]) element?.removeAttribute("style");
      return;
    }

    let frame = 0;
    let lastTime = 0;
    let shown = -1; // eased progress; -1 until the first frame
    let rise = 0; // how far below centre the phone starts (phones only), in px

    const readRise = () => {
      rise = (parseFloat(getComputedStyle(stage).getPropertyValue("--reel-rise")) || 0) * stage.offsetHeight;
    };

    /** Scroll progress through the pinned distance. Reads the section and stage only. */
    const target = () => clamp01(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - stage.offsetHeight));

    const apply = (progress: number) => {
      const fade = 1 - ease((progress - FADE[0]) / (FADE[1] - FADE[0]));
      const glide = ease((progress - GLIDE[0]) / (GLIDE[1] - GLIDE[0]));
      // `slot` is never transformed (only `rig` inside it is), so this distance does not depend on our own output.
      const stageBox = stage.getBoundingClientRect();
      const slotBox = slot.getBoundingClientRect();
      const toCentre = stageBox.left + stageBox.width / 2 - (slotBox.left + slotBox.width / 2);
      rig.style.transform = `translate3d(${(toCentre * glide).toFixed(2)}px,${(rise * (1 - glide)).toFixed(2)}px,0)`;
      copy.style.opacity = fade.toFixed(3);
      copy.style.transform = `translate3d(0,${((fade - 1) * 24).toFixed(2)}px,0)`;
      copy.style.visibility = fade < 0.02 ? "hidden" : "visible";
      if (hint) hint.style.opacity = (1 - ease(progress / HINT_END)).toFixed(2);
      const index = reelAt(progress, count);
      setActive(previous => (previous === index ? previous : index));
    };

    const tick = (now: number) => {
      frame = 0;
      const goal = target();
      if (shown < 0) {
        shown = goal;
      } else {
        const elapsed = lastTime ? Math.min(80, Math.max(0, now - lastTime)) : 16.7;
        shown += (goal - shown) * (1 - Math.exp(-elapsed / FOLLOW_MS));
        if (Math.abs(goal - shown) < 0.0004) shown = goal;
      }
      lastTime = now;
      apply(shown);
      if (shown !== goal) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (frame) return;
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    };
    const onResize = () => { readRise(); wake(); };

    readRise();
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
    };
  }, [count, reducedMotion]);

  /** Tab click: scroll to the middle of that reel's stretch (or just switch, with reduced motion). */
  const show = (index: number) => {
    const section = sectionRef.current, stage = stageRef.current;
    if (reducedMotion || !section || !stage) { setActive(index); return; }
    const progress = index === 0 ? GLIDE[1] + 0.04 : REEL_FIRST + (index - 0.5) * reelStep(count);
    const top = section.getBoundingClientRect().top + window.scrollY + progress * (section.offsetHeight - stage.offsetHeight);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="reel-story" id="film" ref={sectionRef} aria-label="What Buzzly builds" style={{ "--reel-count": count } as CSSProperties}>
      <div className="reel-stage" ref={stageRef}>
        <div className="reel-copy hero-statement" ref={copyRef}>
          <p>A technology-led company builder with content at its core.</p>
          <small>We build our own businesses and help ambitious partners grow through strategy, storytelling, and distribution.</small>
          <Link className="outlinecta" href="/work">Our Work</Link>
        </div>

        <div className="reel-slot" ref={slotRef}>
          <div className="reel-rig" ref={rigRef}>
            <div className="reel-phone">
              <span className="reel-island" aria-hidden="true" />
              <div className="reel-screen">
                <ul className="reel-feed" style={{ "--reel-index": active } as CSSProperties}>
                  {reels.map((reel, index) => (
                    <li
                      className={`reel-item${index === active ? " is-active" : ""}`}
                      key={reel.id}
                      inert={index !== active}
                      style={{ "--tone": reel.tone, ...(reel.accent ? { "--tone-accent": reel.accent } : {}) } as CSSProperties}
                    >
                      <div className="reel-card">
                        <span className="reel-over">{reel.over}</span>
                        <p className="reel-headline"><span className="reel-line">{reel.headline[0]}</span><em className="reel-line">{reel.headline[1]}</em></p>
                        {reel.points && <ol className="reel-points">{reel.points.map((point, i) => <li key={point}><span>0{i + 1}</span>{point}</li>)}</ol>}
                      </div>
                      <div className="reel-top" aria-hidden="true"><span>BUZZLY / REELS</span><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span></div>
                      <div className="reel-side" aria-hidden="true"><Heart strokeWidth={1.6} /><MessageCircle strokeWidth={1.6} /><Send strokeWidth={1.6} /><Bookmark strokeWidth={1.6} /></div>
                      <div className="reel-caption">
                        <span className="reel-kicker">{reel.kicker}</span>
                        <p className="reel-title">{reel.title}</p>
                        <Link href={reel.href} aria-label={reel.ctaDetail ? `${reel.cta} ${reel.ctaDetail}` : reel.cta}>
                          {reel.cta}{reel.ctaDetail && <span className="reel-cta-detail"> {reel.ctaDetail}</span>} ↗
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="reel-tabs" role="group" aria-label="Choose a reel">
              {reels.map((reel, index) => (
                <button type="button" key={reel.id} aria-pressed={index === active} onClick={() => show(index)}>
                  <span className="reel-dot" aria-hidden="true" /><span>{reel.tab}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="reel-hint" ref={hintRef} aria-hidden="true"><span>SCROLL</span><span>↓</span></div>
      </div>
    </section>
  );
}
