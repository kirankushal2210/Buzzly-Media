"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnchorTarget, scrollToTopNow } from "@/lib/scroll";

/**
 * Ensures that whenever the page is refreshed from anywhere or scrolled down,
 * the user is always returned to the Homepage (Hero Section at /) pinned at the top.
 */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch { /* unsupported */ }

    // Detect if this visit was triggered by a reload / refresh
    let isReload = false;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.type) {
        isReload = nav.type === "reload";
      } else if (window.performance && window.performance.navigation) {
        isReload = window.performance.navigation.type === 1;
      }
    } catch { /* navigation API unsupported */ }

    // If reloading while on any subpage, redirect straight to the Homepage
    if (isReload && pathname !== "/") {
      window.location.replace("/");
      return;
    }

    if (!hasAnchorTarget()) {
      scrollToTopNow();
      requestAnimationFrame(() => scrollToTopNow());
      const t1 = setTimeout(scrollToTopNow, 20);
      const t2 = setTimeout(scrollToTopNow, 120);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname]);

  useEffect(() => {
    const onReset = () => {
      try {
        if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      } catch { /* unsupported */ }
      window.scrollTo(0, 0);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !hasAnchorTarget()) {
        scrollToTopNow();
      }
    };

    window.addEventListener("pagehide", onReset);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("beforeunload", onReset);

    return () => {
      window.removeEventListener("pagehide", onReset);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("beforeunload", onReset);
    };
  }, []);

  return null;
}
