"use client";

import { useEffect } from "react";
import Link from "@/components/Link";

/** Catches runtime errors below the root layout, so one broken section never takes down the site. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Buzzly page error", error);
  }, [error]);

  return (
    <div className="interior">
      <main id="top" className="status-page" role="alert">
        <p className="interior-eyebrow">ERROR / SOMETHING SLIPPED</p>
        <h1>We dropped<br /><em>the reel.</em></h1>
        <p className="status-page-copy">Something went wrong while loading this page. Try again, or head back home.</p>
        {error.digest && <p className="status-page-ref">Reference: {error.digest}</p>}
        <div className="status-page-actions">
          <button className="cta" type="button" onClick={() => reset()}>Try again</button>
          <Link className="outlinecta" href="/">Return Home</Link>
        </div>
      </main>
    </div>
  );
}
