"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { useInViewOnce, useMotionPreferences } from "@/hooks/use-in-view";
import { caseStudies, type CaseStudy } from "@/lib/work";

/** Frame shapes cycle through the list so the grid reads like an edit, not a catalogue. */
const formats = ["16:9", "4:5", "2.39:1"] as const;

/** Seconds → film timecode at 25 fps (HH:MM:SS:FF). */
function timecode(seconds: number) {
  const frames = Math.floor(seconds * 25);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(frames / 90000))}:${pad(Math.floor(frames / 1500) % 60)}:${pad(Math.floor(frames / 25) % 60)}:${pad(frames % 25)}`;
}

/**
 * One project as a frame in a camera viewfinder. The film plays muted while
 * the frame is on screen (poster only with reduced motion or data saver), the
 * timecode follows the film, and on devices with a pointer a "Case study" tag
 * follows the cursor across the frame.
 */
function ShowcaseFilm({ study, index }: { study: CaseStudy; index: number }) {
  const [ref, arrived] = useInViewOnce<HTMLElement>(0.15);
  const { reducedMotion, saveData } = useMotionPreferences();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const still = reducedMotion || saveData;

  // Play while at least 40% of the frame is visible; pause otherwise.
  useEffect(() => {
    const node = ref.current;
    if (!node || still) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setArmed(true);
        requestAnimationFrame(() => void videoRef.current?.play().catch(() => {}));
      } else {
        videoRef.current?.pause();
      }
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, still]);

  // Timecode: one text write per frame, only while the film is playing.
  useEffect(() => {
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      const video = videoRef.current, label = timecodeRef.current;
      if (video && label) label.textContent = timecode(video.currentTime);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const follow = (event: PointerEvent<HTMLElement>) => {
    const cursor = cursorRef.current;
    if (!cursor || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    cursor.style.transform = `translate3d(${(event.clientX - box.left).toFixed(1)}px,${(event.clientY - box.top).toFixed(1)}px,0)`;
  };

  const format = formats[index % formats.length];
  const number = String(index + 1).padStart(2, "0");

  return (
    <article ref={ref} className={`film${arrived ? " arrived" : ""}${playing ? " is-playing" : ""}`} data-format={format} style={{ ["--accent" as string]: study.accent }}>
      <Link href={`/work/${study.slug}`} aria-label={`${study.client}: ${study.title} Read the case study`}>
        <span className="film-frame" onPointerMove={follow}>
          <span className="film-picture">
            <Image src={study.poster} alt="" fill sizes="(max-width: 750px) 100vw, 66vw" />
            {armed && (
              <video
                ref={videoRef}
                src={study.video}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                onPlaying={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            )}
          </span>
          <span className="film-hud" aria-hidden="true">
            <span className="film-rec"><i />{playing ? "REC" : "STBY"}</span>
            <span className="film-tc" ref={timecodeRef}>00:00:00:00</span>
            <span className="film-scene">Scene {number}</span>
            <span className="film-format">{format}</span>
          </span>
          <span className="film-corners" aria-hidden="true"><i /><i /><i /><i /></span>
          {study.illustrative && <span className="film-flag">Illustrative</span>}
          <span className="film-cursor" ref={cursorRef} aria-hidden="true"><span>Case study ↗</span></span>
        </span>
        <span className="film-body">
          <span className="film-no" aria-hidden="true">{number}</span>
          <span className="film-text">
            <strong>{study.client}</strong>
            <span className="film-title">{study.title}</span>
            <span className="film-meta">{study.categoryLabel} — {study.services.slice(0, 2).join(" / ")} — {study.year}</span>
          </span>
        </span>
      </Link>
    </article>
  );
}

/** Recent campaigns and company work: a scroll-driven title strip over viewfinder frames that play as they come into view. */
export function WorkShowcaseSection() {
  return (
    <section id="work" className="showcase" aria-labelledby="showcase-title">
      <h2 className="sr-only" id="showcase-title">Work in motion.</h2>
      <div className="motion-strip" aria-hidden="true">
        <div className="motion-track">
          {[0, 1, 2, 3].map(i => <span key={i}>Work in <em>motion</em><i className="motion-dot" /></span>)}
        </div>
      </div>
      <div className="wrap">
        <Reveal as="div" className="workhead showcase-head">
          <p className="eyebrow">BUZZLY / RECENT WORK</p>
          <div className="work-intro">
            <span className="work-count">{String(caseStudies.length).padStart(2, "0")}<span>↗</span></span>
            <p>Films, brands, and campaigns from the sub-companies we own and build, and the outside partners we build with.</p>
          </div>
        </Reveal>
        <div className="film-grid">
          {caseStudies.map((study, index) => <ShowcaseFilm key={study.slug} study={study} index={index} />)}
        </div>
        <div className="showcase-footer">
          <span>Food / Health / Real estate</span>
          <Link className="outlinecta" href="/work">See all work ↗</Link>
        </div>
      </div>
    </section>
  );
}
