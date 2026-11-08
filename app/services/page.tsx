import Link from "@/components/Link";
import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { InViewVideo } from "@/components/InViewVideo";

export const metadata: Metadata = { alternates: { canonical: "/services" }, title: "Services", description: "Explore Buzzly's approach to brand strategy, content, social media, and distribution." };

const steps = [
  { number: "01", title: "Find the idea.", copy: "We learn what the business wants to build, who it needs to reach, and what should make people care." },
  { number: "02", title: "Shape the story.", copy: "We turn that direction into a clear content plan: themes, scripts, formats, and a visual language for the brand." },
  { number: "03", title: "Make it visible.", copy: "Reels, films, images, and words give the brand a form people can see, understand, and remember." },
  { number: "04", title: "Help it travel.", copy: "Publishing, social channels, search-aware content, and planned campaigns help that work reach the right audience." },
  { number: "05", title: "Learn and build.", copy: "We look at what people respond to, refine the content, and keep building the brand’s distribution over time." },
];

export default function Services() {
  return (
    <Interior eyebrow="BUZZLY / WHAT WE DO" title="We know what moves brands." intro="Strategy, content, social media, and distribution work together to help brands earn attention and build lasting reach.">
      <section className="services-banner" aria-label="Buzzly services"><span>CONTENT</span><span>SOCIAL</span><span>DISTRIBUTION</span></section>
      <section className="services-story">
        <div className="services-story-lead"><span className="interior-eyebrow">HOW IT MOVES / 01 — 05</span><h2>From the first conversation to the next chapter.</h2><p>Every brand starts with a different challenge. This is how Buzzly turns an idea into content and helps it find an audience.</p><Link href="/contact">Start a Project ↗</Link></div>
        <div className="services-steps">{steps.map(step => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
      </section>
      <section className="services-film"><div><InViewVideo src="/media/buzzly-cafe-story.mp4" poster="/media/buzzly-cafe-story-poster.jpg" /><span>ILLUSTRATIVE CAMPAIGN / NOT A CLIENT RESULT</span></div><p>Ideas become stories.<br /><em>Stories find people.</em></p></section>
    </Interior>
  );
}
