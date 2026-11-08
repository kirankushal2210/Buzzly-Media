/* Shared layout for generated OpenGraph images (rendered by next/og / satori: inline styles only). */
export const ogSize = { width: 1200, height: 630 };

export function OgCard({ eyebrow, title, subtitle, accent = "#ef342d" }: { eyebrow: string; title: string; subtitle?: string; accent?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#151313", color: "#f5efdf", padding: "64px 72px", fontFamily: "serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: "linear-gradient(135deg,#ffb23f,#e0731f)", display: "flex", alignItems: "center", justifyContent: "center", color: "#151313", fontSize: 34, fontWeight: 700 }}>b</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -2 }}>buzzly</div>
        </div>
        <div style={{ fontSize: 20, letterSpacing: 4, color: accent, textTransform: "uppercase" }}>{eyebrow}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: title.length > 40 ? 78 : 96, lineHeight: 1, letterSpacing: -3, maxWidth: 1000 }}>{title}</div>
        {subtitle && <div style={{ marginTop: 26, fontSize: 32, color: accent, fontStyle: "italic" }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #403b38", paddingTop: 22, fontSize: 20, color: "#bbb5a9" }}>
        <span>Building brands through content</span>
        <span style={{ color: accent }}>Ours and everyone else’s ↗</span>
      </div>
    </div>
  );
}
