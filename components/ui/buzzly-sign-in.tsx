"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "@/components/Link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Buzzly's cinematic sign-in: a spotlight on a floating key carrying the
 * Buzzly mark, light rings, drifting dust and film grain, with the form in
 * the key's shadow. Adapted from a "stunning sign-in" layout, rebuilt with
 * Buzzly's emblem, type and colours. Styles live in app/admin/admin.css (.bsi).
 * The light follows the pointer; everything is still with reduced motion.
 */
export function BuzzlySignIn({ title = "Buzzly CRM.", subtitle, children, footer, className }: {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);

  // Light and key follow the pointer (spring-like smoothing, no jumps).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      root.style.setProperty("--lx", x.toFixed(3));
      root.style.setProperty("--ly", y.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    root.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(tick);
    return () => { root.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); };
  }, []);

  // Dust drifting in the beam.
  useEffect(() => {
    const canvas = dustRef.current;
    const root = rootRef.current;
    if (!canvas || !root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { canvas.width = root.clientWidth * dpr; canvas.height = root.clientHeight * dpr; };
    resize();
    const motes = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random() * 0.55, r: Math.random() * 1.4 + 0.3, vy: Math.random() * 0.00025 + 0.00008, vx: (Math.random() - 0.5) * 0.0002, a: Math.random() * 0.5 + 0.15 }));
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const ink = getComputedStyle(root).getPropertyValue("--bsi-dust").trim() || "255,255,255";
      for (const m of motes) {
        m.y += m.vy; m.x += m.vx;
        if (m.y > 0.6) { m.y = 0; m.x = 0.38 + Math.random() * 0.24; }
        const spread = Math.abs(m.x - 0.5) * 2;
        ctx.fillStyle = `rgba(${ink},${(m.a * (1 - spread)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div ref={rootRef} className={cn("bsi", className)}>
      <div className="bsi-floor" />
      <div className="bsi-beam"><i /></div>
      <div className="bsi-rings" aria-hidden="true"><i /><i /><i /></div>
      <canvas ref={dustRef} className="bsi-dust" aria-hidden="true" />
      <div className="bsi-shadow"><i /></div>

      <div className="bsi-top">
        <Link href="/" className="bsi-wordmark">Buzzly.<small>CRM</small></Link>
        <ThemeToggle />
      </div>

      <div className="bsi-drop" aria-hidden="true">
        <div className="bsi-key">
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id="bsi-face" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffaf0" />
                <stop offset="1" stopColor="#c9c1b2" />
              </linearGradient>
              <path id="bsi-hex" pathLength={1000} d="M50,8 C53,8 83,25.5 84.5,28 C86,30.5 86,69.5 84.5,72 C83,74.5 53,92 50,92 C47,92 17,74.5 15.5,72 C14,69.5 14,30.5 15.5,28 C17,25.5 47,8 50,8 Z" />
            </defs>
            <use href="#bsi-hex" className="bsi-hex" />
            <use href="#bsi-hex" className="bsi-trace" />
            <path d="M38,24 L44,24 L44,45 C47,42 51,40.5 56,40.5 C66,40.5 72,48 72,58 C72,68 65,75.5 55,75.5 C50,75.5 46,73.5 44,70 L44,75 L38,75 Z" fill="url(#bsi-face)" />
            <polygon points="51,50 51,66 64,58" className="bsi-play" />
          </svg>
          <span className="bsi-live" />
          <span className="bsi-sheen" />
        </div>
      </div>

      <main className="bsi-stage">
        <h1 aria-label={title}>
          {[...title].map((ch, i) => (
            <span key={i} className="bsi-c" aria-hidden="true" style={{ animationDelay: `${0.5 + i * 0.035}s` }}>{ch === " " ? " " : ch}</span>
          ))}
        </h1>
        {subtitle && <p className="bsi-sub bsi-rise" style={{ animationDelay: "1s" }}>{subtitle}</p>}
        <div className="bsi-rise" style={{ animationDelay: "1.1s" }}>{children}</div>
        {footer && <p className="bsi-terms bsi-rise" style={{ animationDelay: "1.25s" }}>{footer}</p>}
      </main>

      <div className="bsi-vig" />
      <svg className="bsi-grain" aria-hidden="true">
        <filter id="bsi-noise"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#bsi-noise)" />
      </svg>
    </div>
  );
}
