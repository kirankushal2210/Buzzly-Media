"use client";

import { PREFILL_EVENT, type PrefillDetail } from "@/components/ContactForm";

/**
 * "I want results like {brand}": pre-fills the contact form on the same page
 * with that story, then scrolls to it. No navigation, nothing is sent.
 */
export function StoryCta({ company, before, after, className = "cta cs-story-cta", children }: { company: string; before: string; after: string; className?: string; children?: React.ReactNode }) {
  const start = () => {
    const detail: PrefillDetail = {
      interest: "content",
      message: `Hi Buzzly, the ${company} story sounds like us.\nWhere we are: ${before}\nWhere we want to be: ${after}\n\nAbout us: `,
    };
    window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail }));
    const target = document.getElementById("start-project");
    if (!target) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", "#start-project");
  };

  return (
    <button type="button" className={className} onClick={start}>
      {children ?? <>I want results like {company} →</>}
    </button>
  );
}
