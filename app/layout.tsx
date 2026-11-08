import type { Metadata } from "next";
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
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";

const shareDescription = "We build brands through content—our own companies and ambitious partners’ businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | Buzzly" },
  description: siteDescription,
  openGraph: { title: siteTitle, description: shareDescription, type: "website", siteName, url: siteUrl, locale: "en_US" },
  twitter: { card: "summary_large_image", title: siteTitle, description: shareDescription },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/logo/buzzly-mark-card.png`,
  description: siteDescription,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head>
    {/* Enables scroll-reveal styles only when JavaScript runs; content stays visible otherwise. */}
    <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
    <link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
  </head><body>{children}</body></html>;
}
