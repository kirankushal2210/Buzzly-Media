import Link from "@/components/Link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { caseStudies } from "@/lib/work";
import { InViewVideo } from "@/components/InViewVideo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs, subCompany } from "@/lib/structured-data";
export function generateStaticParams() { return companies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const company = companies.find(c => c.slug === slug); return { title: company ? `${company.name} · Buzzly sub-company` : "Sub-company", alternates: { canonical: `/companies/${slug}` }, description: company?.intro }; }
export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find(c => c.slug === slug);
  if (!company) notFound();
  const others = companies.filter(c => c.slug !== slug);
  const hasStudy = caseStudies.some(study => study.slug === slug);
  return (
    <Interior eyebrow={`BUZZLY SUB-COMPANY / ${company.field.toUpperCase()}`} title={company.name} intro={company.intro}>
      <JsonLd data={[subCompany(company), breadcrumbs([{ name: "Our sub-companies", path: "/companies" }, { name: company.name, path: `/companies/${company.slug}` }])]} />
      <section className="company-detail-film"><InViewVideo src={company.promo} poster={company.promoPoster} controls label={`${company.name} promo`} /><span>BUZZLY / SUB-COMPANY FILM</span></section>
      <section className="company-detail-story"><span>WHAT WE’RE BUILDING</span><div><h2>Building the brand.<br /><em>Building the reach.</em></h2><p>{company.intro} Buzzly Media brings strategy, content, and distribution together to power this internal venture and connect it with the audience it is made for.</p></div></section>
      <section className="company-detail-how" aria-labelledby="company-how-title">
        <span>HOW BUZZLY BUILDS IT</span>
        <div>
          <h2 id="company-how-title">One team, three pods.</h2>
          <ul>
            <li><strong>Brand &amp; film direction:</strong> positioning, scripts, shoots and the edit for {company.name}.</li>
            <li><strong>Distribution &amp; growth:</strong> the publishing rhythm, the platforms, and what gets pushed next.</li>
            <li><strong>Web, AI &amp; technology:</strong> the pages, lead routing and automation behind the brand.</li>
          </ul>
          <p>{hasStudy && <><Link href={`/work/${company.slug}`}>Read the {company.name} case study ↗</Link> </>}<Link href="/services">Get the same engine for your brand ↗</Link></p>
        </div>
      </section>
      <section className="company-detail-next"><span>EXPLORE OUR SUB-COMPANIES</span>{others.map(c => <Link key={c.slug} href={`/companies/${c.slug}`}>{c.name}<span>↗</span></Link>)}<Link className="company-detail-back" href="/companies">← All sub-companies</Link></section>
    </Interior>
  );
}
