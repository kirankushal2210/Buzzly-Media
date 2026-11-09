import type { Metadata } from "next";
import { preload } from "react-dom";
import { Interior } from "@/components/Interior";
import { WorkGrid } from "@/components/work/WorkGrid";
import { caseStudies, isCategory } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies from Buzzly: brand, film, and content work across food, health, real estate, and partner campaigns.",
  alternates: { canonical: "/work" },
};

export default async function Work({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const { category } = await searchParams;
  const initial = typeof category === "string" && isCategory(category) ? category : "all";
  // The first card's poster is the page's largest paint; let the browser fetch it early and at high priority.
  const first = initial === "all" ? caseStudies[0] : caseStudies.find(study => study.category === initial);
  if (first) preload(first.poster, { as: "image", fetchPriority: "high" });
  return (
    <Interior eyebrow="BUZZLY / WORK IN MOTION" title="Ideas made visible." intro="The brands we’re building and the stories behind them—filter by the world you care about.">
      <WorkGrid initialCategory={initial} />
    </Interior>
  );
}
