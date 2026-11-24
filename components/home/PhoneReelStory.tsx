"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, Clapperboard, Ellipsis, Heart, House, MessageCircle, Music2, Repeat2, Search, Send } from "lucide-react";
import Link from "@/components/Link";
import { useMotionPreferences } from "@/hooks/use-in-view";
import { REEL_DURATION, REEL_TRANSCRIPT, drawStrategyReel, loadReelPhotos, reelToneAt } from "@/components/home/strategy-reel";

/**
 * The homepage story: the positioning statement sits beside a phone. As you
 * scroll, the statement fades, the phone glides to the centre, and then the
 * scroll plays the strategy reel inside it (an Instagram Reels screen) while
 * the phone keeps growing towards full height. When the reel ends, the stage
 * releases and the page carries on to "Work in motion".
 *
 * How it stays smooth:
 *  - Progress is read from the section and stage only. The phone sits in
 *    `.reel-slot`, which is NEVER transformed; the glide is applied to
 *    `.reel-rig` and the growth to `.reel-phone` inside it. Measuring an
 *    element while moving it makes every frame feed back into the next.
 *  - Growth targets (scale and vertical offset) are measured once per resize
 *    with the transforms cleared, never per frame.
 *  - The displayed progress eases toward the scroll position, so mouse-wheel
 *    notches turn into continuous motion instead of jumps.
 *  - The reel is drawn on a canvas as a pure function of time, so scrubbing
 *    backwards and forwards is exact, and the canvas is sized for the phone's
 *    largest scale so it stays sharp as it grows.
 *  - With reduced motion nothing is pinned or moved: a static phone with a
 *    button that plays the reel at normal speed.
 *
 * Scene map, as a fraction of the pinned scroll distance:
 *   0.00–0.04  scroll hint fades
 *   0.03–0.11  statement fades out
 *   0.05–0.15  phone glides from its slot to the centre (on phones it rises)
 *   0.15–0.95  the phone grows
 *   0.13–0.96  the reel plays from start to end, then holds on its end card
 *   1.00       the stage releases
 */

const HINT_END = 0.04;
const FADE = [0.03, 0.11] as const;
const GLIDE = [0.05, 0.15] as const;
const GROW = [0.15, 0.95] as const;
const REEL = [0.13, 0.96] as const;
/** How quickly the displayed progress follows the scroll position (time constant, ms). */
const FOLLOW_MS = 95;
/** Final phone height as a share of the stage: a little over 1 lets the phone fill the screen edge to edge. */
const GROW_TO_HEIGHT = 1.05;
const GROW_TO_WIDTH = 0.94;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
const range = (value: number, [a, b]: readonly [number, number]) => clamp01((value - a) / (b - a));

