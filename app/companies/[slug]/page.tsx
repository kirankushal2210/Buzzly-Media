/* eslint-disable @next/next/no-html-link-for-pages -- The deployed vinext Link handler throws on navigation; native anchors keep these routes usable. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";
export function generateStaticParams() { return companies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const company = companies.find(c => c.slug === slug); return { title: company?.name ?? "Company", description: company ? `${company.intro} Explore the company Buzzly is building through content and distribution.` : undefined }; }
export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find(c => c.slug === slug);
  if (!company) notFound();
  const others = companies.filter(c => c.slug !== slug);
  return (
    <Interior eyebrow={`BUZZLY COMPANY / ${company.field.toUpperCase()}`} title={company.name} intro={company.intro}>
      <section className="company-detail-film"><InViewVideo src={company.video} poster={company.poster} controls label={`${company.name} film`} /><span>BUZZLY / COMPANY FILM</span></section>
      <section className="company-detail-story"><span>WHAT WE’RE BUILDING</span><div><h2>Building the brand.<br /><em>Building the reach.</em></h2><p>{company.intro} Buzzly brings strategy, content, and distribution together to help this business connect with the people it is made for.</p></div></section>
      <section className="company-detail-next"><span>EXPLORE THE ECOSYSTEM</span>{others.map(c => <a key={c.slug} href={`/companies/${c.slug}`}>{c.name}<span>↗</span></a>)}<a className="company-detail-back" href="/companies">← All companies</a></section>
    </Interior>
  );
}
