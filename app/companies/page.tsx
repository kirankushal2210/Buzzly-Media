import Link from "@/components/Link";
import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";

export const metadata: Metadata = { alternates: { canonical: "/companies" }, title: "Our Sub-Companies in Food, Health and Property", description: "Meet the three dedicated sub-companies Buzzly Media is building: De Food Kampney, Buzzly Health, and Buzzly Properties." };

export default function Companies() {
  return (
    <Interior eyebrow="BUZZLY / OUR SUB-COMPANIES" title="Where we’re building." intro="Three dedicated sub-companies founded, owned, and operated by Buzzly Media. Distinct worlds. One belief: content can build the brand and the reach around it.">
      <section className="company-stage" aria-label="Buzzly sub-companies">
        {companies.map((company, index) => (
          <article className={`company-feature company-feature-${index + 1}`} key={company.slug}>
            <Link href={`/companies/${company.slug}`} aria-label={`Explore ${company.name}`}>
              <div className="company-feature-film">
                <InViewVideo src={company.promo} poster={company.promoPoster} />
                <span className="company-feature-tag">BUZZLY SUB-COMPANY / 0{index + 1}</span>
                <span className="company-feature-arrow" aria-hidden="true">↗</span>
                <strong>{company.name}</strong>
              </div>
              <div className="company-feature-caption"><h2>{company.name}</h2><span>{company.field}</span><span>EXPLORE ↗</span></div>
            </Link>
          </article>
        ))}
        <div className="company-stage-outro"><span>01 — 03 / OUR SUB-COMPANIES</span><p>Own the idea.<br /><em>Build the reach.</em></p></div>
      </section>
      <section className="companies-why" aria-labelledby="companies-why-title">
        <span className="interior-eyebrow">WHY WE BUILD OUR OWN</span>
        <h2 id="companies-why-title">Skin in the game.</h2>
        <div className="companies-why-body">
          <p>Buzzly builds and runs its own ventures in food, healthcare and real estate with the same engine it offers to partner brands. Strategy finds the idea. Content gives it a form people can see. Distribution helps it reach the people it is made for.</p>
          <p>Running our own companies means every method is tried on our own brands, with our own time and budget, before we recommend it to anyone else. The three pods behind them (brand and film direction, distribution and growth strategy, and web, AI and technology) work as one team.</p>
          <p><Link href="/about">How Buzzly works ↗</Link> <Link href="/services">What we do for partner brands ↗</Link> <Link href="/work">See the work ↗</Link></p>
        </div>
      </section>
    </Interior>
  );
}
