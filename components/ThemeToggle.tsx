"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, isThemeMode, resolveTheme, type ThemeMode } from "@/lib/theme";

const NEXT: Record<ThemeMode, ThemeMode> = { auto: "light", light: "dark", dark: "auto" };
const LABEL: Record<ThemeMode, string> = { auto: "Auto", light: "Light", dark: "Dark" };
const DESCRIBE: Record<ThemeMode, string> = {
  auto: "Theme: Auto, dark from 6 PM to 6 AM",
  light: "Theme: Light",
  dark: "Theme: Dark",
};

/** Applies a theme, fading colours briefly so the change never snaps. */
function applyTheme(mode: ThemeMode, animate: boolean) {
  const root = document.documentElement;
  const theme = resolveTheme(mode);
  if (root.dataset.theme === theme && root.dataset.themeMode === mode) return;
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-fading");
    window.setTimeout(() => root.classList.remove("theme-fading"), 450);
  }
  root.dataset.themeMode = mode;
  root.dataset.theme = theme;
}

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

const Icon = ({ mode }: { mode: ThemeMode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    {mode === "light" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
    {mode === "dark" && <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />}
    {mode === "auto" && <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></>}
  </svg>
);

/**
 * Auto / Light / Dark switch. In Auto it also re-checks the clock every
 * minute, so an open page turns dark at 6 PM and light at 6 AM on its own.
 */
export function ThemeToggle({ className = "", showLabel = true }: { className?: string; showLabel?: boolean }) {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    // The boot script already applied the stored theme; just sync the button.
    setMode(readMode()); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of localStorage after hydration
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readMode();
      setMode(next);
      applyTheme(next, true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (mode !== "auto") return;
    const tick = () => applyTheme("auto", true);
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [mode]);

  const cycle = () => {
    const next = NEXT[mode];
    setMode(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
    applyTheme(next, true);
  };

  return (
    <button type="button" className={`theme-toggle${showLabel ? "" : " theme-toggle--icon"} ${className}`.trim()} onClick={cycle} aria-label={`${DESCRIBE[mode]}. Change theme.`} title={DESCRIBE[mode]}>
      <Icon mode={mode} />
      {showLabel && <span className="theme-toggle-label">{LABEL[mode]}</span>}
    </button>
  );
}
