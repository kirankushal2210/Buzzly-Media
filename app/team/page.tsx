import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { TeamCrew } from "@/components/team/TeamCrew";
import { openRoles } from "@/lib/careers";

export const metadata: Metadata = {
  alternates: { canonical: "/team" },
  title: "Team",
  description: "The people behind Buzzly: brand and film direction, distribution and growth strategy, and web, AI and technology operations under one roof.",
};

export default function Team() {
  const roles = openRoles.length;
  return (
    <Interior eyebrow="BUZZLY / TEAM" title="The people behind the work." intro="Three pods, one roof. The people who direct the films, run the channels and build the technology behind every brand we grow.">
      <section className="team-section" aria-label="Buzzly team by pod">
        <TeamCrew />
      </section>

      <section className="team-join">
        <p className="interior-eyebrow">BUZZLY / JOIN US</p>
        <h2>Want your name<br /><em>on this page?</em></h2>
        <p>{roles ? `We’re hiring for ${roles} ${roles === 1 ? "role" : "roles"} right now.` : "Nothing is open right now, but we read every open application."}</p>
        <div className="team-join-actions">
          <Link className="cta" href="/careers#open-roles">{roles ? "See open roles ↗" : "See careers ↗"}</Link>
          <Link className="outlinecta" href="/careers#apply">Apply now</Link>
        </div>
      </section>
    </Interior>
  );
}
