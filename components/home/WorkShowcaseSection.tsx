"use client";

import { useRef } from "react";
import Link from "@/components/Link";
import { HoverPreviewVideo, type HoverPreviewHandle } from "@/components/HoverPreviewVideo";
import { Reveal } from "@/components/Reveal";
import { useInViewOnce } from "@/hooks/use-in-view";
import { caseStudies, type CaseStudy } from "@/lib/work";

function ShowcaseCard({ study, index }: { study: CaseStudy; index: number }) {
  const preview = useRef<HoverPreviewHandle>(null);
  const [ref, arrived] = useInViewOnce<HTMLElement>(0.1);
  return (
    <article ref={ref} className={`showcase-card${arrived ? " arrived" : ""}`} style={{ ["--accent" as string]: study.accent }}>
      <Link
        href={`/work/${study.slug}`}
        onMouseEnter={() => preview.current?.start()}
        onMouseLeave={() => preview.current?.stop()}
        onFocus={() => preview.current?.start()}
        onBlur={() => preview.current?.stop()}
      >
        <span className="showcase-media">
          <HoverPreviewVideo ref={preview} src={study.video} poster={study.poster} alt="" />
          <span className="showcase-index" aria-hidden="true">0{index + 1}</span>
          <span className="showcase-play" aria-hidden="true">Hover to preview ▶</span>
          {study.illustrative && <span className="showcase-flag">Illustrative</span>}
        </span>
        <span className="showcase-body">
          <span className="showcase-tags">
            <span className="showcase-tag is-category">{study.categoryLabel}</span>
            {study.services.slice(0, 2).map(service => <span className="showcase-tag" key={service}>{service}</span>)}
            <span className="showcase-tag">{study.year}</span>
          </span>
          <strong>{study.client}</strong>
          <span className="showcase-title">{study.title}</span>
        </span>
      </Link>
    </article>
  );
}

/** Recent campaigns and company work, with hover video previews and metadata tags. */
export function WorkShowcaseSection() {
  return (
    <section id="work" className="wrap showcase" aria-labelledby="showcase-title">
      <Reveal as="div" className="workhead">
        <div><p className="eyebrow">BUZZLY / RECENT WORK</p><h2 className="workheading" id="showcase-title">Work in<br /><em>motion.</em></h2></div>
        <div className="work-intro">
          <span className="work-count">0{caseStudies.length}<span>↗</span></span>
          <p>Films, brands, and campaigns from the sub-companies we own and build, and the outside partners we build with.</p>
        </div>
      </Reveal>
      <div className="showcase-grid">
        {caseStudies.map((study, index) => <ShowcaseCard key={study.slug} study={study} index={index} />)}
      </div>
      <div className="showcase-footer">
        <span>FOOD / HEALTH / REAL ESTATE</span>
        <Link className="outlinecta" href="/work">See all work ↗</Link>
      </div>
    </section>
  );
}
