#!/usr/bin/env node
/**
 * Post-deploy smoke check for the Buzzly website (docs/10 §5, automated).
 *
 *   node tools/smoke.mjs https://www.buzzly.in
 *   MAINTAINER_TOKEN=... node tools/smoke.mjs https://www.buzzly.in
 *   node tools/smoke.mjs https://www.buzzly.in --inquiry   # also submits ONE clearly labelled test lead
 *
 * Read-only unless --inquiry is passed. Exit code 1 when anything that would
 * hurt a visitor is wrong (page down, form not accepting leads, old build live).
 * Needs Node 22+ (global fetch, AbortSignal.timeout). No dependencies.
 */

const args = process.argv.slice(2);
const originArg = args.find(a => !a.startsWith("--")) || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173";
const origin = originArg.replace(/\/$/, "");
const sendInquiry = args.includes("--inquiry");
const token = process.env.MAINTAINER_TOKEN;
const TIMEOUT = 15000;

const PAGES = ["/", "/work", "/work/de-food-kampney", "/services", "/about", "/clients", "/companies", "/companies/buzzly-health", "/contact", "/careers", "/privacy", "/terms"];

const results = [];
const log = (ok, label, detail = "", level = "fail") => {
  results.push({ ok, label, detail, level });
  const mark = ok ? "✔" : level === "warn" ? "⚠" : "✘";
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
};
const pass = (label, detail) => log(true, label, detail);
const fail = (label, detail) => log(false, label, detail, "fail");
const warn = (label, detail) => log(false, label, detail, "warn");

async function get(path, init = {}) {
  const url = path.startsWith("http") ? path : origin + path;
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT), headers: { "user-agent": "buzzly-smoke/1.0" }, ...init });
    const text = await res.text().catch(() => "");
    return { res, text };
  } catch (error) {
    return { res: null, text: "", error: error instanceof Error ? error.message : String(error) };
  }
}

console.log(`Smoke check → ${origin}${token ? " (maintainer token present)" : ""}\n`);

// 1. Every public page answers 200 and the 404 is branded.
for (const path of PAGES) {
  const { res, error } = await get(path);
  if (res?.status === 200) pass(`GET ${path}`, "200");
  else fail(`GET ${path}`, error || `status ${res?.status}`);
}
{
  const { res, text } = await get("/this-page-does-not-exist");
  if (res?.status === 404 && /Return Home|See our work/i.test(text)) pass("Unknown URL", "branded 404");
  else if (res?.status === 404) warn("Unknown URL", "404 but not the branded page");
  else fail("Unknown URL", `status ${res?.status}`);
}

// 2. The contact form can actually accept leads.
{
  const { res, text } = await get("/api/contact");
  let ready = null;
  try { ready = JSON.parse(text).ready; } catch { /* non-JSON */ }
  if (ready === true) pass("Contact form readiness", "ready:true");
  else fail("Contact form readiness", ready === false ? "ready:false — no lead channel configured; visitors cannot submit" : `unexpected response ${res?.status}`);
}
{
  // Cross-site POSTs must be refused.
  const { res } = await get("/api/contact", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: "{}" });
  if (res?.status === 403) pass("CSRF origin check", "403 for foreign Origin");
  else fail("CSRF origin check", `status ${res?.status}`);
}

// 3. Canonical URLs, sitemap and robots point at this exact origin (no redirect hop).
{
  const { text } = await get("/");
  const canonical = text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) warn("Canonical URL", "no canonical tag found");
  else if (canonical.replace(/\/$/, "") === origin) pass("Canonical URL", canonical);
  else fail("Canonical URL", `${canonical} ≠ ${origin} — set NEXT_PUBLIC_SITE_URL=${origin} and redeploy`);
  if (/buzzly\.media/i.test(text)) fail("Foreign domain", "page references buzzly.media (not ours)");
}
{
  const { text } = await get("/sitemap.xml");
  const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const wrong = locs.filter(l => !l.startsWith(origin));
  if (!locs.length) fail("Sitemap", "no <loc> entries");
  else if (wrong.length) fail("Sitemap", `${wrong.length}/${locs.length} entries use another origin, e.g. ${wrong[0]}`);
  else pass("Sitemap", `${locs.length} URLs on ${origin}`);
}
{
  const { text } = await get("/robots.txt");
  if (text.includes(`Sitemap: ${origin}/sitemap.xml`)) pass("robots.txt", "sitemap line correct");
  else fail("robots.txt", text.match(/Sitemap: \S+/)?.[0] || "no Sitemap line");
}

