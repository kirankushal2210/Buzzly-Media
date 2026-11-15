"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreferences } from "@/hooks/use-in-view";

/** What the film says, as real text for screen readers and search. Keep in step with media-source/brand-story/film.html. */
const transcript = [
  "Every brand starts as an idea. On its own, nobody sees it.",
  "01, Find the idea: out of all the things a brand could say, one thing to remember.",
  "02, Make it visible: one idea, many forms — film, reel, post, story.",
  "03, Help it travel: content travels to the people it is for, and they pass it on.",
  "04, Earn attention, then trust: attention becomes trust. Trust becomes a brand.",
  "We build brands through content.",
];

/**
 * The "how brands are built through content" film. Plays muted and looped
 * while it is on screen; with reduced motion or data saver it waits for the
 * play button. The button also pauses it at any time.
 */
export function StoryFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { reducedMotion, saveData } = useMotionPreferences();
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const auto = !reducedMotion && !saveData && !userPaused;

  useEffect(() => {
    const wrap = wrapRef.current, video = videoRef.current;
    if (!wrap || !video || !auto) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.35 });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [auto]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { setUserPaused(false); void video.play().catch(() => {}); }
    else { setUserPaused(true); video.pause(); }
  };

  return (
    <div className={`story-film${playing ? " is-playing" : ""}`} ref={wrapRef}>
      <video
        ref={videoRef}
        src="/media/buzzly-brand-story.mp4"
        poster="/media/buzzly-brand-story-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-describedby="story-film-transcript"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className="story-film-toggle" onClick={toggle} aria-label={playing ? "Pause the film" : "Play the film"}>
        <span className="story-film-icon" aria-hidden="true" />{playing ? "Pause" : "Play"}
      </button>
      <span className="story-film-note">Film — How brands are built through content · 0:35</span>
      <div className="sr-only" id="story-film-transcript">
        <p>Film transcript:</p>
        {transcript.map(line => <p key={line}>{line}</p>)}
      </div>
    </div>
  );
}
