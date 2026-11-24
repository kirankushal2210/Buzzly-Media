import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { StoryCta } from "@/components/clients/StoryCta";
import { HomeContact } from "@/components/home/HomeContact";
import { clientWins } from "@/lib/clients";

export const metadata: Metadata = {
  title: "How Brands Grow Through Content: Client Stories",
  description: "Where the brands we build with start, what we change, and where they end up. Tell us where you are and we’ll show you the next move.",
  alternates: { canonical: "/clients" },
};

const hasSamples = clientWins.some(win => win.sample);

/**
 * /clients is written for the visitor, not about us: start from the problem
 * they recognise, show the before → move → after, and let every story
 * pre-fill the form at the bottom of this page (no redirect to /contact).
 */
export default function Clients() {
  return (
    <Interior eyebrow="BUZZLY / CLIENTS" title="Every story here started where you are." intro="Good businesses that people couldn’t see, couldn’t understand, or scrolled straight past. Here’s what changed for each of them, and how it could change for you.">
      <section className="cs-pick" aria-labelledby="cs-pick-title">
        <div className="cs-pick-head">
          <p className="interior-eyebrow">STEP 01 / WHERE ARE YOU NOW?</p>
          <h2 id="cs-pick-title">Which one<br /><em>sounds like you?</em></h2>
          <p>Pick the line that sounds like your business. We’ll add it to your message below, so you only have to tell us the rest.</p>
        </div>
        <ul className="cs-pick-list">
          {clientWins.map(win => (
            <li key={win.company}>
              <StoryCta company={win.company} before={win.story.before} after={win.story.after} className="cs-pick-item">
                <span className="cs-pick-before">“{win.story.before}”</span>
                <span className="cs-pick-go">That’s us →</span>
              </StoryCta>
            </li>
          ))}
        </ul>
      </section>

      <section className="cs-stories" aria-labelledby="cs-stories-title">
        <div className="cs-stories-head">
          <p className="interior-eyebrow">STEP 02 / WHAT CHANGES</p>
          <h2 id="cs-stories-title">Before.<br />The move.<br /><em>After.</em></h2>
          {hasSamples && <p className="cs-disclosure">These brands are fictional samples that show the kind of work we do. Each one will be replaced by a real client story once that client approves it.</p>}
        </div>
        <ol className="cs-story-list">
          {clientWins.map((win, index) => (
            <li key={win.company} className="cs-story" style={{ ["--accent" as string]: win.accent }}>
              <div className="cs-story-id">
                <span className="bz-mono">{String(index + 1).padStart(2, "0")}</span>
                <h3>{win.company}</h3>
                <p>{win.field}{win.sample ? " · Sample" : ""}</p>
                <p className="cs-story-shift"><s>{win.story.shift[0]}</s> <span aria-hidden="true">→</span><span className="sr-only">became</span> <em>{win.story.shift[1]}</em></p>
              </div>
              <dl className="cs-story-arc">
                <div><dt>Before</dt><dd>{win.story.before}</dd></div>
                <div><dt>The move</dt><dd>{win.story.move}</dd></div>
                <div><dt>After</dt><dd>{win.story.after}</dd></div>
              </dl>
              <div className="cs-story-foot">
                {win.story.quote && (
                  <blockquote>
                    <p>“{win.story.quote}”</p>
                    <cite>{win.story.by}, {win.company}{win.sample ? " (sample)" : ""}</cite>
                  </blockquote>
                )}
                <p className="cs-story-services">{win.services.join(" / ")}</p>
                <StoryCta company={win.company} before={win.story.before} after={win.story.after} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="clients-page-process" aria-label="How a partnership takes shape">
        <div className="clients-page-process-heading"><p className="interior-eyebrow">STEP 03 / HOW WE GET THERE</p><h2>A brief.<br />A story.<br /><em>A way<br />forward.</em></h2><p>We begin with what a business wants people to know, then create content that gives the idea a form and helps it reach an audience.</p></div>
        <div className="clients-page-process-steps"><div><span>01 / LISTEN</span><p>Understand the business, its audience, and the change it wants to make.</p></div><div><span>02 / CREATE</span><p>Shape the strategy, write the story, and make the content.</p></div><div><span>03 / DISTRIBUTE</span><p>Publish, learn from the response, and keep building reach.</p></div></div>
      </section>

      <HomeContact
        eyebrow="BUZZLY / YOUR STORY NEXT"
        title={<>Your brand.<br /><em>Our next story.</em></>}
        copy="Tell us where you are now and where you want to be. Pick a story above and we’ll start the message for you."
      />
    </Interior>
  );
}
