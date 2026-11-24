import { companies, services } from "@/lib/content";
import { engagementTiers } from "@/lib/engagements";
import { playbooks } from "@/data/insights";
import { faqs } from "@/components/home/LandingSections";
import { siteDescription, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-Markdown summary of Buzzly for AI assistants and answer
 * engines (https://llmstxt.org). Built from the same data as the pages, so it
 * never says anything the site doesn't. Sample client stories are left out.
 */
export function GET() {
  const url = (path: string) => `${siteUrl}${path}`;
  const lines = [
    "# Buzzly (Buzzly Media)",
    "",
    `> ${siteDescription} Based in Hyderabad, Telangana, India.`,
    "",
    "Buzzly brings strategy, content production, social media and distribution under one roof, with web, AI and technology built into the workflow. It builds and runs its own sub-companies with the same approach it offers to outside brands.",
    "",
    "## Services",
    ...services.map(service => `- **${service.title}:** ${service.copy}`),
    "",
    "## Engagement options",
    ...engagementTiers.map(tier => `- **${tier.name}:** ${tier.summary}`),
    `- Details: [Services](${url("/services")})`,
    "",
    "## Sub-companies (owned and operated by Buzzly, not clients)",
    ...companies.map(company => `- [${company.name}](${url(`/companies/${company.slug}`)}): ${company.field}. ${company.intro}`),
    "",
    "## Frequently asked questions",
    ...faqs.flatMap(item => [`### ${item.question}`, item.answer, ""]),
    "## Insights",
    ...playbooks.map(playbook => `- [${playbook.title}](${url(`/insights/${playbook.slug}`)}): ${playbook.subtitle}`),
    "",
    "## Key pages",
    `- [Home](${url("")}): what Buzzly does and how it works`,
    `- [Services](${url("/services")})`,
    `- [Work](${url("/work")})`,
    `- [About](${url("/about")})`,
    `- [Team](${url("/team")})`,
    `- [Careers](${url("/careers")}): open roles and applications`,
    `- [Contact](${url("/contact")}): start a project`,
    "",
    "## Contact",
    `Start a project through the form at ${url("/contact")}. A person from the team replies to every inquiry.`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
