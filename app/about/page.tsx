/* eslint-disable @next/next/no-html-link-for-pages -- The deployed vinext Link handler throws on navigation; native anchors keep these routes usable. */
import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { companies } from "@/lib/content";
import { InViewVideo } from "@/components/InViewVideo";

export const metadata: Metadata = { title: "About", description: "Buzzly is a technology-led company builder with content at its core. Meet the businesses we build and how we help partners grow their reach." };

export default function About() {
  return (
    <Interior eyebrow="BUZZLY / ABOUT" title="We build brands through content." intro="Ours and everyone else’s.">
      <section className="about-manifesto"><span>WHAT BUZZLY IS ↗</span><p>A technology-led company builder with content at its core. We build our own businesses and help ambitious partners build the reach around theirs.</p></section>
      <section className="about-two-worlds" aria-label="How Buzzly builds"><div><span>01 / OUR COMPANIES</span><h2>We build<br /><em>our own.</em></h2><p>De Food Kampney, Buzzly Health, and Buzzly Properties are three distinct businesses we are building.</p><a href="/companies">Explore Our Companies ↗</a></div><div><span>02 / PARTNER WORK</span><h2>And help<br /><em>build yours.</em></h2><p>Strategy, content, social media, and distribution for ambitious businesses ready to grow their brand and reach.</p><a href="/services">Explore What We Do ↗</a></div></section>
      <section className="about-filmstrip" aria-label="The Buzzly companies in motion">{companies.map(c => <a key={c.slug} href={`/companies/${c.slug}`} aria-label={`Explore ${c.name}`}><InViewVideo src={c.video} poster={c.poster} /><span>{c.name} ↗</span></a>)}</section>
      <section className="about-close"><span>BUZZLY / THE IDEA</span><h2>Make the brand.<br /><em>Make it seen.</em></h2><p>Content can give a business a story people understand. Distribution can help that story reach the people it is made for.</p><a href="/contact">Start a Project ↗</a></section>
    </Interior>
  );
}
