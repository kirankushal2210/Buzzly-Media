import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { clientWins, testimonials } from "@/lib/clients";

/** Homepage teaser for /clients: one quote, three client wins, one link. Sub-companies never appear here. */
export function ClientPreviewSection() {
  const quote = testimonials[0];
  const wins = clientWins.slice(0, 3);
  const hasSamples = !quote?.approved || wins.some(win => win.sample);
  return (
    <Reveal className="clientproof" id="clients" aria-labelledby="clients-title">
      <div className="wrap clientproof-head">
        <p className="eyebrow">BUZZLY / PEOPLE WE BUILD WITH</p>
        <h2 id="clients-title">Client<br /><em>Confessions</em><span> and Wins.</span></h2>
        {hasSamples && <p className="clientproof-note">Sample brands and quotes, shown as placeholders until our first client stories are approved.</p>}
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
          {wins.map(win => (
            <li key={win.company} style={{ ["--accent" as string]: win.accent }}>
              <Link href="/clients">
                <strong>{win.company}</strong>
                <span>{win.win}</span>
                <small>{win.field}{win.sample ? " · Sample" : ""} ↗</small>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="outlinecta clientteaser-cta" href="/clients">All client stories ↗</Link>
      </div>
    </Reveal>
  );
}
