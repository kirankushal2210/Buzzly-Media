import type { Metadata } from "next";
import Link from "@/components/Link";
import { Interior } from "@/components/Interior";
import { careerAreas, hiringSteps, openRoles, whyBuzzly } from "@/lib/careers";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { ApplyButton } from "@/components/careers/ApplyButton";
import { TeamCrew } from "@/components/team/TeamCrew";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs, jobPosting } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/careers" },
  title: "Careers at Buzzly: Content, Social and Tech",
  description: "Work at Buzzly in content, social, strategy, distribution or technology, on the brands we own and the partners we grow. See open roles or apply.",
};

export default function Careers() {
  const hasRoles = openRoles.length > 0;
  return (
    <Interior eyebrow="BUZZLY / CAREERS" title="Build brands with us." intro="We build our own sub-companies and help ambitious partners grow theirs. If you make content, run channels, shape strategy or build the technology behind it, we would like to hear from you.">
      <JsonLd data={[breadcrumbs([{ name: "Careers", path: "/careers" }]), ...openRoles.map(jobPosting)]} />
      <section className="careers-manifesto"><span>WHO WE LOOK FOR ↗</span><p>People who would rather build a brand than talk about one.</p></section>

      <section className="careers-why" aria-labelledby="careers-why-heading">
        <span id="careers-why-heading">WHY BUZZLY</span>
        <div className="careers-why-grid">
          {whyBuzzly.map(item => <div key={item.title}><h2>{item.title}</h2><p>{item.copy}</p></div>)}
        </div>
      </section>

      <section className="careers-areas" aria-labelledby="careers-areas-heading">
        <h2 id="careers-areas-heading">Where you could fit.</h2>
        <div className="interior-list">
          {careerAreas.map(area => <article key={area.number}><span>{area.number}</span><h2>{area.title}</h2><p>{area.copy}</p></article>)}
        </div>
      </section>

      <section className="careers-roles" id="open-roles" aria-labelledby="careers-roles-heading">
        <span>OPEN ROLES</span>
        <h2 id="careers-roles-heading">{hasRoles ? `${openRoles.length} open ${openRoles.length === 1 ? "role" : "roles"}.` : "Nothing open right now."}</h2>
        {hasRoles ? openRoles.map(role => (
          <article className="careers-role" key={role.slug} id={`role-${role.slug}`}>
            <div>
              <h3>{role.title}</h3>
              <div className="careers-role-meta"><span>{role.team}</span><span>{role.location}</span><span>{role.type}</span></div>
            </div>
            <div>
              <p>{role.summary}</p>
              <h4>What you will do</h4>
              <ul>{role.responsibilities.map(item => <li key={item}>{item}</li>)}</ul>
              <h4>What we are looking for</h4>
              <ul>{role.lookingFor.map(item => <li key={item}>{item}</li>)}</ul>
              <ApplyButton role={role.title}>Apply for this role ↗</ApplyButton>
            </div>
          </article>
        )) : (
          <div className="careers-empty">
            <div>
              <h3>We still read <em>every</em> open application.</h3>
              <p>Tell us what you make, link to work you are proud of, and say which of the areas above fits you. When a role opens that matches, you will be the first we write to.</p>
            </div>
            <div><ApplyButton role="Open application">Send an open application ↗</ApplyButton></div>
          </div>
        )}
      </section>

      <section className="careers-team" id="team" aria-labelledby="careers-team-heading">
        <div className="careers-team-head">
          <span id="careers-team-heading">THE TEAM</span>
          <Link href="/team">Meet the whole team ↗</Link>
        </div>
        <TeamCrew />
      </section>

      <section className="careers-steps" aria-labelledby="careers-steps-heading">
        <span id="careers-steps-heading">HOW IT WORKS</span>
        <ol>
          {hiringSteps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.copy}</p></li>)}
        </ol>
      </section>

      <section className="careers-apply" id="apply" aria-labelledby="careers-apply-heading">
        <div className="careers-apply-lead">
          <span>BUZZLY / APPLY</span>
          <h2 id="careers-apply-heading">Make things<br /><em>people want to watch.</em></h2>
          <p>Content can give a business a story people understand. We are looking for the people who can tell it. Pick a role, or send an open application.</p>
          <p className="careers-apply-privacy">We use these details only to consider your application. See our <Link href="/privacy">Privacy Policy</Link>.</p>
        </div>
        <ApplicationForm roles={openRoles.map(role => role.title)} areas={careerAreas.map(area => area.title)} />
      </section>
    </Interior>
  );
}
