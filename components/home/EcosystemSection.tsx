"use client";

import { Tabs } from "radix-ui";
import Link from "@/components/Link";
import { InViewVideo } from "@/components/InViewVideo";
import { Reveal } from "@/components/Reveal";
import { companies } from "@/lib/content";

const brings = ["Real-world proof of what content can build", "A testing ground for formats and channels"];
const gets = ["Brand strategy and identity", "Films, reels, and social content", "Distribution and audience growth"];

/** Homepage sub-company showcase: one tab per sub-company, each playing its motion-graphics promo and linking to its full page. */
export function EcosystemSection() {
  return (
    <Reveal className="ecosystem wrap" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="ecosystem-title">
        <p className="eyebrow">THE BUZZLY ECOSYSTEM</p>
        <h2 id="ecosystem-title">Inside<br />Buzzly.</h2>
        <p className="ecosystem-lede">One content engine powering the sub-companies we own and build.</p>
      </div>
      <Tabs.Root className="eco-tabs" defaultValue={companies[0].slug}>
        <Tabs.List className="eco-tablist" aria-label="Buzzly sub-companies">
          {companies.map((company, index) => (
            <Tabs.Trigger key={company.slug} value={company.slug} className="eco-tab" style={{ ["--accent" as string]: company.accent }}>
              <span>0{index + 1}</span>{company.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {companies.map(company => (
          <Tabs.Content key={company.slug} value={company.slug} className="eco-panel" style={{ ["--accent" as string]: company.accent }}>
            <div className="eco-panel-media">
              {/* Poster paints first; the film loads and plays only while this tab is open and in view. */}
              <InViewVideo src={company.promo} poster={company.promoPoster} />
              <span>Buzzly sub-company / {company.field}</span>
            </div>
            <div className="eco-panel-copy">
              <h3>{company.word}</h3>
              <p>{company.intro}</p>
              <div className="eco-flow" aria-label="How value moves">
                <div><small>Brings to the ecosystem</small><ul>{brings.map(item => <li key={item}>{item}</li>)}</ul></div>
                <span className="eco-flow-arrow" aria-hidden="true">⇄</span>
                <div><small>Gets from Buzzly</small><ul>{gets.map(item => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <Link href={`/companies/${company.slug}`} className="plain">Explore {company.name} ↗</Link>
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Reveal>
  );
}
