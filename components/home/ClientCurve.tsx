"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A curved carousel: cards travel right to left across the inside of a
 * cylinder, so they curve in tall at one edge, flatten out in the centre and
 * fade away round the other. Geometry is worked out from the stage width; the
 * loop pauses off-screen and stands still for reduced motion. Hovering a card
 * (or tapping it on touch screens) eases the loop to a stop and brings that
 * card forward, zoomed in; moving away lets it carry on.
 * Styles: app/growth.css (.curve-*).
 */
export function ClientCurve({ items }: { items: ReactNode[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const focus = useRef(-1); // index of the card being looked at, or -1

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let geo = { p: 600, r: 760, w: 380, step: 396, total: 396 * items.length };
    // Only the width matters. Setting the card size changes the stage's height,
    // so ignore height-only resizes (otherwise the observer loops on itself).
    let measuredWidth = -1;
    const measure = () => {
      if (el.clientWidth === measuredWidth) return;
      measuredWidth = el.clientWidth;
      const half = el.clientWidth / 2;
      const narrow = el.clientWidth < 600;
      // the edge of the screen sits 55° round the curve (45° on phones, so cards stay readable)
      const p = half / Math.tan(((narrow ? 45 : 55) * Math.PI) / 180);
      const r = p / 0.8;                                // centre card shown at 80% size
      const w = Math.min(290, el.clientWidth * (narrow ? 0.52 : 0.24)) / 0.8;  // centre card about 290px wide on desktop, half the screen on phones
      const step = w * 1.045;
      geo = { p, r, w, step, total: step * items.length };
      el.style.perspective = `${p}px`;
      el.style.setProperty("--curve-w", `${w}px`);
      el.style.setProperty("--curve-h", `${w * 0.64}px`);
    };
    measure();
    // apply size changes on the next frame, outside the observer's own pass
    const resize = new ResizeObserver(() => requestAnimationFrame(measure));
    resize.observe(el);

    let visible = true;
    const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    seen.observe(el);

    // on touch screens there is no hover: a tap outside the carousel lets it carry on
    const release = (e: PointerEvent) => { if (!el.contains(e.target as Node)) focus.current = -1; };
    document.addEventListener("pointerdown", release);

    let offset = 0, last = performance.now(), frame = 0, speed = 0;
    const SPEED = 70; // px per second along the curve
    const lift = new Array<number>(items.length).fill(0); // how far each card has come forward (0..1)
    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const ease = 1 - Math.exp(-dt / 140);              // smooth, frame-rate independent
      const target = visible && !still && focus.current < 0 ? SPEED : 0;
      speed += (target - speed) * ease;
      offset = (offset + (speed * dt) / 1000) % geo.total;
      const { p, r, step, total } = geo;
      cards.current.forEach((card, i) => {
        if (!card) return;
        let s = i * step - offset;                       // distance along the arc from the centre
        s = ((s % total) + total * 1.5) % total - total / 2;
        const angle = s / r;                             // radians
        const hidden = Math.abs(angle) > 1.25;
        card.style.visibility = hidden ? "hidden" : "visible";
        lift[i] += ((focus.current === i ? 1 : 0) - lift[i]) * (still ? 1 : ease);
        // a focused card comes forward a fifth of the way to the viewer: about 25% larger
        if (!hidden) card.style.transform = `translateZ(${p}px) rotateY(${-angle}rad) translateZ(${-r + lift[i] * r * 0.2}px)`;
        card.classList.toggle("is-focus", focus.current === i);
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); seen.disconnect(); document.removeEventListener("pointerdown", release); };
  }, [items.length]);

  return (
    <div className="curve" ref={stage} aria-hidden="true">
      <div className="curve-ring">
        {items.map((item, i) => (
          <div key={i} className="curve-slot" ref={node => { cards.current[i] = node; }}
            onPointerEnter={e => { if (e.pointerType === "mouse") focus.current = i; }}
            onPointerLeave={e => { if (e.pointerType === "mouse" && focus.current === i) focus.current = -1; }}
            onPointerDown={e => { if (e.pointerType !== "mouse") focus.current = focus.current === i ? -1 : i; }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