// 4. Security headers on the homepage.
{
  const { res } = await get("/");
  const h = res?.headers;
  if (!h) fail("Security headers", "no response");
  else {
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin);
    if (h.get("content-security-policy")) pass("CSP header");
    else if (isLocal) warn("CSP header", "missing on the dev server (headers are added by the Worker / next.config in production)");
    else fail("CSP header", "missing");
    if (h.get("x-frame-options")?.toUpperCase() === "DENY") pass("X-Frame-Options", "DENY");
    else fail("X-Frame-Options", h.get("x-frame-options") || "missing");
    if (h.get("x-content-type-options") === "nosniff") pass("X-Content-Type-Options", "nosniff");
    else fail("X-Content-Type-Options", "missing");
    if (origin.startsWith("https://")) {
      if (h.get("strict-transport-security")) pass("HSTS");
      else fail("HSTS", "missing");
    }
  }
}

// 5. Apex → www redirect (only when the origin is a www host).
if (/^https:\/\/www\./.test(origin)) {
  const apex = origin.replace("://www.", "://");
  const { res, error } = await get(apex);
  const location = res?.headers.get("location")?.replace(/\/$/, "");
  if (res && res.status >= 300 && res.status < 400 && location === origin) pass("Apex redirect", `${apex} → ${origin} (${res.status})`);
  else warn("Apex redirect", error || `${apex} answered ${res?.status}${location ? ` → ${location}` : ""}`);
}

// 6. Is the deployed build current? Old builds carried a dead /book page and a maintenance notice.
{
  const { text } = await get("/contact");
  const stale = [];
  if (/href="\/book"/.test(text)) stale.push("link to /book");
  if (/24[–-]48 business hours/.test(text)) stale.push("'24–48 business hours' copy");
  if (/inbox is being set up/i.test(text)) stale.push("'inbox is being set up' notice");
  if (stale.length) fail("Deployed build", `old build still live: ${stale.join(", ")}`);
  else pass("Deployed build", "no stale markers on /contact");
}

// 7. Maintainer endpoints: hidden without a token, informative with one.
{
  const { res } = await get("/api/admin/health");
  if (res?.status === 404) pass("Admin without token", "404 (MAINTAINER_TOKEN unset — set it to use the health check)", );
  else if (res?.status === 401) pass("Admin without token", "401");
  else fail("Admin without token", `status ${res?.status} — endpoint must not be open`);
}
if (token) {
  const { res, text } = await get("/api/admin/health", { headers: { authorization: `Bearer ${token}` } });
  if (res?.status !== 200) fail("Admin health", `status ${res?.status}`);
  else {
    let health = null;
    try { health = JSON.parse(text); } catch { /* ignore */ }
    if (!health) fail("Admin health", "not JSON");
    else {
      const on = Object.entries(health.leads?.channels ?? {}).filter(([, v]) => v).map(([k]) => k);
      (health.ok ? pass : fail)("Admin health", `channels: ${on.join(", ") || "none"}; storage: ${health.leads?.storage}; siteUrl: ${health.siteUrl}`);
      for (const w of health.warnings ?? []) warn("Health warning", w);
    }
  }
}

// 8. Optional: one labelled test inquiry through the real endpoint.
if (sendInquiry) {
  const body = {
    name: "Smoke test (ignore)",
    email: "smoke-test@example.com",
    company: "Buzzly smoke check",
    interest: "other",
    message: `Automated post-deploy smoke test from tools/smoke.mjs at ${new Date().toISOString()}. Safe to delete.`,
  };
  const { res, text } = await get("/api/contact", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) });
  if (res?.status === 200) pass("Test inquiry", "200 — check your lead channel for 'Smoke test (ignore)'");
  else fail("Test inquiry", `status ${res?.status} ${text.slice(0, 160)}`);
}

const failures = results.filter(r => !r.ok && r.level === "fail");
const warnings = results.filter(r => !r.ok && r.level === "warn");
console.log(`\n${results.length - failures.length - warnings.length} passed, ${warnings.length} warnings, ${failures.length} failures`);
process.exit(failures.length ? 1 : 0);
