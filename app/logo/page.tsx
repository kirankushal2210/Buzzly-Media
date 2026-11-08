import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { BuzzlyLogo, BuzzlyMark } from "@/components/BuzzlyLogo";
import "./logo.css";

export const metadata: Metadata = {
  title: "Brand Identity & Logo",
  description:
    "The official logo, mark, color palette, and visual assets of Buzzly Media.",
};

const brandColors = [
  {
    name: "Golden Honeycomb",
    hex: "#FFA500",
    desc: "Primary emblem gradient & horizon rules",
    color: "linear-gradient(135deg, #FFBE1A, #F08E00)",
  },
  {
    name: "Blackberry Dark",
    hex: "#1A0926",
    desc: "Core brand mark letterform & print wordmark",
    color: "#1A0926",
  },
  {
    name: "Editorial Charcoal",
    hex: "#151313",
    desc: "Primary canvas background",
    color: "#151313",
  },
  {
    name: "Editorial Cream",
    hex: "#F5EFDF",
    desc: "Primary typography & light surfaces",
    color: "#F5EFDF",
    darkText: true,
  },
  {
    name: "Action Vermilion",
    hex: "#EF342D",
    desc: "Interactive focus & conversion points",
    color: "#EF342D",
  },
];

const brandAssets = [
  {
    title: "Master Logo Card (Warm)",
    format: "PNG",
    file: "/logo/buzzly-logo-card.png",
    thumb: "/logo/buzzly-logo-card.png",
    lightBg: true,
    size: "300 × 280",
    desc: "Original brand lockup on subtle warm cream backdrop",
  },
  {
    title: "Dark Mode Logo (Transparent)",
    format: "PNG",
    file: "/logo/buzzly-logo-darkmode.png",
    thumb: "/logo/buzzly-logo-darkmode.png",
    lightBg: false,
    size: "Transparent PNG",
    desc: "Optimized for dark websites, videos, and presentations",
  },
  {
    title: "Light Mode Logo (Transparent)",
    format: "PNG",
    file: "/logo/buzzly-logo-transparent.png",
    thumb: "/logo/buzzly-logo-transparent.png",
    lightBg: true,
    size: "Transparent PNG",
    desc: "Deep blackberry wordmark for paper, merchandise, and light UI",
  },
  {
    title: "Honeycomb Emblem (Mark Only)",
    format: "PNG",
    file: "/logo/buzzly-mark-transparent.png",
    thumb: "/logo/buzzly-mark-transparent.png",
    lightBg: false,
    size: "130 × 130",
    desc: "Standalone hexagon play-mark for profile avatars and watermarks",
  },
  {
    title: "Vector Emblem (SVG)",
    format: "SVG",
    file: "/logo/buzzly-mark.svg",
    thumb: "/logo/buzzly-mark.svg",
    lightBg: false,
    size: "Vector XML",
    desc: "Scalable vector asset with gradient definitions for web & print",
  },
  {
    title: "Browser Favicon (SVG)",
    format: "SVG",
    file: "/favicon.svg",
    thumb: "/favicon.svg",
    lightBg: false,
    size: "100 × 100",
    desc: "Pinned tab icon and bookmark emblem",
  },
];

