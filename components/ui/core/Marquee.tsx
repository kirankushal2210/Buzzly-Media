import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";

type MarqueeProps = {
  /** Items for one pass of the strip. */
  items: ReactNode[];
  /** Accessible name for the strip. */
  label: string;
  /** Seconds for one full loop. */
  duration?: number;
  /** Space between items, in px (also used at the seam, so the loop has no jump). */
  gap?: number;
  /**
   * How many times `items` repeat inside each half. Short lists need more
   * repeats so each half is wider than the screen and the strip never shows
   * an empty gap.
   */
  repeat?: number;
  /** Scroll left-to-right instead of right-to-left. */
  reverse?: boolean;
  className?: string;
};

/**
 * Auto-scrolling horizontal strip (no <marquee> tag).
 *
 * The track holds two identical halves and a CSS @keyframes loop moves it by
 * translateX(-50%): at the end of the loop the second half sits exactly where
 * the first one started, so the restart is invisible. Edges fade with a mask,
 * hovering or focusing pauses it (animation-play-state), and with
 * prefers-reduced-motion it stops and shows one static, wrapped set. Styles: app/ui.css.
 */
export function Marquee({ items, label, duration = 40, gap = 56, repeat = 2, reverse = false, className }: MarqueeProps) {
  const half = Array.from({ length: repeat }, (_, pass) => items.map((item, index) => ({ key: `${pass}-${index}`, item, first: pass === 0 })))
    .flat();
  const style = { "--marquee-duration": `${duration}s`, "--marquee-gap": `${gap}px` } as CSSProperties;

  return (
    <section className={cx("bz-marquee", reverse && "bz-marquee-reverse", className)} aria-label={label} style={style}>
      <div className="bz-marquee-track">
        <ul className="bz-marquee-group">
          {/* Only the first pass is announced; repeats are visual. */}
          {half.map(({ key, item, first }) => <li key={key} aria-hidden={first ? undefined : true}>{item}</li>)}
        </ul>
        <ul className="bz-marquee-group" aria-hidden="true">
          {half.map(({ key, item }) => <li key={key}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
