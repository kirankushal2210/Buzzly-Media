"use client";

import { useEffect } from "react";
import { HomeHeader, Hero, Splash } from "@/components/HomeIntro";
import { prototypeFooter, prototypeMainTail, prototypeOverlay } from "@/lib/prototype-tail";

export default function Home() {
  useEffect(() => {
    document.body.classList.add("is-loading");
    if (document.getElementById("buzzly-prototype-script")) return;
    const fallback = window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.getElementById("splash")?.classList.add("done");
    }, 3000);
    const script = document.createElement("script");
    script.id = "buzzly-prototype-script";
    script.src = "/prototype.js";
    script.async = true;
    document.body.appendChild(script);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <>
      <Splash />
      <div id="site">
        <HomeHeader />
        <main id="top">
          <Hero />
          <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: prototypeMainTail }} />
        </main>
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: prototypeFooter }} />
      </div>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: prototypeOverlay }} />
    </>
  );
}
