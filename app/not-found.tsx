import type { Metadata } from "next";
import Link from "@/components/Link";
import { InteriorHeader } from "@/components/InteriorHeader";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="interior">
      <InteriorHeader />
      <main id="top" className="status-page">
        <p className="interior-eyebrow">ERROR 404 / SIGNAL LOST</p>
        <h1>This page is<br /><em>off the air.</em></h1>
        <p className="status-page-copy">The link may be old, or the page has moved. Everything else is still broadcasting.</p>
        <div className="status-page-actions">
          <Link className="cta" href="/">Return Home</Link>
          <Link className="outlinecta" href="/work">See our work</Link>
        </div>
        <div className="status-page-static" aria-hidden="true"><span>NO SIGNAL</span></div>
      </main>
      <HomeFooter variant="interior" />
    </div>
  );
}