export function PhoneReelStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPreferences();
  const [replaying, setReplaying] = useState(false);
  /** Draws the reel at time t; set up by the effect, used by the replay button too. */
  const paintRef = useRef<(t: number, force?: boolean) => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current, copy = copyRef.current, slot = slotRef.current, rig = rigRef.current;
    const phone = phoneRef.current, screen = screenRef.current, canvas = canvasRef.current, hint = hintRef.current;
    if (!section || !stage || !copy || !slot || !rig || !phone || !screen || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let maxScale = 1; // phone scale at the end of the growth
    let lift = 0; // px the phone moves so its centre meets the stage centre while it grows
    let rise = 0; // how far below centre the phone starts (phones only), in px
    let lastT = -1;
    let tone = "";

    const paint = (t: number, force = false) => {
      if (!force && Math.abs(t - lastT) < 0.004) return;
      lastT = t;
      // The Reels chrome turns white over the dark, full-bleed photos.
      const nextTone = reelToneAt(t);
      if (nextTone !== tone) { tone = nextTone; screen.dataset.tone = tone; }
      const scale = canvas.width / 360;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawStrategyReel(ctx, t, 360, (360 * canvas.height) / canvas.width);
    };
    paintRef.current = paint;

    /** Size the canvas backing store for the phone's largest scale (capped), keeping the screen's aspect. */
    const sizeCanvas = () => {
      const w = screen.clientWidth, h = screen.clientHeight;
      if (!w || !h) return;
      const k = Math.min(Math.min(window.devicePixelRatio || 1, 2) * (reducedMotion ? 1 : maxScale), 3.4);
      canvas.width = Math.round(w * k);
      canvas.height = Math.round(h * k);
      paint(lastT < 0 ? 0 : lastT, true);
    };

    /** Growth targets, measured with our own transforms cleared so the numbers never depend on our output. */
    const measure = () => {
      rise = (parseFloat(getComputedStyle(stage).getPropertyValue("--reel-rise")) || 0) * stage.offsetHeight;
      if (reducedMotion) { maxScale = 1; lift = 0; return; }
      const rigTransform = rig.style.transform, phoneTransform = phone.style.transform;
      rig.style.transform = "none"; phone.style.transform = "none";
      const stageBox = stage.getBoundingClientRect(), phoneBox = phone.getBoundingClientRect();
      rig.style.transform = rigTransform; phone.style.transform = phoneTransform;
      maxScale = Math.max(1, Math.min((stageBox.height * GROW_TO_HEIGHT) / phoneBox.height, (stageBox.width * GROW_TO_WIDTH) / phoneBox.width));
      lift = stageBox.top + stageBox.height / 2 - (phoneBox.top + phoneBox.height / 2);
    };

    if (reducedMotion) {
      // Hand control back to the stylesheet (static layout); show the reel's end card until someone presses play.
      for (const element of [copy, rig, phone, hint]) element?.removeAttribute("style");
      measure(); sizeCanvas(); paint(REEL_DURATION, true);
      const onResize = () => { sizeCanvas(); };
      window.addEventListener("resize", onResize);
      document.fonts?.ready.then(() => paint(lastT, true));
      loadReelPhotos().then(() => paint(lastT, true));
      return () => window.removeEventListener("resize", onResize);
    }

    let frame = 0;
    let lastTime = 0;
    let shown = -1; // eased progress; -1 until the first frame

    /** Scroll progress through the pinned distance. Reads the section and stage only. */
    const target = () => clamp01(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - stage.offsetHeight));

    const apply = (progress: number) => {
      const fade = 1 - ease(range(progress, FADE));
      const glide = ease(range(progress, GLIDE));
      const grow = ease(range(progress, GROW));
      // `slot` is never transformed (only `rig` inside it is), so this distance does not depend on our own output.
      const stageBox = stage.getBoundingClientRect();
      const slotBox = slot.getBoundingClientRect();
      const toCentre = stageBox.left + stageBox.width / 2 - (slotBox.left + slotBox.width / 2);
      rig.style.transform = `translate3d(${(toCentre * glide).toFixed(2)}px,${(rise * (1 - glide)).toFixed(2)}px,0)`;
      phone.style.transform = `translate3d(0,${(lift * grow).toFixed(2)}px,0) scale(${(1 + (maxScale - 1) * grow).toFixed(4)})`;
      copy.style.opacity = fade.toFixed(3);
      copy.style.transform = `translate3d(0,${((fade - 1) * 24).toFixed(2)}px,0)`;
      copy.style.visibility = fade < 0.02 ? "hidden" : "visible";
      if (hint) hint.style.opacity = (1 - ease(progress / HINT_END)).toFixed(2);
      paint(range(progress, REEL) * REEL_DURATION);
    };

    const tick = (now: number) => {
      frame = 0;
      const goal = target();
      if (shown < 0) {
        shown = goal;
      } else {
        const elapsed = lastTime ? Math.min(80, Math.max(0, now - lastTime)) : 16.7;
        shown += (goal - shown) * (1 - Math.exp(-elapsed / FOLLOW_MS));
        if (Math.abs(goal - shown) < 0.0002) shown = goal;
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
    const onResize = () => { measure(); sizeCanvas(); lastT = -1; wake(); };

    measure();
    sizeCanvas();
    wake();
    document.fonts?.ready.then(() => paint(lastT < 0 ? 0 : lastT, true));
    loadReelPhotos().then(() => paint(lastT < 0 ? 0 : lastT, true));
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  /** Reduced motion only: play the reel once at normal speed, then rest on the end card. */
  const replay = () => {
    if (replaying) return;
    setReplaying(true);
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / 1000;
      paintRef.current(Math.min(t, REEL_DURATION), true);
      if (t < REEL_DURATION) requestAnimationFrame(step); else setReplaying(false);
    };
    requestAnimationFrame(step);
  };

  return (
    <section className="reel-story" id="film" ref={sectionRef} aria-label="How Buzzly builds brands through content">
      <div className="reel-stage" ref={stageRef}>
        <div className="reel-copy hero-statement" ref={copyRef}>
          <p>A technology-led company builder with content at its core.</p>
          <small>We build our own businesses and help ambitious partners grow through strategy, storytelling, and distribution.</small>
          <Link className="outlinecta" href="/work">Our Work</Link>
        </div>

        <div className="reel-slot" ref={slotRef}>
          <div className="reel-rig" ref={rigRef}>
            <div className="reel-phone" ref={phoneRef}>
              <span className="reel-island" aria-hidden="true" />
              <div className="reel-screen" ref={screenRef}>
                <canvas className="reel-canvas" ref={canvasRef} aria-hidden="true" />
                <div className="ig-status" aria-hidden="true">
                  <span>9:41</span>
                  <span className="ig-status-icons"><i className="ig-signal" /><i className="ig-battery" /></span>
                </div>
                <div className="rl-head" aria-hidden="true"><b>Reels</b><ChevronDown /><Camera className="rl-cam" /></div>
                <div className="rl-side" aria-hidden="true"><Heart /><MessageCircle /><Repeat2 /><Send /><Ellipsis /></div>
                <div className="rl-foot">
                  <div className="rl-acct">
                    <span className="rl-avatar" aria-hidden="true"><Image src="/logo/buzzly-mark.svg" alt="" width={24} height={24} /></span>
                    <b>buzzly</b>
                    <a className="rl-follow" href="#start-project">Start a Project</a>
                  </div>
                  <p className="rl-cap">How we build brands through content, from the first idea to the first client.</p>
                  <span className="rl-audio" aria-hidden="true"><Music2 /> Original audio · Buzzly</span>
                </div>
                <div className="ig-nav" aria-hidden="true">
                  <House /><Clapperboard /><Send /><Search />
                  <span className="ig-me"><Image src="/logo/buzzly-mark.svg" alt="" width={24} height={24} /></span>
                </div>
                {reducedMotion && (
                  <button type="button" className="rl-play" onClick={replay} disabled={replaying}>
                    {replaying ? "Playing…" : "Play the reel"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sr-only">
          <p>The reel in the phone, as text:</p>
          {REEL_TRANSCRIPT.map(line => <p key={line}>{line}</p>)}
        </div>
        <div className="reel-hint" ref={hintRef} aria-hidden="true"><span>SCROLL</span><span>↓</span></div>
      </div>
    </section>
  );
}
