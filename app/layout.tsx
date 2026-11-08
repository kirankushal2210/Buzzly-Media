import type { Metadata } from "next";
import { preload } from "react-dom";
import "./globals.css";
import "./prototype.css";
import "./interior.css";
import "./clients.css";
import "./companies.css";
import "./services.css";
import "./about.css";
import "./company-detail.css";
import "./design-match.css";
import "./react-sections.css";
import { siteDescription, siteName, siteTitle, siteUrl, socialLinks } from "@/lib/site";

const shareDescription = "We build brands through content—our own sub-companies and ambitious outside partners’ businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | Buzzly" },
  description: siteDescription,
  openGraph: { title: siteTitle, description: shareDescription, type: "website", siteName, url: siteUrl, locale: "en_US" },
  twitter: { card: "summary_large_image", title: siteTitle, description: shareDescription },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      alternateName: "Buzzly Media",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo/buzzly-logo-card.png`, width: 270, height: 265 },
      image: `${siteUrl}/opengraph-image`,
      description: siteDescription,
      slogan: "Building brands through content.",
      ...(socialLinks.length ? { sameAs: socialLinks } : {}),
      contactPoint: { "@type": "ContactPoint", contactType: "sales", url: `${siteUrl}/contact`, availableLanguage: ["en"] },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteTitle,
      description: siteDescription,
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

const fonts = ["dm-sans-latin", "instrument-serif-latin", "instrument-serif-italic-latin"];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // One preload hint per critical font (React dedupes these; <link> tags were emitted twice).
  for (const font of fonts) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return <html lang="en" suppressHydrationWarning><head>
    {/* Enables scroll-reveal styles only when JavaScript runs; content stays visible otherwise. */}
    <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </head><body>{children}</body></html>;
}
