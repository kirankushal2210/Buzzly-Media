import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { LeadFaq } from "@/components/LeadFaq";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: "Start a conversation with Buzzly about content, social media, brand strategy, or distribution.",
};

export default function Contact() {
  return (
    <Interior
      eyebrow="BUZZLY / START A PROJECT"
      title="Let’s build something."
      intro="Tell us what you are building and what you want content to help you achieve."
    >
      <section className="interior-content">
        <div className="contact-grid">
          <div>
            <h2>Start the conversation.</h2>
            <p>
              Tell us a little about your brand and what you want content to do for it. We read every message and reply personally. We use these details only to respond to your inquiry. See our{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
            <p>Not sure which scope fits? <Link href="/services#readiness-audit">Get your Content Engine Score</Link> or <Link href="/services">compare the three tiers</Link>.</p>
          </div>
          <div id="lead-form" className="contact-lead-form">
            <ContactForm />
          </div>
        </div>
      </section>

      <LeadFaq />
    </Interior>
  );
}
