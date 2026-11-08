"use client";

/* eslint-disable @next/next/no-img-element -- static poster frames from /public/media */
import { Tabs } from "radix-ui";
import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { companies } from "@/lib/content";

type Node = {
  id: string;
  label: string;
  kicker: string;
  title: string;
  copy: string;
  gives: string[];
  gets: string[];
  image: string;
  href: string;
  cta: string;
  accent: string;
};

const nodes: Node[] = [
  ...companies.map(company => ({
    id: company.slug,
    label: company.name,
    kicker: `Buzzly company / ${company.field}`,
    title: company.word,
    copy: company.intro,
    gives: ["Real-world proof of what content can build", "A testing ground for formats and channels"],
    gets: ["Brand strategy and identity", "Films, reels, and social content", "Distribution and audience growth"],
    image: company.poster,
    href: `/companies/${company.slug}`,
    cta: `Explore ${company.name}`,
    accent: company.accent,
  })),
  {
    id: "partners",
    label: "Partner brands",
    kicker: "Partner distribution model",
    title: "Your brand, same engine.",
    copy: "Everything we learn building our own companies goes into the work we do for ambitious partners: the same strategy, production, and distribution, pointed at your goals.",
    gives: ["A brief and a business goal", "Access to the product, place, and people"],
    gets: ["The playbook proven on Buzzly’s own companies", "A content team that plans, films, edits, and publishes", "Distribution that keeps building reach"],
    image: "/media/buzzly-cafe-story-poster.jpg",
    href: "/services",
    cta: "See how we work with partners",
    accent: "#ef342d",
  },
];

/** Interactive map of the Buzzly ecosystem: three owned companies plus the partner model, sharing one content engine. */
export function EcosystemSection() {
  return (
    <Reveal className="ecosystem wrap" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="ecosystem-title">
        <p className="eyebrow">THE BUZZLY ECOSYSTEM</p>
        <h2 id="ecosystem-title">Inside<br />Buzzly.</h2>
        <p className="ecosystem-lede">One content engine—strategy, production, distribution—powering our own companies and the partners we build with.</p>
      </div>
      <Tabs.Root className="eco-tabs" defaultValue={nodes[0].id}>
        <Tabs.List className="eco-tablist" aria-label="Parts of the Buzzly ecosystem">
          {nodes.map((node, index) => (
            <Tabs.Trigger key={node.id} value={node.id} className="eco-tab" style={{ ["--accent" as string]: node.accent }}>
              <span>0{index + 1}</span>{node.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {nodes.map(node => (
          <Tabs.Content key={node.id} value={node.id} className="eco-panel" style={{ ["--accent" as string]: node.accent }}>
            <div className="eco-panel-media"><img src={node.image} alt="" loading="lazy" /><span>{node.kicker}</span></div>
            <div className="eco-panel-copy">
              <h3>{node.title}</h3>
              <p>{node.copy}</p>
              <div className="eco-flow" aria-label="How value moves">
                <div><small>Brings to the ecosystem</small><ul>{node.gives.map(item => <li key={item}>{item}</li>)}</ul></div>
                <span className="eco-flow-arrow" aria-hidden="true">⇄</span>
                <div><small>Gets from Buzzly</small><ul>{node.gets.map(item => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <Link className="plain" href={node.href}>{node.cta} ↗</Link>
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Reveal>
  );
}
