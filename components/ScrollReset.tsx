"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnchorTarget, isReloadNavigation, scrollToTopNow } from "@/lib/scroll";

// The reload check must run once per page load: the navigation entry keeps saying
// "reload" for the whole life of the document, so re-checking after a client-side
// navigation would bounce every visitor who refreshed once back to the homepage.
let reloadChecked = false;

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

    // Backstop for the <head> script in app/layout.tsx: a refresh on any subpage goes to the homepage.
    if (!reloadChecked) {
      reloadChecked = true;
      if (isReloadNavigation() && pathname !== "/") {
        window.location.replace("/");
        return;
      }
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
