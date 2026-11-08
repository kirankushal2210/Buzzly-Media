import type { Metadata } from "next";
import Link from "@/components/Link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use the Buzzly website.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: <p>These terms apply to your use of this website, operated by {legal.entityName}. By using the site you agree to them. They do not cover client engagements, which are governed by a separate written agreement.</p>,
  },
  {
    id: "content",
    title: "Our content",
    body: <>
      <p>The films, images, text, logos, and design on this site belong to Buzzly, its sub-companies, or the partners who allowed us to show their work. You may view and share links to the site, but you may not copy, reuse, or redistribute its content without our written permission.</p>
      <p>The Buzzly name and logo are our trademarks. Please see our <Link href="/logo">logo page</Link> for approved usage.</p>
    </>,
  },
  {
    id: "illustrative",
    title: "Illustrative work",
    body: <p>Some campaigns on this site are illustrative scenarios created to explain our process, and are labelled as such. Their figures (such as views or customer numbers) are examples, not results or guarantees.</p>,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: <ul>
      <li>Don’t use the site or contact form to send spam, malware, or unlawful content.</li>
      <li>Don’t try to disrupt, overload, scrape at scale, or gain unauthorised access to the site or its systems.</li>
      <li>Don’t submit someone else’s details through the contact form without their permission.</li>
    </ul>,
  },
  {
    id: "inquiries",
    title: "Inquiries",
    body: <p>Sending an inquiry does not create a client relationship or obligate either side. How we handle the information you send is described in our <Link href="/privacy">Privacy Policy</Link>.</p>,
  },
  {
    id: "links",
    title: "Links to other sites",
    body: <p>We may link to websites we don’t control. We aren’t responsible for their content or practices.</p>,
  },
  {
    id: "liability",
    title: "Disclaimer and liability",
    body: <p>The site is provided “as is”. We work to keep it accurate and available but can’t promise it will always be error-free or uninterrupted. To the extent the law allows, Buzzly is not liable for indirect or consequential loss arising from your use of the site. Nothing in these terms limits liability that cannot be limited by law.</p>,
  },
  {
    id: "law",
    title: "Governing law",
    body: <p>These terms are governed by the laws of {legal.jurisdiction ?? "the country where Buzzly is registered"}, and its courts have jurisdiction over any dispute about them.</p>,
  },
  {
    id: "changes",
    title: "Changes",
    body: <p>We may update these terms from time to time. The “last updated” date shows when they last changed.</p>,
  },
];

export default function Terms() {
  return <LegalPage eyebrow="BUZZLY / LEGAL" title="Terms of Use" intro="The ground rules for using this website." sections={sections} />;
}
