import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { testimonials } from "@/lib/clients";
import { caseStudies } from "@/lib/work";

/** Homepage teaser for /clients: one quote, three outcomes, one link. */
export function ClientPreviewSection() {
  const quote = testimonials[0];
  const outcomes = caseStudies.slice(0, 3);
  return (
    <Reveal className="clientproof" id="clients" aria-labelledby="clients-title">
      <div className="wrap clientproof-head">
        <p className="eyebrow">BUZZLY / PEOPLE WE BUILD WITH</p>
        <h2 id="clients-title">Client<br /><em>Confessions</em><span> and Wins.</span></h2>
      </div>
      <div className="wrap clientteaser">
        {quote && (
          <figure className="clientteaser-quote">
            <blockquote>{quote.quote}</blockquote>
            <figcaption>
              <span>{quote.role}, {quote.company}</span>
              {!quote.approved && <span className="quote-pending">Sample · awaiting approval</span>}
            </figcaption>
          </figure>
        )}
        <ul className="clientteaser-outcomes">
          {outcomes.map(study => (
            <li key={study.slug} style={{ ["--accent" as string]: study.accent }}>
              <Link href={`/work/${study.slug}`}>
                <strong>{study.stats[0].value}</strong>
                <span>{study.stats[0].label}</span>
                <small>{study.client}{study.isSubCompany ? " · Buzzly sub-company" : ""} ↗</small>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="outlinecta clientteaser-cta" href="/clients">All client stories ↗</Link>
      </div>
    </Reveal>
  );
}
