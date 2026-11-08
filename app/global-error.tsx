"use client";

/* Last-resort boundary for errors in the root layout itself. It replaces the whole document, so styles are inline. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#151313", color: "#f5efdf", fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <main role="alert" style={{ maxWidth: 640 }}>
          <p style={{ color: "#ef342d", letterSpacing: ".14em", fontSize: 12, fontWeight: 700 }}>BUZZLY / ERROR</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(48px, 9vw, 96px)", lineHeight: 0.95, margin: "20px 0" }}>We dropped the reel.</h1>
          <p style={{ color: "#bbb5a9", fontSize: 18, lineHeight: 1.5 }}>The site hit an unexpected problem. Please try again.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <button type="button" onClick={() => reset()} style={{ background: "#ef342d", color: "#111", border: 0, padding: "14px 22px", fontWeight: 700, cursor: "pointer" }}>Try again</button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router may be unavailable here; force a full reload */}
            <a href="/" style={{ color: "#f5efdf", border: "1px solid #f5efdf", padding: "13px 22px", textDecoration: "none" }}>Return Home</a>
          </div>
        </main>
      </body>
    </html>
  );
}
