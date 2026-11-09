/**
 * Security headers for every response the Worker renders (pages, RSC payloads,
 * API routes, generated images). Static files in /public get the equivalent
 * rules from public/_headers.
 */
// The intro-call calendar on /book is a Cal.com embed (lib/booking.ts): its loader script
// and booking iframe come from Cal.com, and nothing else third-party is allowed.
const bookingOrigins = "https://app.cal.com https://cal.com";

export const contentSecurityPolicy = [
  "default-src 'self'",
  // vinext streams RSC data and the theme bootstrap as inline scripts.
  `script-src 'self' 'unsafe-inline' ${bookingOrigins}`,
  `frame-src ${bookingOrigins}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${bookingOrigins}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const baseHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "on",
};

export function withSecurityHeaders(response: Response, request: Request, { production }: { production: boolean }) {
  // WebSocket upgrades and opaque responses must pass through untouched.
  if (response.status === 101 || response.webSocket) return response;
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(baseHeaders)) {
    if (!secured.headers.has(name)) secured.headers.set(name, value);
  }
  // Dev needs Vite's HMR client (eval + websockets), so the CSP is production-only.
  if (production && !secured.headers.has("Content-Security-Policy")) {
    secured.headers.set("Content-Security-Policy", contentSecurityPolicy);
  }
  if (new URL(request.url).protocol === "https:") {
    secured.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return secured;
}
