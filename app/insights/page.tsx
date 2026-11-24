import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { InsightCta } from "@/components/InsightCta";
import { PlaybookIndex } from "@/components/insights/PlaybookIndex";
import { playbooks } from "@/data/insights";

export const metadata: Metadata = {
  alternates: { canonical: "/insights" },
  title: "Insights",
  description: "Tactical playbooks from Buzzly on short-form scripting, distribution and turning organic content into inbound pipeline.",
};

export default function Insights() {
  const items = playbooks.map(({ slug, title, subtitle, category, readTime }) => ({ slug, title, subtitle, category, readTime }));
  return (
    <Interior eyebrow="BUZZLY / INSIGHTS" title="Inbound playbooks." intro="How we script, distribute and convert content, written down so you can use it.">
      <section className="insights-hub" aria-label="Playbooks">
        <PlaybookIndex items={items} />
        <InsightCta />
      </section>
    </Interior>
  );
}
