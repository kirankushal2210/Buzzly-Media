import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { ContactForm } from "@/components/ContactForm";
export const metadata: Metadata = { alternates: { canonical: "/contact" }, title: "Contact", description: "Start a conversation with Buzzly about content, social media, brand strategy, or distribution." };
export default function Contact() { return <Interior eyebrow="BUZZLY / START A PROJECT" title="Let’s build something." intro="Tell us what you are building and what you want content to help you achieve."><section className="interior-content"><div className="contact-grid"><div><h2>Start the conversation.</h2><p>Share your business, audience, and goals. We will use these details only to respond to your inquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p></div><ContactForm /></div></section></Interior>; }
