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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buzzly-work-gallery-1107.hillyjewel4.chatgpt.site"),
  title: { default: "Buzzly — Building Brands Through Content", template: "%s | Buzzly" },
  description: "Buzzly is a technology-led company builder. We build brands through content—our own companies and ambitious partners’ businesses.",
  openGraph: { title: "Buzzly — Building Brands Through Content", description: "We build brands through content—our own companies and ambitious partners’ businesses.", type: "website", siteName: "Buzzly", images: [{ url: "/social-share.png", width: 1200, height: 630, alt: "Buzzly — Building brands through content" }] },
  twitter: { card: "summary_large_image", title: "Buzzly — Building Brands Through Content", description: "We build brands through content—our own companies and ambitious partners’ businesses.", images: ["/social-share.png"] },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  </head><body>{children}</body></html>;
}
