"use client";

import { APPLY_EVENT } from "@/components/careers/ApplicationForm";

/** Picks this role in the application form on the same page and scrolls to it. */
export function ApplyButton({ role, children }: { role: string; children: React.ReactNode }) {
  const apply = () => {
    window.dispatchEvent(new CustomEvent<string>(APPLY_EVENT, { detail: role }));
    const target = document.getElementById("apply");
    if (!target) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", "#apply");
  };
  return <button type="button" className="careers-apply-btn" onClick={apply}>{children}</button>;
}
