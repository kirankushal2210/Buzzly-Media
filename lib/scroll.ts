/**
 * Jump to the top of the page with no animation. The site sets
 * `scroll-behavior: smooth` on <html>, which would otherwise turn a reset into
 * a visible glide; switching it off for one call keeps the jump instant in
 * every browser (older Safari rejects `behavior: "instant"`).
 */
export function scrollToTopNow() {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
}

/** True when the URL points at an in-page anchor (e.g. a shared /#contact link) that should win over the reset. */
export function hasAnchorTarget() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return Boolean(id && document.getElementById(id));
}

/**
 * True when this document was loaded by a browser reload (Cmd/Ctrl+R, F5, the
 * reload button). Note: the answer never changes for the life of the page, so
 * callers must only act on it once, not after client-side navigations.
 */
export function isReloadNavigation() {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (entry?.type) return entry.type === "reload";
    return (performance as Performance & { navigation?: { type: number } }).navigation?.type === 1;
  } catch {
    return false;
  }
}
