"use client";

import { useEffect, useRef } from "react";

type InViewVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  controls?: boolean;
};

/** Loads each film shortly before it appears and never plays decorative video offscreen. */
export function InViewVideo({ src, poster, className, label, controls = false }: InViewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let inView = false;
    let sourceLoaded = false;

    const maybePlay = () => {
      if (!controls && inView && !document.hidden && !motionPreference.matches && !connection?.saveData) {
        void video.play().catch(() => {});
      } else if (!controls) {
        video.pause();
      }
    };

    const load = () => {
      if (sourceLoaded) return;
      if (!controls && (motionPreference.matches || connection?.saveData)) return;
      video.src = src;
      video.load();
      sourceLoaded = true;
    };

    if (!("IntersectionObserver" in window)) {
      load();
      inView = true;
      maybePlay();
      return;
    }

    const loadObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0]?.isIntersecting) {
        load();
        if (sourceLoaded) observer.disconnect();
      }
    }, { rootMargin: "250px 0px", threshold: 0 });
    const playObserver = new IntersectionObserver((entries) => {
      inView = (entries[0]?.intersectionRatio ?? 0) >= 0.25;
      maybePlay();
    }, { threshold: [0, 0.25] });
    loadObserver.observe(video);
    playObserver.observe(video);
    document.addEventListener("visibilitychange", maybePlay);
    const onMotionChange = () => { if (inView) load(); maybePlay(); };
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
      document.removeEventListener("visibilitychange", maybePlay);
      motionPreference.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, [src, controls]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      preload="none"
      muted
      playsInline
      loop={!controls}
      controls={controls}
      aria-label={label}
      aria-hidden={controls ? undefined : true}
    />
  );
}
