import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { InsightCta } from "@/components/InsightCta";
import { InteriorFooter } from "@/components/Interior";
import { InteriorHeader } from "@/components/InteriorHeader";
import { Badge, Button, SurfaceCard } from "@/components/ui/core";
import { formatPlaybookDate, playbookBySlug, playbooks } from "@/data/insights";
import { tierBySlug } from "@/lib/engagements";
import { JsonLd } from "@/components/JsonLd";
import { article, breadcrumbs } from "@/lib/structured-data";

export function generateStaticParams() {
  return playbooks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const playbook = playbookBySlug(slug);
  if (!playbook) notFound();
  return {
    title: playbook.title,
    description: playbook.subtitle,
    alternates: { canonical: `/insights/${slug}` },
    openGraph: { type: "article", title: playbook.title, description: playbook.subtitle, publishedTime: playbook.publishedAt },
  };
}

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = playbookBySlug(slug);
  if (!playbook) notFound();
  const tier = tierBySlug(playbook.recommendedScope);
  const others = playbooks.filter(item => item.slug !== slug);

  return (
    <div className="interior">
      <InteriorHeader />
      <JsonLd data={[article(playbook), breadcrumbs([{ name: "Insights", path: "/insights" }, { name: playbook.title, path: `/insights/${playbook.slug}` }])]} />
      <main id="top" className="playbook">
        <article className="playbook-column">
          <Link href="/insights" className="playbook-back">← All Playbooks</Link>
          <div className="playbook-meta">
            <Badge tone="accent">{playbook.category}</Badge>
            <span className="bz-mono">{playbook.readTime}</span>
            <span className="bz-mono"><time dateTime={playbook.publishedAt}>{formatPlaybookDate(playbook.publishedAt)}</time></span>
          </div>
          <h1>{playbook.title}</h1>
          <p className="playbook-subtitle">{playbook.subtitle}</p>

          <SurfaceCard as="aside" className="playbook-takeaways" aria-labelledby="takeaways-title">
            <h2 id="takeaways-title" className="bz-eyebrow">Key takeaways</h2>
            <ul>{playbook.keyTakeaways.map(item => <li key={item}>{item}</li>)}</ul>
          </SurfaceCard>

          <div className="playbook-body">
            {playbook.sections.map(section => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map(paragraph => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
                {section.callout && <blockquote>{section.callout}</blockquote>}
              </section>
            ))}
          </div>

          {tier && (
            <SurfaceCard as="aside" className="playbook-scope" aria-labelledby="scope-title">
              <span className="bz-mono">Recommended scope for this playbook</span>
              <h2 id="scope-title">{tier.name}</h2>
              <p>{tier.summary}</p>
              <Button href={`/contact?scope=${tier.slug}#lead-form`} variant="secondary">Select This Scope →</Button>
            </SurfaceCard>
          )}

          <InsightCta />

          <nav className="insight-next" aria-label="More playbooks">
            <span className="bz-mono">More playbooks</span>
            {others.map(item => <Link key={item.slug} href={`/insights/${item.slug}`}>{item.title} <span aria-hidden="true">↗</span></Link>)}
          </nav>
        </article>
      </main>
      <InteriorFooter />
    </div>
  );
}
