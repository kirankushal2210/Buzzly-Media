import type { MetadataRoute } from "next";
import { companies } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") =>
    ({ url: `${siteUrl}${path}`, lastModified, changeFrequency, priority });

  return [
    page("", 1, "weekly"),
    page("/work", 0.9, "weekly"),
    ...caseStudies.map(study => page(`/work/${study.slug}`, 0.8)),
    page("/clients", 0.8),
    page("/services", 0.8),
    page("/about", 0.7),
    page("/companies", 0.7),
    ...companies.map(company => page(`/companies/${company.slug}`, 0.6)),
    page("/contact", 0.9),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
