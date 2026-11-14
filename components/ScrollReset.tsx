"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnchorTarget, scrollToTopNow } from "@/lib/scroll";

/**
 * Starts every page at the top, unless the URL has a #hash pointing at a
 * section. (A browser refresh on an interior page is sent back to "/" by the
 * inline script in app/layout.tsx before this component runs — owner decision.)
 */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch { /* unsupported */ }

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
