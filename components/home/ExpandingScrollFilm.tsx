"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useMotionPreferences } from "@/hooks/use-in-view";

const FILM_SRC = "/media/buzzly-cafe-story.mp4";
const FILM_POSTER = "/media/buzzly-cafe-story-poster.jpg";
const FALLBACK_LENGTH = 48;
/** The current cafe film has no audio track. Set to true when an approved reel with sound replaces it. */
const FILM_HAS_AUDIO = false;

const transcript = [
  "A cafe owner approaches Buzzly to help more people discover the cafe.",
  "Our social media writer turns the brief into a reel script and sets up the cafe’s Instagram page.",
  "We write the content calendar, captions, and stories for the cafe.",
  "A Buzzly videographer films the cafe, its food, its space, and its people.",
  "The videographer hands an SD card to an editor. The editor cuts, colours, captions, and scores a short reel.",
  "We optimize captions and page details for discoverability and plan optional Meta ads.",
  "The reel goes live on Instagram. An illustrative counter moves from zero to 10K, then toward 100K views.",
  "In this fictional scenario, 10–20 new customers visit the cafe.",
  "The cafe’s goal is a stronger reputation, more customers, and increased revenue.",
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
      const visible = entries[0]?.isIntersecting;
      if (visible && !userPaused.current && !reducedMotion && !saveData && !video.ended && !document.hidden) {
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

  // Scroll-linked expansion, throttled to one update per animation frame.
  useEffect(() => {
    const filmFrame = frameRef.current;
    if (reducedMotion) {
      if (filmFrame) { filmFrame.style.width = ""; filmFrame.style.height = ""; filmFrame.style.borderRadius = ""; }
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section || !filmFrame) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / (range * 0.65)));
      const mobile = window.matchMedia("(max-width:750px)").matches;
      filmFrame.style.width = `${mobile ? 92 + 8 * progress : 70 + 30 * progress}vw`;
      filmFrame.style.height = `${mobile ? 56 + 44 * progress : 58 + 42 * progress}vh`;
      filmFrame.style.borderRadius = `${16 * (1 - progress)}px`;
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
      <section className="film-scroll" id="film" ref={sectionRef} aria-label="Buzzly cafe campaign story film">
        <div className="film-sticky">
          <div className="film-frame" id="filmFrame" ref={frameRef}>
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
              aria-label="A 48-second illustrative cafe campaign showing Buzzly from client brief and content creation through filming, editing, Instagram, possible views, customers, and business growth"
            >
              Your browser does not support this video.
            </video>
            <div className="film-controls">
              <span>BUZZLY / THE CAFE STORY</span>
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
      <section className="film-transcript wrap" id={transcriptId} hidden={!transcriptOpen} aria-label="Cafe story transcript">
        <h2>The cafe story, step by step</h2>
        <ol>{transcript.map(line => <li key={line}>{line}</li>)}</ol>
        <p>This is a fictional cafe campaign showing the process and a possible outcome. The view counts, customer counts, and revenue direction are illustrative—not actual Buzzly results or a guarantee.</p>
      </section>
      {!transcriptOpen && (
        <div className="film-transcript-cta wrap">
          <button type="button" onClick={() => setTranscriptOpen(true)} aria-controls={transcriptId} aria-expanded={false}>Read the full cafe story ↓</button>
        </div>
      )}
    </>
  );
}
