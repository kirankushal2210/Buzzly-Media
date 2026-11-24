"use client";

import { useEffect, useState } from "react";
import { BuzzlyLogo } from "@/components/BuzzlyLogo";
import { SiteHeader } from "@/components/SiteHeader";
import { hasAnchorTarget, scrollToTopNow } from "@/lib/scroll";

const INTRO_KEY = "buzzlyIntroSeen";

/** Short brand intro. Shown once per browser session and skipped entirely for reduced motion. */
export function Splash() {
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_KEY) === "1"; } catch { /* storage unavailable */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skip = seen || reduced;
    // Start at the hero before the splash lifts (instant, not smooth), unless the URL targets an anchor.
    if (!hasAnchorTarget()) scrollToTopNow();
    window.scrollTo(0, 0);
    if (!skip) document.body.classList.add("is-loading");
    const timer = window.setTimeout(() => setDone(true), skip ? 0 : 1250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!done) return;
    document.body.classList.remove("is-loading");
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* storage unavailable */ }
    const timer = window.setTimeout(() => setRemoved(true), 850);
    return () => window.clearTimeout(timer);
  }, [done]);

  // Never leave the page locked if the component unmounts mid-intro (client navigation).
  useEffect(() => () => document.body.classList.remove("is-loading"), []);

  if (removed) return null;
  return (
    <div className={`splash${done ? " done" : ""}`} id="splash" role="status" aria-label="Buzzly Media introduction" aria-hidden={done}>
      <div className="splash-inner">
        <div className="splash-brand" style={{ marginBottom: "20px" }}>
          <BuzzlyLogo variant="vertical" theme="dark" size="lg" />
        </div>
        <h2>We build brands through content.<br /><em>Ours and everyone else’s.</em></h2>
      </div>
      <button className="splash-skip" type="button" onClick={() => setDone(true)} aria-label="Skip introduction">Skip intro ↗</button>
    </div>
  );
}

export function HomeHeader() {
  return <SiteHeader variant="home" />;
}

export function Hero() {
  return (
    <section className="intro wrap">
      <div className="eyebrow">BUZZLY / BUILDING BRANDS THROUGH CONTENT</div>
      <h1>
        <span>We build brands</span>
        <span>through content.</span>
        <em>Ours and everyone else’s.</em>
      </h1>
      <div className="herooffer">
        <p><span aria-hidden="true">〰</span> For ambitious brands ready to scale. <span aria-hidden="true">〰</span></p>
        <a className="cta" href="#start-project">Start a Project</a>
      </div>
    </section>
  );
}
