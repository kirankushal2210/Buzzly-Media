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
