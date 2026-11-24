import Link from "@/components/Link";
import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { ContentReadinessAudit } from "@/components/ContentReadinessAudit";
import { TechStack } from "@/components/TechStack";
import { Badge, Button, SurfaceCard } from "@/components/ui/core";
import { engagementTiers } from "@/lib/engagements";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs, serviceCatalog } from "@/lib/structured-data";
import { services } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/services" }, title: "Services", description: "Three engagement tiers, the tech and distribution stack behind them, and a free content engine score for your brand." };

const steps = [
  { number: "01", title: "Find the idea.", copy: "We learn what the business wants to build, who it needs to reach, and what should make people care." },
  { number: "02", title: "Shape the story.", copy: "We turn that direction into a clear content plan: themes, scripts, formats, and a visual language for the brand." },
  { number: "03", title: "Make it visible.", copy: "Reels, films, images, and words give the brand a form people can see, understand, and remember." },
  { number: "04", title: "Help it travel.", copy: "Publishing, social channels, search-aware content, and planned campaigns help that work reach the right audience." },
  { number: "05", title: "Learn and build.", copy: "We look at what people respond to, refine the content, and keep building the brand’s distribution over time." },
];

export default function Services() {
  return (
    <Interior eyebrow="BUZZLY / WHAT WE DO" title="We know what moves brands." intro="Strategy, content, social media, and distribution work together to help brands earn attention and build lasting reach.">
      <JsonLd data={[breadcrumbs([{ name: "Services", path: "/services" }]), serviceCatalog(services)]} />
      <section className="services-banner" aria-label="Buzzly services"><span>CONTENT</span><span>SOCIAL</span><span>DISTRIBUTION</span></section>

      <section className="tiers" aria-labelledby="tiers-title">
        <div className="tiers-head">
          <p className="interior-eyebrow">ENGAGEMENTS / 01 — 03</p>
          <h2 id="tiers-title">Pick the scope<br /><em>that fits.</em></h2>
          <p>Three ways to work with us. Choose one and your inquiry arrives with your scope already selected.</p>
        </div>
        <ol className="tiers-grid">
          {engagementTiers.map(tier => (
            <SurfaceCard as="li" key={tier.slug} className={`tier${tier.badge ? " is-featured" : ""}`}>
              <div className="tier-top">
                <span className="bz-mono">Tier {tier.number}</span>
                {tier.badge ? <Badge tone="solid">{tier.badge}</Badge> : <Badge>{tier.term}</Badge>}
              </div>
              <h3>{tier.name}</h3>
              {tier.badge && <span className="bz-mono tier-term">{tier.term}</span>}
              <p className="tier-summary">{tier.summary}</p>
              <ul className="tier-list">{tier.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
              <Button href={`/contact?scope=${tier.slug}#lead-form`} variant={tier.badge ? "primary" : "secondary"} className="tier-cta">Select This Scope →</Button>
            </SurfaceCard>
          ))}
        </ol>
      </section>

      <section className="services-story">
        <div className="services-story-lead"><span className="interior-eyebrow">HOW IT MOVES / 01 — 05</span><h2>From the first conversation to the next chapter.</h2><p>Every brand starts with a different challenge. This is how Buzzly turns an idea into content and helps it find an audience.</p><Link href="/contact">Start a Project ↗</Link></div>
        <div className="services-steps">{steps.map(step => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
      </section>

      <TechStack />
      <ContentReadinessAudit />
    </Interior>
  );
}