export default function LogoPage() {
  return (
    <Interior
      eyebrow="BUZZLY / BRAND IDENTITY"
      title="The Buzzly Media Logo."
      intro="The emblem, typography, and visual assets defining how Buzzly is seen."
    >
      <div className="logo-page-container">
        {/* Hero Spotlight */}
        <div className="logo-hero-grid">
          <div>
            <span className="logo-hero-badge">Official Brand Assets</span>
            <h2 className="logo-hero-title">
              Crafted for <em>motion</em> & clarity.
            </h2>
            <p className="logo-hero-desc">
              Buzzly builds brands through content. The identity fuses a golden
              honeycomb hexagon—symbolizing community and organic reach—with a
              modern lowercase “b” that holds an active video play button at its
              heart.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a
                href="/logo/buzzly-logo-card.png"
                download="buzzly-media-logo.png"
                className="cta"
              >
                Download Master Pack ↓
              </a>
              <a href="#assets" className="outlinecta">
                View All Formats
              </a>
            </div>
          </div>

          <div className="logo-card-spotlight">
            <BuzzlyLogo variant="vertical" theme="light" size="xl" />
          </div>
        </div>

        {/* Anatomy & Meaning */}
        <section className="logo-showcase-section">
          <div className="logo-section-head">
            <span className="interior-eyebrow">ANATOMY OF THE MARK</span>
            <h2>Three elements, one purpose.</h2>
            <p>
              Every contour was intentionally designed to signal technology-led
              media and high-velocity storytelling.
            </p>
          </div>

          <div className="logo-anatomy-grid">
            <div className="logo-anatomy-card">
              <h3>
                <span>01</span> The Golden Hexagon
              </h3>
              <p>
                A honeycomb cell in glowing amber. It grounds the “Buzz” in
                Buzzly, evoking industrious building, network resonance, and
                vitality.
              </p>
            </div>

            <div className="logo-anatomy-card">
              <h3>
                <span>02</span> The Lowercase “b”
              </h3>
              <p>
                An accessible, geometric humanist letterform in deep blackberry.
                Friendly yet authoritative, designed to scale down to 16px.
              </p>
            </div>

            <div className="logo-anatomy-card">
              <h3>
                <span>03</span> The Embedded Play Mark
              </h3>
              <p>
                A golden triangle within the counter of the “b”. It highlights
                motion, reels, and video production as Buzzly’s primary engine
                for reach.
              </p>
            </div>

            <div className="logo-anatomy-card">
              <h3>
                <span>04</span> The Horizon Rule & MEDIA
              </h3>
              <p>
                A thin golden midline framing wide-tracked uppercase caps. It
                gives the brand architectural balance across editorial
                compositions.
              </p>
            </div>
          </div>
        </section>

        {/* Lockup Variations */}
        <section className="logo-showcase-section">
          <div className="logo-section-head">
            <span className="interior-eyebrow">LOCKUP VARIATIONS</span>
            <h2>Responsive across any background.</h2>
            <p>
              Use the vertical lockup for hero placements and documents; use the
              horizontal lockup for headers, toolbars, and compact interfaces.
            </p>
          </div>

          <div className="logo-variants-grid">
            {/* Dark Mode Horizontal */}
            <div className="logo-variant-card dark-card">
              <span className="logo-variant-tag">Dark Mode • Horizontal</span>
              <BuzzlyLogo variant="horizontal" theme="dark" size="lg" />
            </div>

            {/* Light Mode Horizontal */}
            <div className="logo-variant-card light-card">
              <span className="logo-variant-tag">Light Mode • Horizontal</span>
              <BuzzlyLogo variant="horizontal" theme="light" size="lg" />
            </div>

            {/* Dark Mode Vertical */}
            <div className="logo-variant-card dark-card">
              <span className="logo-variant-tag">Dark Mode • Vertical</span>
              <BuzzlyLogo variant="vertical" theme="dark" size="lg" />
            </div>

            {/* Light Mode Vertical */}
            <div className="logo-variant-card light-card">
              <span className="logo-variant-tag">Light Mode • Vertical</span>
              <BuzzlyLogo variant="vertical" theme="light" size="lg" />
            </div>

            {/* Standalone Mark */}
            <div className="logo-variant-card accent-card">
              <span className="logo-variant-tag">Emblem Mark Only</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "28px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <BuzzlyMark size={72} />
                <BuzzlyMark size={48} />
                <BuzzlyMark size={32} />
                <BuzzlyMark size={20} />
              </div>
            </div>

            {/* Original Card Render */}
            <div className="logo-variant-card light-card">
              <span className="logo-variant-tag">Original Artwork Card</span>
              <img
                src="/logo/buzzly-logo-card.png"
                alt="Buzzly Media Master Artwork"
                style={{
                  maxWidth: "180px",
                  height: "auto",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                }}
              />
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="logo-showcase-section">
          <div className="logo-section-head">
            <span className="interior-eyebrow">COLOR SPECIFICATION</span>
            <h2>The brand palette.</h2>
            <p>
              Warm amber gold and vivid vermilion accent a rich near-black
              editorial canvas.
            </p>
          </div>

          <div className="palette-grid">
            {brandColors.map((c) => (
              <div key={c.name} className="color-swatch">
                <div
                  className="color-preview"
                  style={{
                    background: c.color,
                    color: c.darkText ? "#151313" : "#ffffff",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "10px",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {c.hex}
                </div>
                <div className="color-info">
                  <div className="color-name">{c.name}</div>
                  <div className="color-hex">{c.hex}</div>
                  <div className="color-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Asset Downloads Table */}
        <section className="logo-showcase-section" id="assets">
          <div className="logo-section-head">
            <span className="interior-eyebrow">ASSETS & DOWNLOADS</span>
            <h2>Production-ready files.</h2>
            <p>
              Right-click to copy or use the direct download links below for high-resolution PNGs and SVGs.
            </p>
          </div>

          <div className="assets-table-wrap">
            {brandAssets.map((asset) => (
              <div key={asset.title} className="assets-row">
                <div
                  className={`assets-thumb ${asset.lightBg ? "light-bg" : ""}`}
                >
                  <img
                    src={asset.thumb}
                    alt={asset.title}
                    style={{
                      maxHeight: "40px",
                      maxWidth: "40px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div>
                  <div className="asset-title">{asset.title}</div>
                  <div className="asset-meta">{asset.desc}</div>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--soft, #bbb5a9)",
                      background: "rgba(255,255,255,0.06)",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {asset.format} • {asset.size}
                  </span>
                </div>
                <div>
                  <a
                    href={asset.file}
                    download
                    className="download-pill"
                    aria-label={`Download ${asset.title}`}
                  >
                    Download ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Interior>
  );
}
