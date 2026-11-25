"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "@/components/Link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Buzzly's sign-in: the key carrying the Buzzly mark, lit from the upper left
 * with a contact shadow under it, then the form. The key tilts toward the
 * pointer and a band of light crosses it; nothing else moves, and it is still
 * with reduced motion. Styles live in app/admin/sign-in.css (.bsi).
 */
export function BuzzlySignIn({ title = "Buzzly CRM.", subtitle, children, footer, className }: {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // The key follows the pointer (smoothed, no jumps).
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

  return (
    <div ref={rootRef} className={cn("bsi", className)}>
      <div className="bsi-top">
        <Link href="/" className="bsi-wordmark">Buzzly.<small>CRM</small></Link>
        <ThemeToggle />
      </div>

      <main className="bsi-stage">
        <div className="bsi-drop" aria-hidden="true">
          <div className="bsi-key">
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="bsi-face" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor="#bdbdbd" />
                </linearGradient>
              </defs>
              <path className="bsi-hex" d="M50,8 C53,8 83,25.5 84.5,28 C86,30.5 86,69.5 84.5,72 C83,74.5 53,92 50,92 C47,92 17,74.5 15.5,72 C14,69.5 14,30.5 15.5,28 C17,25.5 47,8 50,8 Z" />
              <path d="M38,24 L44,24 L44,45 C47,42 51,40.5 56,40.5 C66,40.5 72,48 72,58 C72,68 65,75.5 55,75.5 C50,75.5 46,73.5 44,70 L44,75 L38,75 Z" fill="url(#bsi-face)" />
              <polygon points="51,50 51,66 64,58" className="bsi-play" />
            </svg>
            <span className="bsi-sheen" />
          </div>
          <span className="bsi-contact" />
        </div>

        <h1>{title}</h1>
        {subtitle && <p className="bsi-sub">{subtitle}</p>}
        <div className="bsi-form">{children}</div>
        {footer && <p className="bsi-terms">{footer}</p>}
      </main>
    </div>
  );
}
