"use client";

import { useRouter } from "next/navigation";
import { useRef, type AnchorHTMLAttributes, type MouseEvent, type Ref } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  ref?: Ref<HTMLAnchorElement>;
};

function isClientRoutable(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Drop-in replacement for `next/link`.
 *
 * vinext 1.0.0-beta.5's production `next/link` lazily imports its navigation
 * module, and the client bundle points that import at a chunk without
 * `navigateClientSide`, so every click throws "e is not a function". This
 * component renders a real <a> (crawlable, works without JS, honours
 * cmd/ctrl/middle-click and target) and navigates through the App Router's
 * `useRouter()`, which is already loaded on every page. Swap the imports back to
 * `next/link` once vinext fixes the bundling issue.
 */
export default function Link({ href, replace = false, scroll = true, prefetch = true, onClick, onMouseEnter, onFocus, onTouchStart, target, ref, ...rest }: LinkProps) {
  const router = useRouter();
  const prefetched = useRef(false);
  const routable = isClientRoutable(href);

  const warm = () => {
    if (!prefetch || !routable || prefetched.current) return;
    prefetched.current = true;
    try { router.prefetch(href); } catch { /* prefetch is best-effort */ }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented || !routable || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (target && target !== "_self")
    ) return;
    event.preventDefault();
    if (replace) router.replace(href, { scroll }); else router.push(href, { scroll });
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      onClick={handleClick}
      onMouseEnter={event => { warm(); onMouseEnter?.(event); }}
      onFocus={event => { warm(); onFocus?.(event); }}
      onTouchStart={event => { warm(); onTouchStart?.(event); }}
      {...rest}
    />
  );
}
