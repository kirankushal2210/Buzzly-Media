"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import Link from "@/components/Link";
import { useMotionPreferences } from "@/hooks/use-in-view";
import { companies, services } from "@/lib/content";

/**
 * The homepage story: the positioning statement sits beside a phone that plays
 * the sub-company reels. As you scroll, the statement fades, the phone glides
 * to the centre, the reels advance one by one, and finally the phone scrolls
 * away to reveal "Work in motion". Scroll-linked (no timers), no layout shift
 * (transforms and opacity only), and with reduced motion it becomes a static
 * phone with tabs.
 *
 * Scene map, as a fraction of the section's scroll range:
 *   0.00–0.10  statement + phone at the right (phone shows reel 1)
 *   0.10–0.28  statement fades out, phone glides to the centre
 *   0.24–0.90  reels advance (equal bands; the swap happens in the last 35% of each band)
 *   0.90–1.00  last reel holds, then the sticky frame releases and scrolls away
 */

type Reel =
  | { kind: "film"; id: string; eyebrow: string; title: string; caption: string; video: string; poster: string; href: string; cta: string }
  | { kind: "brief"; id: string; eyebrow: string; title: string; caption: string; points: string[]; href: string; cta: string };

const reels: Reel[] = [
  ...companies.map<Reel>(company => ({
    kind: "film",
    id: company.slug,
    eyebrow: company.field,
    title: company.name,
    caption: company.word,
    video: company.video,
    poster: company.poster,
    href: `/companies/${company.slug}`,
    cta: `Explore ${company.name}`,
  })),
  {
    kind: "brief",
    id: "partners",
    eyebrow: "Outside partners",
    title: "Your brand next.",
    caption: "Bring us the brief.",
    points: services.map(service => service.title),
    href: "/contact",
    cta: "Start a Project",
  },
];

const INTRO_END = 0.10;
const GLIDE_END = 0.28;
const REELS_START = 0.24;
const REELS_END = 0.90;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };

