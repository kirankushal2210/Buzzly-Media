import Link from "@/components/Link";
import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";
import { TechStack } from "@/components/TechStack";
import { Button, SurfaceCard } from "@/components/ui/core";

export const metadata: Metadata = { alternates: { canonical: "/about" }, title: "About", description: "Buzzly is a technology-led company builder with content at its core: film direction, distribution strategy and web, AI and technology operations under one roof." };

const principles = [
  { title: "Distribution Over Decoration", copy: "Cinema-grade craft only works when engineered for watch-time retention and buyer conversion." },
  { title: "Tech Inside the Workflow", copy: "AI-assisted hook analysis, automated multi-channel publishing, and custom web funnels sit alongside cameras and scripts." },
  { title: "Skin in the Game", copy: "We build and scale our own ventures across Food, Healthcare, and Real Estate using the exact engine we deploy for partners." },
  { title: "Speed With Taste", copy: "High-output publishing cadences without sacrificing editorial restraint or brand clarity." },
];

const pods = [
  { name: "Brand & Film Direction", focus: "Positioning, scripts, shoots and the edit." },
  { name: "Distribution & Growth Strategy", focus: "Publishing cadence, platforms, and what gets pushed next." },
  { name: "Web, AI & Technology Operations", focus: "Landing pages, lead routing, hook analysis and automation." },
];

export default function About() {
  return (
    <Interior eyebrow="BUZZLY / ABOUT" title="We build brands through content." intro="Ours and everyone else’s.">
      <section className="about-manifesto"><span>WHAT BUZZLY IS ↗</span><p>A technology-led company builder with content at its core. We build our own businesses and help ambitious partners build the reach around theirs.</p></section>
      <section className="about-two-worlds" aria-label="How Buzzly builds"><div><span>01 / OUR SUB-COMPANIES</span><h2>We build<br /><em>our own.</em></h2><p>De Food Kampney, Buzzly Health, and Buzzly Properties are three distinct sub-companies founded, owned, and operated by Buzzly.</p><Link href="/companies">Explore Our Sub-Companies ↗</Link></div><div><span>02 / PARTNER WORK</span><h2>And help<br /><em>build yours.</em></h2><p>Strategy, content, and distribution for ambitious outside businesses ready to scale.</p><Link href="/services">Explore What We Do ↗</Link></div></section>
      <section className="about-filmstrip" aria-label="The Buzzly sub-companies in motion">{companies.map(c => <Link key={c.slug} href={`/companies/${c.slug}`} aria-label={`Explore ${c.name}`}><InViewVideo src={c.promo} poster={c.promoPoster} /><span>{c.name} ↗</span></Link>)}</section>

      <section className="builders" aria-labelledby="principles-title">
        <div className="builders-head">
          <p className="interior-eyebrow">BUZZLY / OPERATING PRINCIPLES</p>
          <h2 id="principles-title">How we<br /><em>actually work.</em></h2>
          <p>Four rules that decide what we make, how we make it, and what we refuse to make.</p>
        </div>
        <ol className="builders-principles">
          {principles.map((principle, index) => (
            <li key={principle.title}><span className="bz-mono">0{index + 1}</span><h3>{principle.title}</h3><p>{principle.copy}</p></li>
          ))}
        </ol>
      </section>

      <section className="studio" aria-labelledby="studio-title">
        <div className="builders-head">
          <p className="interior-eyebrow">INSIDE THE STUDIO / MULTIDISCIPLINARY TEAM</p>
          <h2 id="studio-title">Three pods.<br /><em>One roof.</em></h2>
          <p>Most brands hire a production house, a social agency and a web developer, then spend their week making them talk to each other. At Buzzly these three pods work as one team.</p>
        </div>
        <ul className="studio-pods">
          {pods.map((pod, index) => (
            <SurfaceCard as="li" key={pod.name} className="studio-pod">
              <span className="bz-mono">Pod 0{index + 1}</span>
              <h3>{pod.name}</h3>
              <p>{pod.focus}</p>
              {/* TODO: Swap in founder/team headshots and bios when ready */}
              <div className="studio-slot" aria-label="Team profile coming soon">
                <span className="studio-slot-photo" aria-hidden="true" />
                <span className="studio-slot-text">Team profile coming soon</span>
              </div>
            </SurfaceCard>
          ))}
        </ul>
      </section>

      <TechStack id="about-stack" />

      <section className="about-close"><span>BUZZLY / THE IDEA</span><h2>Make the brand.<br /><em>Make it seen.</em></h2><p>Content can give a business a story people understand. Distribution can help that story reach the people it is made for.</p>
        <div className="about-close-actions">
          <Button href="/contact" size="lg">Start a Project →</Button>
          <Button href="/services#readiness-audit" variant="ghost">Take the Free Content Readiness Audit</Button>
        </div>
      </section>
    </Interior>
  );
}
