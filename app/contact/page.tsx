import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { ContactForm } from "@/components/ContactForm";
import { FaqSection } from "@/components/FaqSection";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: "Start a conversation with Buzzly about content, social media, brand strategy, or distribution.",
};

export default function Contact() {
  const whatsappHref = whatsappLink();
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
              Share your business, audience, and goals. We will use these details only to respond to your inquiry. See our{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            <div className="contact-direct-actions">
              <h3>Fast-track your project</h3>
              <p>{whatsappHref ? "Prefer an intro call or direct messaging? Connect with our team directly:" : "Prefer an intro call? Book time with our team directly:"}</p>

              <a
                className="contact-direct-btn is-calendar"
                href="https://cal.com/buzzlymedia"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule a 15-Minute Intro Call ↗
              </a>

              {whatsappHref && (
                <a
                  className="contact-direct-btn is-whatsapp"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp ↗
                </a>
              )}

              <div className="contact-trust-badge">
                <span className="contact-trust-dot" aria-hidden="true" />
                <span>Creative directors reply within 24–48 business hours</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <FaqSection title="Common Questions Before You Reach Out" />
    </Interior>
  );
}
