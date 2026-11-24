import type { Metadata } from "next";
import Link from "@/components/Link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "The refund, cancellation, and engagement policies of Buzzly Media.",
  alternates: { canonical: "/refund" },
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview & Scope",
    body: (
      <p>
        This Refund and Cancellation Policy governs the creative production and consulting services provided by {legal.entityName} (&ldquo;Buzzly Media&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), located in Hyderabad, Telangana, India.
      </p>
    ),
  },
  {
    id: "service-engagements",
    title: "2. Retained Services & Custom Production",
    body: (
      <>
        <p>
          Formal client engagements (including monthly content engine retainers, on-location video shoots, post-production sprints, and funnel architectures) are executed under signed Master Service Agreements (MSAs) and detailed Statements of Work (SOWs).
        </p>
        <p>
          Due to the tailored, non-recoverable allocation of creative directors, scriptwriters, camera crews, studio equipment, and post-production suites:
        </p>
        <ul>
          <li><strong>Work Completed in Good Faith:</strong> Hours, creative assets, and production sprints completed prior to cancellation are non-refundable.</li>
          <li><strong>Pre-Production Cancellation:</strong> Cancellations received in writing at least 7 business days prior to scheduled shoot dates are eligible for a refund of uncommitted production advance funds.</li>
          <li><strong>Post-Commencement Cancellation:</strong> Once filming, retention editing, or bespoke funnel build-outs have begun, fees allocated to that billing cycle remain billable and non-refundable.</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "3. Performance & Outcomes Disclaimer",
    body: (
      <p>
        While our frameworks are engineered for high retention and conversion, organic reach, lead volume, and revenue outcomes naturally vary based on your industry, market dynamics, sales offer strength, and media spend. No specific revenue number or vanity metric is guaranteed as an absolute result.
      </p>
    ),
  },
  {
    id: "contact",
    title: "4. Contact & Inquiries",
    body: (
      <p>
        If you have questions regarding this policy or wish to discuss an active agreement, please contact our team directly through our <Link href="/contact">contact page</Link> or via WhatsApp.
      </p>
    ),
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="LEGAL / REVISION 2026"
      title="Refund &amp; Cancellation Policy"
      intro="Our transparent policy governing service agreements, creative production, and client engagement."
      sections={sections}
    />
  );
}