export function PhoneReelStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [loadedUpTo, setLoadedUpTo] = useState(-1);
  const { reducedMotion, saveData } = useMotionPreferences();
  const count = reels.length;

  const attachSources = useCallback((index: number) => setLoadedUpTo(current => Math.max(current, Math.min(count - 1, index + 1))), [count]);

  // Start loading the first reels shortly before the section is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || saveData) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { attachSources(0); observer.disconnect(); }
    }, { rootMargin: "300px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [attachSources, saveData]);

  // Scroll-linked choreography: every value is a CSS custom property on the stage.
  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current, slot = slotRef.current, phone = phoneRef.current;
    if (!section || !stage || !slot || !phone) return;
    if (reducedMotion) {
      stage.style.removeProperty("--copy");
      stage.style.removeProperty("--shift");
      stage.classList.remove("copy-hidden");
      stage.style.setProperty("--feed", `${active * 100}%`);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const p = clamp01(-rect.top / range);

      // Statement fades while the phone glides from its slot to the viewport centre.
      const glide = smooth((p - INTRO_END) / (GLIDE_END - INTRO_END));
      const slotRect = slot.getBoundingClientRect();
      const distance = window.innerWidth / 2 - (slotRect.left + slotRect.width / 2);
      const copy = 1 - smooth(((p - INTRO_END * 0.6) / (GLIDE_END - INTRO_END)) * 1.4);
      stage.style.setProperty("--copy", copy.toFixed(3));
      stage.classList.toggle("copy-hidden", copy < 0.04);
      stage.style.setProperty("--shift", `${(distance * glide).toFixed(1)}px`);
      stage.style.setProperty("--hint", (1 - smooth(p / INTRO_END)).toFixed(2));

      // Reels: equal bands; the feed slides during the last 35% of each band.
      const band = clamp01((p - REELS_START) / (REELS_END - REELS_START)) * (count - 1);
      const index = Math.min(count - 2, Math.floor(band));
      const within = band - index;
      const feed = count > 1 ? index + smooth((within - 0.65) / 0.35) : 0;
      stage.style.setProperty("--feed", `${(feed * 100).toFixed(2)}%`);
      const current = Math.round(feed);
      setActive(previous => (previous === current ? previous : current));
      if (p > 0.02) attachSources(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [active, attachSources, count, reducedMotion]);

  // Only the visible reel plays; everything else is paused and never autoplays with reduced motion / data saver.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && !reducedMotion && !saveData && !document.hidden && video.getAttribute("src")) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, loadedUpTo, reducedMotion, saveData]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) videoRefs.current.forEach(video => video?.pause()); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /** Tab click: jump the page to that reel's band (or just switch, with reduced motion). */
  const show = (index: number) => {
    attachSources(index);
    const section = sectionRef.current;
    if (reducedMotion || !section) { setActive(index); return; }
    const range = section.offsetHeight - window.innerHeight;
    const target = count > 1 ? REELS_START + ((REELS_END - REELS_START) * (index + 0.5)) / (count - 1) : 0;
    const top = section.getBoundingClientRect().top + window.scrollY + Math.min(0.98, Math.max(GLIDE_END + 0.02, target)) * range;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="reel-story" id="film" ref={sectionRef} aria-label="Buzzly sub-company reels" style={{ ["--reel-count" as string]: count }}>
      <div className="reel-stage" ref={stageRef}>
        <div className="reel-copy hero-statement">
          <p>A technology-led company builder with content at its core.</p>
          <small>We build our own businesses and help ambitious partners grow through strategy, storytelling, and distribution.</small>
          <Link className="outlinecta" href="/work">Our Work</Link>
        </div>

        <div className="reel-slot" ref={slotRef}>
          <div className="reel-phone" ref={phoneRef}>
            <span className="reel-island" aria-hidden="true" />
            <div className="reel-screen">
              <ul className="reel-feed">
                {reels.map((reel, index) => (
                  <li className={`reel-item${index === active ? " is-active" : ""}`} key={reel.id} aria-hidden={index !== active}>
                    {reel.kind === "film" ? (
                      <>
                        <Image className="reel-poster" src={reel.poster} alt="" fill sizes="320px" priority={index === 0} />
                        <video
                          ref={element => { videoRefs.current[index] = element; }}
                          className="reel-video"
                          src={index <= loadedUpTo ? reel.video : undefined}
                          poster={reel.poster}
                          muted
                          loop
                          playsInline
                          preload="none"
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                      </>
                    ) : (
                      <div className="reel-brief">
                        <strong>Bring us<br /><em>the brief.</em></strong>
                        <ol>{reel.points.map((point, i) => <li key={point}><span>0{i + 1}</span>{point}</li>)}</ol>
                      </div>
                    )}
                    <div className="reel-top" aria-hidden="true"><span>BUZZLY / REELS</span><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span></div>
                    <div className="reel-side" aria-hidden="true"><Heart size={22} strokeWidth={1.6} /><MessageCircle size={22} strokeWidth={1.6} /><Send size={22} strokeWidth={1.6} /><Bookmark size={22} strokeWidth={1.6} /></div>
                    <div className="reel-caption">
                      <span className="reel-kicker">{reel.eyebrow}</span>
                      <h3>{reel.title}</h3>
                      <p>{reel.caption}</p>
                      <Link href={reel.href} tabIndex={index === active ? 0 : -1}>{reel.cta} ↗</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="reel-tabs" role="tablist" aria-label="Choose a reel">
            {reels.map((reel, index) => (
              <button type="button" role="tab" key={reel.id} aria-selected={index === active} onClick={() => show(index)}>
                <span className="reel-dot" aria-hidden="true" /><span>{reel.kind === "film" ? reel.title : "Partners"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="reel-hint" aria-hidden="true"><span>SCROLL</span><span>↓</span></div>
      </div>
    </section>
  );
}
