import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Interior } from "@/components/Interior";
import { InViewVideo } from "@/components/InViewVideo";
import { caseStudies, getCaseStudy } from "@/lib/work";

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case study" };
  return {
    title: `${study.client} case study`,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { title: `${study.client} — ${study.title}`, description: study.summary, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  const index = caseStudies.findIndex(s => s.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <Interior eyebrow={`BUZZLY / CASE STUDY / ${study.categoryLabel.toUpperCase()}`} title={study.title} intro={study.summary}>
      <section className="case-meta" aria-label="Project details">
        <div><span>CLIENT</span><p>{study.client}</p></div>
        <div><span>WHAT WE DID</span><p>{study.services.join(" · ")}</p></div>
        <div><span>YEAR</span><p>{study.year}</p></div>
      </section>

      <section className="case-film">
        <InViewVideo src={study.video} poster={study.poster} controls label={`${study.client} film`} />
        {study.illustrative && (
          <p className="case-notice"><b>ILLUSTRATIVE CAMPAIGN.</b> This story shows Buzzly’s process. Its numbers are a possible outcome, not client results or a guarantee.</p>
        )}
      </section>

      <section className="case-chapter">
        <span>01 / THE PROBLEM</span>
        <div><h2>What needed <em>to change.</em></h2><p>{study.problem}</p></div>
      </section>

      <section className="case-chapter">
        <span>02 / THE SOLUTION</span>
        <div>
          <h2>How we <em>built it.</em></h2>
          <ol className="case-steps">{study.solution.map(step => <li key={step}>{step}</li>)}</ol>
        </div>
      </section>

      <section className="case-chapter" style={{ ["--accent" as string]: study.accent }}>
        <span>03 / THE RESULTS</span>
        <div>
          <h2>Where it <em>landed.</em></h2>
          <p>{study.results}</p>
          <div className="case-stats">
            {study.stats.map(stat => (
              <div className="case-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}{study.illustrative ? " · illustrative" : ""}</span></div>
            ))}
          </div>
        </div>
      </section>

      <nav className="case-next" aria-label="More work">
        <div>
          <span>NEXT CASE STUDY</span>
          <Link className="case-next-title" href={`/work/${next.slug}`}>{next.client} ↗</Link>
        </div>
        <div className="case-next-actions">
          <Link className="outlinecta" href="/work">← All work</Link>
          <Link className="cta" href="/contact">Start a Project</Link>
        </div>
      </nav>
    </Interior>
  );
}
