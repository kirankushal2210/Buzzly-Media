import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { legal } from "@/lib/legal";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Shared layout for /privacy and /terms: sticky table of contents and readable long-form text. */
export function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <Interior eyebrow={eyebrow} title={title} intro={intro}>
      <div className="legal">
        <nav className="legal-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
          <p>Last updated {legal.lastUpdated}</p>
        </nav>
        <div className="legal-body">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
              {section.body}
            </section>
          ))}
          <p className="legal-contact">Questions? {legal.privacyEmail ? <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a> : <Link href="/contact">Contact us</Link>}.</p>
        </div>
      </div>
    </Interior>
  );
}
