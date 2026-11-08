import type { Metadata } from "next";
import Link from "@/components/Link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Buzzly collects, uses, and protects the information you share through this website.",
  alternates: { canonical: "/privacy" },
};

const contact = legal.privacyEmail
  ? <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
  : <Link href="/contact">our contact form</Link>;

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: <p>This website is operated by {legal.entityName} (“Buzzly”, “we”, “us”). We are responsible for the personal information collected through it. You can reach us about privacy at any time through {contact}.</p>,
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: <>
      <p>We only collect what you choose to send us and the minimum needed to run the site safely:</p>
      <ul>
        <li><strong>Contact form:</strong> your name, email address, company or brand (optional), the service you’re interested in, and your message.</li>
        <li><strong>Abuse prevention:</strong> a one-way, salted hash of your IP address and your browser’s user-agent string. We never store your raw IP address.</li>
        <li><strong>Server logs:</strong> our hosting provider processes standard request data (such as IP address, time, and page requested) to deliver and secure the site.</li>
      </ul>
      <p>We do not use advertising trackers, analytics cookies, or third-party marketing pixels. The site stores one value in your browser’s session storage so the intro animation only plays once per visit; it is never sent to us.</p>
    </>,
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: <ul>
      <li>To read and reply to your inquiry, and to send you a one-time confirmation that we received it.</li>
      <li>To prevent spam and abuse of the contact form, for example by limiting how many messages can be sent in a short time.</li>
      <li>To keep the website secure and working.</li>
    </ul>,
  },
  {
    id: "legal-basis",
    title: "Legal basis",
    body: <p>Where data-protection law requires a legal basis, we rely on your request (taking steps at your request before entering into a contract) to handle your inquiry, and on our legitimate interest in keeping the site and inbox free of abuse.</p>,
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: <>
      <p>We do not sell or rent your information. We share it only with service providers that process it on our behalf:</p>
      <ul>
        <li><strong>Cloudflare</strong> — website hosting, security, and the database that stores inquiries.</li>
        <li><strong>Resend</strong> — delivery of inquiry notifications and confirmation emails.</li>
      </ul>
      <p>These providers may process data outside your country under their own safeguards. We may also disclose information if the law requires it.</p>
    </>,
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: <p>We keep inquiries for up to {legal.inquiryRetention} after our last contact with you, unless we start working together, in which case they become part of our project records. Abuse-prevention data is only used for short time windows and is deleted along with the inquiry.</p>,
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: <p>Depending on where you live, you may have the right to access, correct, delete, or receive a copy of your personal information, and to object to or restrict how we use it. To make a request, contact us through {contact}. You can also complain to your local data-protection authority.</p>,
  },
  {
    id: "security",
    title: "Security",
    body: <p>Data is sent over encrypted connections (HTTPS), stored with our hosting provider, and only accessible to the people who need it to respond to you. No system is perfectly secure, but we take reasonable measures to protect your information.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>If we change how we handle personal information, we will update this page and the “last updated” date.</p>,
  },
];

export default function Privacy() {
  return <LegalPage eyebrow="BUZZLY / LEGAL" title="Privacy Policy" intro="What we collect, why we collect it, and the choices you have." sections={sections} />;
}
