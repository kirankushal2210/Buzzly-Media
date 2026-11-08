"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type HoverPreviewHandle = { start: () => void; stop: () => void };

/**
 * A poster image that turns into a muted looping preview while its card is
 * hovered or focused. The video is only fetched on first interaction, and it
 * never plays with reduced motion or data saver on.
 */
export const HoverPreviewVideo = forwardRef<HoverPreviewHandle, { src: string; poster: string; alt: string }>(
  function HoverPreviewVideo({ src, poster, alt }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [armed, setArmed] = useState(false);
    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      start() {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
        if (reduce || saveData) return;
        setArmed(true);
        requestAnimationFrame(() => void videoRef.current?.play().catch(() => {}));
      },
      stop() {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
      },
    }), []);

    return (
      <span className={`hover-preview${playing ? " is-playing" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static poster frame */}
        <img src={poster} alt={alt} loading="lazy" decoding="async" />
        {armed && (
          <video
            ref={videoRef}
            src={src}
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
    );
  },
);
