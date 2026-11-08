"use client";

import { useEffect } from "react";
import { hasAnchorTarget, scrollToTopNow } from "@/lib/scroll";

/**
 * Every full page load (refresh, typed URL, back from another site) starts at
 * the top instead of wherever the browser last left the page.
 *
 * Client-side navigation is left to the router, which already scrolls new
 * pages to the top. Links to an in-page anchor (/#contact) still land on it.
 */
export function ScrollReset() {
  useEffect(() => {
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch { /* unsupported */ }
    if (!hasAnchorTarget()) scrollToTopNow();

    // Pin the snapshot browsers keep for reload / back-forward at the top.
    // `pagehide` is used instead of `beforeunload`, which would disable the back-forward cache.
    const onPageHide = () => scrollToTopNow();
    // A page restored from the back-forward cache skips React mounting, so reset it here too.
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted && !hasAnchorTarget()) scrollToTopNow(); };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
