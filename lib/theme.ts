/**
 * Light / dark theme.
 *
 * The visitor picks Auto, Light or Dark (stored in localStorage). Auto follows
 * the visitor's own clock: dark from DARK_FROM_HOUR until LIGHT_FROM_HOUR the
 * next morning, light in between. The resolved theme is written to
 * <html data-theme="light|dark"> before first paint by THEME_BOOT_SCRIPT, so
 * there is never a flash of the wrong theme. Colours live in app/theme.css.
 */
export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "buzzly-theme";
export const DARK_FROM_HOUR = 18; // 6:00 PM
export const LIGHT_FROM_HOUR = 6; // 6:00 AM

export const themeForHour = (hour: number): ResolvedTheme => (hour >= DARK_FROM_HOUR || hour < LIGHT_FROM_HOUR ? "dark" : "light");

export const resolveTheme = (mode: ThemeMode, now = new Date()): ResolvedTheme => (mode === "auto" ? themeForHour(now.getHours()) : mode);

export const isThemeMode = (value: unknown): value is ThemeMode => value === "auto" || value === "light" || value === "dark";

/** Inline <head> script: resolves the theme before anything paints. Falls back to dark (the original look). */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(m!=="light"&&m!=="dark")m="auto";var t=m;if(m==="auto"){var h=new Date().getHours();t=(h>=${DARK_FROM_HOUR}||h<${LIGHT_FROM_HOUR})?"dark":"light";}d.dataset.themeMode=m;d.dataset.theme=t;}catch(e){d.dataset.themeMode="auto";d.dataset.theme="dark";}})();`;
