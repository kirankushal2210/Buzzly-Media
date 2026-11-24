/**
 * schema.org builders for answer engines and AI search (AEO / GEO).
 * Every value comes from content already on the site: nothing here makes a
 * claim the page itself doesn't make.
 */
import { siteUrl } from "@/lib/site";
import type { Company } from "@/lib/content";
import type { Playbook } from "@/data/insights";
import type { OpenRole } from "@/lib/careers";

const org = { "@id": `${siteUrl}/#organization` };
const abs = (path: string) => `${siteUrl}${path}`;

export type QA = { question: string; answer: string };

export const faqPage = (path: string, items: QA[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${abs(path)}#faq`,
  mainEntity: items.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "" }, ...trail].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: abs(crumb.path),
  })),
});

export const serviceCatalog = (services: { title: string; copy: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${abs("/services")}#services`,
  name: "Buzzly services",
  itemListElement: services.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: service.title,
      description: service.copy,
      provider: org,
      areaServed: "IN",
      url: abs("/services"),
    },
  })),
});

export const article = (playbook: Playbook) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${abs(`/insights/${playbook.slug}`)}#article`,
  headline: playbook.title,
  description: playbook.subtitle,
  datePublished: playbook.publishedAt,
  dateModified: playbook.publishedAt,
  articleSection: playbook.category,
  author: org,
  publisher: org,
  mainEntityOfPage: abs(`/insights/${playbook.slug}`),
  image: abs("/opengraph-image"),
  inLanguage: "en",
});

export const subCompany = (company: Company) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${abs(`/companies/${company.slug}`)}#organization`,
  name: company.name,
  description: company.intro,
  url: abs(`/companies/${company.slug}`),
  parentOrganization: org,
  knowsAbout: company.field,
});

/** Google for Jobs: emitted only for roles that are really open (see lib/careers.ts). */
export const jobPosting = (role: OpenRole) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: role.title,
  description: [role.summary, ...role.responsibilities, ...role.lookingFor].map(line => `<p>${line}</p>`).join(""),
  datePosted: role.datePosted,
  employmentType: { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Contract: "CONTRACTOR", Internship: "INTERN" }[role.type],
  hiringOrganization: { "@type": "Organization", name: "Buzzly", sameAs: siteUrl },
  jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: role.location, addressCountry: "IN" } },
  url: abs(`/careers#role-${role.slug}`),
});
