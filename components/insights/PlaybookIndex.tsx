"use client";

import { useState } from "react";
import Link from "@/components/Link";
import { Badge, SurfaceCard } from "@/components/ui/core";
import { PLAYBOOK_CATEGORIES, type PlaybookCategory } from "@/data/insights";

export type PlaybookCard = { slug: string; title: string; subtitle: string; category: PlaybookCategory; readTime: string };

type Filter = "All" | PlaybookCategory;

/** Playbook cards with a client-side category filter. The full list is server-rendered; filtering only hides cards. */
export function PlaybookIndex({ items }: { items: PlaybookCard[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = ["All", ...PLAYBOOK_CATEGORIES];
  const shown = filter === "All" ? items : items.filter(item => item.category === filter);

  return (
    <>
      <div className="playbook-filters" role="group" aria-label="Filter playbooks by category">
        {filters.map(value => (
          <button key={value} type="button" className="filter-pill" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? "playbook" : "playbooks"} shown</p>
      <ul className="playbook-grid">
        {shown.map(item => (
          <li key={item.slug}>
            <SurfaceCard as="article" className="playbook-card">
              <div className="playbook-card-meta">
                <Badge tone="accent">{item.category}</Badge>
                <span className="bz-mono">{item.readTime}</span>
              </div>
              <h2><Link href={`/insights/${item.slug}`} className="playbook-card-link">{item.title}</Link></h2>
              <p>{item.subtitle}</p>
              <span className="playbook-card-cta" aria-hidden="true">Read Playbook →</span>
            </SurfaceCard>
          </li>
        ))}
      </ul>
    </>
  );
}
