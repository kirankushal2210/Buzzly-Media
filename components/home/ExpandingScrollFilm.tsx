"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useMotionPreferences } from "@/hooks/use-in-view";

const FILM_SRC = "/media/de-food-kampney.mp4";
const FILM_POSTER = "/media/de-food-kampney-poster.webp";
const FALLBACK_LENGTH = 30;
/** The current reel has no audio track. Set to true when an approved reel with sound replaces it. */
const FILM_HAS_AUDIO = false;

const transcript = [
  "We discover the core idea, audience, and unfair advantage that gives a brand its direction.",
  "Our creative team scripts cinematic campaign films and high-impact short-form reels.",
  "We film on location with high-craft cinematography, lighting, and sound direction.",
  "Editors cut, colour-grade, score, and caption every asset for maximum viewer retention.",
  "We deploy organic distribution strategies and platform-specific publishing cadences.",
  "The content earns sustained attention, building organic reach, community, and brand equity over time.",
];

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * The homepage story film. It grows from container width to full-bleed as you
 * scroll, autoplays muted while on screen, and offers play/pause, replay, a
 * timeline scrubber, mute/unmute, and a transcript. With reduced motion it
 * stays static and never autoplays.
 */
export function ExpandingScrollFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_LENGTH);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const transcriptId = useId();
  const { reducedMotion, saveData } = useMotionPreferences();

  const ensureLoaded = useCallback(() => setLoaded(true), []);

  // Lazy-load shortly before the film is visible; autoplay only while on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const loadObserver = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { ensureLoaded(); loadObserver.disconnect(); }
    }, { rootMargin: "250px 0px", threshold: 0 });
    const playObserver = new IntersectionObserver(entries => {
      const visible = Boolean(entries[0]?.isIntersecting);
      inView.current = visible;
      // Only play once a source is attached; calling play() on an empty <video>
      // leaves it flagged as playing but idle in Chromium.
      if (visible && video.getAttribute("src") && !userPaused.current && !reducedMotion && !saveData && !video.ended && !document.hidden) {
        void video.play().catch(() => {});
      } else if (!visible) {
        video.pause();
      }
    }, { threshold: 0.15 });
    const onVisibility = () => { if (document.hidden) video.pause(); };
    loadObserver.observe(video);
    playObserver.observe(video);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ensureLoaded, reducedMotion, saveData]);

  // Scroll-linked expansion. The frame always fills the sticky area; only
  // clip-path and transforms change, so expanding never causes layout shift.
  useEffect(() => {
    const filmFrame = frameRef.current;
    if (reducedMotion || !filmFrame) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / (range * 0.65)));
      const mobile = window.matchMedia("(max-width:750px)").matches;
      // Visible fraction of the frame: desktop 70%→100% wide, 58%→100% tall.
      const w = mobile ? 0.92 + 0.08 * progress : 0.7 + 0.3 * progress;
      const h = mobile ? 0.56 + 0.44 * progress : 0.58 + 0.42 * progress;
      const insetY = (1 - h) / 2;
      const style = filmFrame.style;
      style.setProperty("--ix", `${((1 - w) / 2) * 100}%`);
      style.setProperty("--iy", `${insetY * 100}%`);
      style.setProperty("--iy-px", `${insetY * filmFrame.offsetHeight}px`);
      style.setProperty("--r", `${(mobile ? 9 : 16) * (1 - progress)}px`);
      style.setProperty("--vs", Math.max(w, h).toFixed(4));
      if (hintRef.current) hintRef.current.style.opacity = Math.max(0, 1 - progress * 2).toFixed(2);
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
  }, [reducedMotion]);

  // The source is attached after the first intersection, so the observer's
  // play() can run before there is anything to play (and preload="none" means
  // nothing loads by itself). Retry as soon as the source is attached.
  useEffect(() => {
    const video = videoRef.current;
    if (!loaded || !video || !inView.current || userPaused.current || reducedMotion || saveData || document.hidden || video.ended) return;
    video.load();
    void video.play().catch(() => {});
  }, [loaded, reducedMotion, saveData]);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    ensureLoaded();
    userPaused.current = false;
    // The source attribute may only just have been set; play once it is ready.
    requestAnimationFrame(() => void video.play().catch(() => {}));
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      play();
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    play();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) play();
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    ensureLoaded();
    video.currentTime = value;
    setTime(value);
  };

  const progress = Math.min(100, (time / duration) * 100);

  return (
    <>
      <section className="film-scroll" id="film" ref={sectionRef} aria-label="Buzzly campaign film">
        <div className="film-sticky">
          <div className="film-frame is-clip" id="filmFrame" ref={frameRef}>
            <video
              ref={videoRef}
              muted
              playsInline
              preload="none"
              poster={FILM_POSTER}
              src={loaded ? FILM_SRC : undefined}
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              onEnded={() => setPaused(true)}
              onVolumeChange={event => setMuted(event.currentTarget.muted)}
              onLoadedMetadata={event => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
              onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
              aria-describedby={transcriptId}
              aria-label="Buzzly Media production and distribution film in motion"
            >
              Your browser does not support this video.
            </video>
            <div className="film-controls">
              <span>BUZZLY / WORK IN MOTION</span>
              <div className="film-actions">
                <button type="button" onClick={toggle} aria-label={paused ? "Play video" : "Pause video"}>{paused ? "Play" : "Pause"}</button>
                <button type="button" className="film-secondary" onClick={replay} aria-label="Replay video">Replay ↺</button>
                {FILM_HAS_AUDIO && (
                  <button type="button" className="film-secondary" onClick={toggleMute} aria-pressed={!muted} aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? "Sound off" : "Sound on"}</button>
                )}
                <button type="button" className="film-secondary" onClick={() => setTranscriptOpen(open => !open)} aria-expanded={transcriptOpen} aria-controls={transcriptId}>Transcript</button>
              </div>
              <span className="film-time" aria-hidden="true">{formatTime(time)} / {formatTime(duration)}</span>
            </div>
            <input
              className="film-scrubber"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={time}
              onChange={event => seek(Number(event.currentTarget.value))}
              aria-label="Seek video"
              aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
              style={{ ["--progress" as string]: `${progress}%` }}
            />
          </div>
          <div className="film-scroll-hint" ref={hintRef} aria-hidden="true"><span>SCROLL TO EXPAND</span><span>↓</span></div>
        </div>
      </section>
      <section className="film-transcript wrap" id={transcriptId} hidden={!transcriptOpen} aria-label="Methodology transcript">
        <h2>The Buzzly Content Engine, step by step</h2>
        <ol>{transcript.map(line => <li key={line}>{line}</li>)}</ol>
        <p>This is Buzzly’s core methodology for building brand worlds and generating sustained organic reach.</p>
      </section>
      {!transcriptOpen && (
        <div className="film-transcript-cta wrap">
          <button type="button" onClick={() => setTranscriptOpen(true)} aria-controls={transcriptId} aria-expanded={false}>Read our process ↓</button>
        </div>
      )}
    </>
  );
}
