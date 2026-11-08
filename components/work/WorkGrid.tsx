"use client";

import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { InViewVideo } from "@/components/InViewVideo";
import { caseStudies, isCategory, workCategories, type WorkCategory } from "@/lib/work";

/**
 * Filterable case-study grid. Filtering is instant on the client; the active
 * category is mirrored to `?category=` so filtered views can be shared, and the
 * server renders the same view for that URL.
 */
export function WorkGrid({ initialCategory }: { initialCategory: WorkCategory | "all" }) {
  const [active, setActive] = useState<WorkCategory | "all">(initialCategory);
  const visible = active === "all" ? caseStudies : caseStudies.filter(study => study.category === active);

  // Keep state in sync when the user moves through history.
  useEffect(() => {
    const onPop = () => {
      const param = new URLSearchParams(window.location.search).get("category");
      setActive(isCategory(param) ? param : "all");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const select = (id: WorkCategory | "all") => {
    setActive(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("category"); else url.searchParams.set("category", id);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
  };

  return (
    <>
      <div className="work-filters" role="group" aria-label="Filter case studies">
        <span>FILTER BY</span>
        {workCategories.map(category => {
          const count = category.id === "all" ? caseStudies.length : caseStudies.filter(s => s.category === category.id).length;
          return (
            <button key={category.id} type="button" className="work-filter" aria-pressed={active === category.id} onClick={() => select(category.id)}>
              {category.label}<small>{count}</small>
            </button>
          );
        })}
      </div>
      <section className="work-list" aria-live="polite" aria-label="Case studies">
        {visible.length === 0 && <p className="work-empty">No case studies in this category yet.</p>}
        {visible.map(study => (
          <article className="work-card" key={`${active}-${study.slug}`}>
            <Link href={`/work/${study.slug}`} aria-label={`Read the ${study.client} case study`}>
              <div className="work-card-media">
                <InViewVideo src={study.video} poster={study.poster} />
                <span className="work-card-tag">{study.categoryLabel}</span>
                {study.illustrative && <span className="work-card-flag">Illustrative</span>}
              </div>
              <div className="work-card-body">
                <div>
                  <h2>{study.client}</h2>
                  <p>{study.summary}</p>
                  <small>{study.services.slice(0, 3).join(" · ")}</small>
                </div>
                <span className="work-card-arrow" aria-hidden="true">↗</span>
              </div>
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
