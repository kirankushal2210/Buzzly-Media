import type { ReactNode } from "react";
import Link from "@/components/Link";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

/**
 * The landing page's own contact section. Every "Start a Project" / "Let's
 * Connect" on the homepage scrolls here instead of opening another page.
 * Uses the same working form as before (POST /api/contact → email via Resend).
 */
export function HomeContact({
  eyebrow = "BUZZLY / START A PROJECT",
  title = <>Let’s build<br /><em>something.</em></>,
  copy = "Tell us what you are building and what you want content to help you achieve.",
}: { eyebrow?: string; title?: ReactNode; copy?: string } = {}) {
  return (
    <Reveal className="homecontact wrap" id="start-project" aria-labelledby="homecontact-title">
      <div className="homecontact-lead">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="homecontact-title">{title}</h2>
        <p>{copy}</p>
        <p className="homecontact-privacy">We use these details only to respond to your inquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
      </div>
      <ContactForm />
    </Reveal>
  );
}
