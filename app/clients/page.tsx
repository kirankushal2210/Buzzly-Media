/* eslint-disable @next/next/no-img-element -- static poster frames from /public/media */
import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { QuoteSlider } from "@/components/clients/QuoteSlider";
import { clientLogos, testimonials } from "@/lib/clients";
import { caseStudies } from "@/lib/work";

export const metadata: Metadata = {
  title: "Client Confessions and Wins",
  description: "The brands Buzzly builds with, what partners say about the work, and the outcomes behind each story.",
  alternates: { canonical: "/clients" },
};

export default function Clients() {
  return (
    <Interior eyebrow="BUZZLY / PEOPLE WE BUILD WITH" title="Client Confessions and Wins." intro="The brands we build with, what they say about the work, and where each story landed.">
      <section className="clients-logos" aria-label="Brands we build with">
        <p>BRANDS WE BUILD WITH</p>
        <div className="clients-logo-grid">
          {clientLogos.map(logo => (
            <Link key={logo.name} href={logo.href ?? "/contact"} className={`clients-logo${logo.name === "Your brand" ? " is-open" : ""}`}>
              <span>{logo.field}</span>
              <strong>{logo.name}{logo.name === "Your brand" ? " ↗" : ""}</strong>
            </Link>
          ))}
        </div>
      </section>

      <QuoteSlider testimonials={testimonials} />

      <section className="outcome-section" aria-labelledby="outcomes-title">
        <header>
          <div><p className="interior-eyebrow">BUZZLY / OUTCOMES</p><h2 id="outcomes-title">You win.<br /><em>We grin.</em></h2></div>
          <p>Every story starts with a brief and ends with something you can point to. Open a card for the full problem, solution, and results.</p>
        </header>
        <div className="outcome-grid">
          {caseStudies.map(study => {
            const headline = study.stats[study.illustrative ? 1 : 0];
            return (
              <Link key={study.slug} className="outcome-card" href={`/work/${study.slug}`} style={{ ["--accent" as string]: study.accent }}>
                <img src={study.poster} alt="" loading="lazy" />
                <div>
                  <span>{study.categoryLabel}</span>
                  <strong>{headline.value}</strong>
                  <p>{headline.label} — {study.client}</p>
                  <small>{study.illustrative ? "Illustrative scenario · not a client result" : "Read the case study ↗"}</small>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="clients-page-process" aria-label="How a partnership takes shape">
        <div className="clients-page-process-heading"><p className="interior-eyebrow">THE WORK BEHIND THE STORY</p><h2>A brief.<br />A story.<br /><em>A way<br />forward.</em></h2><p>We begin with what a business wants people to know, then create content that gives the idea a form and helps it reach an audience.</p></div>
        <div className="clients-page-process-steps"><div><span>01 / LISTEN</span><p>Understand the business, its audience, and the change it wants to make.</p></div><div><span>02 / CREATE</span><p>Shape the strategy, write the story, and make the content.</p></div><div><span>03 / DISTRIBUTE</span><p>Publish, learn from the response, and keep building reach.</p></div></div>
      </section>

      <section className="clients-page-wins">
        <p className="interior-eyebrow">BUZZLY / YOUR STORY NEXT</p>
        <h2>Your brand.<br /><em>Our next win.</em></h2>
        <p>We build content and distribution for ambitious businesses and the companies we are building. Tell us what you want people to know.</p>
        <Link href="/contact">Start a Project ↗</Link>
      </section>
    </Interior>
  );
}
