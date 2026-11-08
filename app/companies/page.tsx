import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";

export const metadata: Metadata = { title: "Our companies", description: "Meet the three businesses Buzzly is building: De Food Kampney, Buzzly Health, and Buzzly Properties." };

export default function Companies() {
  return (
    <Interior eyebrow="BUZZLY / OUR COMPANIES" title="Where we’re building." intro="Three businesses. Distinct worlds. One belief: content can build the brand and the reach around it.">
      <section className="company-stage" aria-label="Buzzly companies">
        {companies.map((company, index) => (
          <article className={`company-feature company-feature-${index + 1}`} key={company.slug}>
            <a href={`/companies/${company.slug}`} aria-label={`Explore ${company.name}`}>
              <div className="company-feature-film">
                <InViewVideo src={company.video} poster={company.poster} />
                <span className="company-feature-tag">BUZZLY COMPANY / 0{index + 1}</span>
                <span className="company-feature-arrow" aria-hidden="true">↗</span>
                <strong>{company.name}</strong>
              </div>
              <div className="company-feature-caption"><h2>{company.name}</h2><span>{company.field}</span><span>EXPLORE ↗</span></div>
            </a>
          </article>
        ))}
        <div className="company-stage-outro"><span>01 — 03 / OUR COMPANIES</span><p>Own the idea.<br /><em>Build the reach.</em></p></div>
      </section>
    </Interior>
  );
}
