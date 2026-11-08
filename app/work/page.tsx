import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { InViewVideo } from "@/components/InViewVideo";
import { companies } from "@/lib/content";

export const metadata: Metadata = { title: "Work", description: "Explore the companies Buzzly is building through content and distribution." };

export default function Work() {
  return <Interior eyebrow="BUZZLY / WORK IN MOTION" title="Ideas made visible." intro="Explore the businesses Buzzly is building and the worlds around them.">
    <section className="interior-grid" aria-label="Buzzly company films">
      {companies.map(company => <article className="interior-card" key={company.slug}>
        <a href={`/companies/${company.slug}`} aria-label={`Explore ${company.name}`}>
          <InViewVideo src={company.video} poster={company.poster} />
          <h2>{company.name}</h2><p>{company.field}</p>
        </a>
      </article>)}
    </section>
  </Interior>;
}
