"use client";

import { useEffect } from "react";

// Module-level: false for the first page a visitor loads, true after any client navigation.
let hasMounted = false;

/**
 * Re-mounts on every navigation. The first page renders fully visible (so
 * crawlers, previews and slow devices never see a blank frame); later client
 * navigations fade in. Reduced motion disables the fade in react-sections.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const animate = hasMounted;
  useEffect(() => { hasMounted = true; }, []);
  return <div className={animate ? "page-transition" : undefined}>{children}</div>;
}
