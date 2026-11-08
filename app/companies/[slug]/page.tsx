import Link from "@/components/Link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";
export function generateStaticParams() { return companies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const company = companies.find(c => c.slug === slug); return { title: company ? `${company.name} · Buzzly sub-company` : "Sub-company", alternates: { canonical: `/companies/${slug}` }, description: company?.intro }; }
export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find(c => c.slug === slug);
  if (!company) notFound();
  const others = companies.filter(c => c.slug !== slug);
  return (
    <Interior eyebrow={`BUZZLY SUB-COMPANY / ${company.field.toUpperCase()}`} title={company.name} intro={company.intro}>
      <section className="company-detail-film"><InViewVideo src={company.video} poster={company.poster} controls label={`${company.name} film`} /><span>BUZZLY / SUB-COMPANY FILM</span></section>
      <section className="company-detail-story"><span>WHAT WE’RE BUILDING</span><div><h2>Building the brand.<br /><em>Building the reach.</em></h2><p>{company.intro} Buzzly Media brings strategy, content, and distribution together to power this internal venture and connect it with the audience it is made for.</p></div></section>
      <section className="company-detail-next"><span>EXPLORE OUR SUB-COMPANIES</span>{others.map(c => <Link key={c.slug} href={`/companies/${c.slug}`}>{c.name}<span>↗</span></Link>)}<Link className="company-detail-back" href="/companies">← All sub-companies</Link></section>
    </Interior>
  );
}
