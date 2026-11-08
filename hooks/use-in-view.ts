"use client";

import { useEffect, useRef, useState } from "react";

/** Flips to true once the element scrolls into view, then stops observing. */
export function useInViewOnce<T extends Element>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

/** Reads the user's reduced-motion and data-saver preferences. */
export function useMotionPreferences() {
  const [prefs, setPrefs] = useState({ reducedMotion: false, saveData: false });
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const update = () => setPrefs({ reducedMotion: query.matches, saveData });
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return prefs;
}
