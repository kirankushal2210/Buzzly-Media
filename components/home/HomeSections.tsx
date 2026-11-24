import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/ui/core";
import { clientWins, type ClientWin } from "@/lib/clients";

/** One client's story as a three-act storyboard: before → the move → after, closing on their own words. */
function StoryCard({ win }: { win: ClientWin }) {
  const { story } = win;
  const acts = [
    ["01", "Before", story.before],
    ["02", "The move", story.move],
    ["03", "After", story.after],
  ] as const;
  return (
    <article className="storycard" style={{ ["--accent" as string]: win.accent }}>
      <div className="storycard-head">
        <span className="storycard-field">{win.field}{win.sample && <em> · Sample</em>}</span>
        <h3>{win.company}</h3>
      </div>
      <ol className="storycard-acts">
        {acts.map(([number, label, text]) => (
          <li key={number}>
            <span className="storycard-act"><b>{number}</b> {label}</span>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      {story.quote && (
        <blockquote className="storycard-quote">
          “{story.quote}”
          <cite>{story.by}, {win.company}</cite>
        </blockquote>
      )}
      <div className="storycard-services">{win.services.join(" + ")}</div>
    </article>
  );
}

/** The whole story in one line: the old state struck through, the new state in italic. */
function StoryShift({ win }: { win: ClientWin }) {
  const [from, to] = win.story.shift;
  return (
    <span className="storyshift">
      <s>{from}</s>
      <span className="storyshift-arrow" aria-label="became">→</span>
      <em>{to}</em>
      <span className="storyshift-meta">{win.company}{win.sample && " · Sample"}</span>
      <span className="storyshift-star" aria-hidden="true">✳</span>
    </span>
  );
}

/**
 * Client stories: a slow row of storyboard cards (before → the move → after)
 * over a faster counter-scrolling row of one-line transformations.
 * Entries are samples until real client stories are approved (see lib/clients.ts).
 */
export function ClientProof() {
  const anySample = clientWins.some(win => win.sample);
  return (
    <Reveal className="clientproof" id="clients" aria-labelledby="clients-title">
      <div className="wrap clientproof-head">
        <p className="eyebrow">BUZZLY / PEOPLE WE BUILD WITH</p>
        <h2 id="clients-title">Client<br /><em>Confessions</em><span> and Wins.</span></h2>
        <p className="clientproof-lede">Every brand arrives with a before. Here is what happened next.</p>
        {anySample && <p className="clientproof-note">Sample brands and stories, shown as placeholders until our first client stories are approved.</p>}
      </div>
      <Marquee
        className="storymarquee"
        label="Client stories"
        duration={110}
        gap={28}
        repeat={2}
        items={clientWins.map(win => <StoryCard key={win.company} win={win} />)}
      />
      <Marquee
        className="shiftmarquee"
        label="Before and after, in one line"
        reverse
        duration={92}
        gap={40}
        repeat={2}
        items={clientWins.map(win => <StoryShift key={win.company} win={win} />)}
      />
    </Reveal>
  );
}

const mechanics = [
  { tag: "Repurpose", title: "One idea, cut for every feed.", copy: "One clear idea becomes a film, short reels, images and posts, each made for the place it will be watched rather than resized from another." },
  { tag: "Consistency", title: "Steady beats loud.", copy: "Publishing regularly on one clear subject builds an audience that comes back, so every new piece starts with people the brand has already earned." },
  { tag: "Participation", title: "Let people join in.", copy: "Content that invites people to reply, share or make their own version spreads through them, not just to them." },
  { tag: "Creators", title: "Borrow trust, then earn it.", copy: "Working with creators and communities puts a brand in front of people who already trust the person speaking." },
  { tag: "Test, then boost", title: "Prove it, then push it.", copy: "We watch what people actually watch, save and share, and only then put paid support behind it." },
  { tag: "Ownership", title: "Keep the relationship.", copy: "Every post gives interested people a simple next step, a message, a visit, an enquiry, so attention becomes a relationship the brand owns." },
];

const LOOP_CENTRE = 160;
const LOOP_RADIUS = 118;
const LOOP_SECONDS = 12;

/** Six nodes around a circle; each lights up as the red sweep passes it. */
function ContentLoop() {
  const step = LOOP_SECONDS / mechanics.length;
  return (
    <div className="content-loop" aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <circle className="loop-track" cx={LOOP_CENTRE} cy={LOOP_CENTRE} r={LOOP_RADIUS} />
        <g className="loop-sweep"><path d="M160 42 A118 118 0 0 1 262.2 101" /></g>
        {mechanics.map((item, index) => {
          const angle = (index / mechanics.length) * Math.PI * 2 - Math.PI / 2;
          const round = (value: number) => Math.round(value * 100) / 100;
          const x = round(LOOP_CENTRE + LOOP_RADIUS * Math.cos(angle));
          const y = round(LOOP_CENTRE + LOOP_RADIUS * Math.sin(angle));
          const labelX = round(LOOP_CENTRE + (LOOP_RADIUS + 28) * Math.cos(angle));
          const labelY = round(LOOP_CENTRE + (LOOP_RADIUS + 28) * Math.sin(angle) + 4);
          // The sweep starts between nodes 1 and 2, so node 2 lights first.
          const delay = -(((1 - index + mechanics.length) % mechanics.length) * step);
          return (
            <g className="loop-node" key={item.tag} style={{ animationDelay: `${delay}s` }}>
              <circle cx={x} cy={y} r={6} />
              <text x={labelX} y={labelY} textAnchor="middle">0{index + 1}</text>
            </g>
          );
        })}
        <text className="loop-centre" x={LOOP_CENTRE} y={154} textAnchor="middle">Every round</text>
        <text className="loop-centre is-em" x={LOOP_CENTRE} y={186} textAnchor="middle">teaches the next.</text>
      </svg>
    </div>
  );
}

export function ContentLine() {
  return (
    <Reveal className="contentline wrap" id="content">
      <div className="contentline-lead">
        <div className="eyebrow">Content as distribution</div>
        <h2>Content is the<br /><em>distribution.</em></h2>
        <p>The biggest social-first media companies did not start by buying reach. They built audiences with content, then brought brands and products to the people already watching. The same mechanics can work for one business.</p>
        <ContentLoop />
      </div>
      <ol className="mechanics">
        {mechanics.map((item, index) => (
          <li key={item.tag}>
            <span className="mechanic-no">0{index + 1}</span>
            <span className="mechanic-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </li>
        ))}
        <li className="mechanics-close">
          <p>What people respond to shapes the next idea. That loop is how a brand grows through content, and it is how we work with every brand we build.</p>
          <a href="#start-project" className="cta">Start a Project ↗</a>
        </li>
      </ol>
    </Reveal>
  );
}
