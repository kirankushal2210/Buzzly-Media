import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { clientWins, type ClientWin } from "@/lib/clients";

/** One client's before → after as a card for the corridor walls. */
function ConfessionCard({ win, tone }: { win: ClientWin; tone: number }) {
  const [from, to] = win.story.shift;
  return (
    <span className={`corridor-card corridor-confession tone-${tone}`}>
      <span className="corridor-field">{win.field}</span>
      <span className="corridor-shift"><s>{from}</s><em>{to}</em></span>
      <span className="corridor-company">{win.company}{win.sample && <i> · Sample</i>}</span>
    </span>
  );
}

/** Real production stills from public/media/reel. */
const STILLS = [
  "/media/reel/film-camera-rig.jpg",
  "/media/reel/edit-timeline.jpg",
  "/media/reel/plan-notebook.jpg",
  "/media/reel/film-camera-operator.jpg",
  "/media/reel/post-phone.jpg",
  "/media/reel/edit-desk.jpg",
];
const PER_WALL = 14;

/**
 * Client Confessions and Wins as a corridor: two walls of cards (client
 * before → after stories and real production stills) flowing out of a
 * vanishing point towards the viewer, with the headline above and the
 * caption below. Pure CSS 3D (app/growth.css, .corridor-*); paused for
 * reduced motion. Stories stay in the page text for screen readers and search.
 */
export function ClientProof() {
  const anySample = clientWins.some(win => win.sample);
  const deck = Array.from({ length: PER_WALL }, (_, i) => i % 2 === 0
    ? { kind: "story" as const, win: clientWins[(i / 2) % clientWins.length], tone: (i / 2) % 4 }
    : { kind: "still" as const, src: STILLS[((i - 1) / 2) % STILLS.length] });
  const wall = (side: "left" | "right") => deck.map((card, i) => {
    // the right wall runs half a step behind the left, with the deck turned around
    const item = side === "left" ? card : deck[(PER_WALL - 1 - i + 3) % PER_WALL];
    const slot = side === "left" ? i : i + 0.5;
    return (
      <span key={`${side}-${i}`} className={`corridor-slot is-${side}`} style={{ ["--slot" as string]: slot }}>
        {item.kind === "story"
          ? <ConfessionCard win={item.win} tone={item.tone} />
          // eslint-disable-next-line @next/next/no-img-element -- decorative stills inside a CSS 3D scene
          : <img className="corridor-card corridor-still" src={item.src} alt="" loading="lazy" decoding="async" />}
      </span>
    );
  });

  return (
    <Reveal className="clientproof corridor-section" id="clients" aria-labelledby="clients-title">
      <div className="corridor" aria-hidden="true" style={{ ["--count" as string]: PER_WALL }}>
        {wall("left")}
        {wall("right")}
      </div>
      <div className="corridor-head">
        <p className="eyebrow">BUZZLY / PEOPLE WE BUILD WITH</p>
        <h2 id="clients-title">Client <em>Confessions</em><br />and Wins.</h2>
      </div>
      <div className="corridor-caption">
        <p>Every brand arrives with a before. Here is what happened next.</p>
        <p><Link href="/clients" className="clientproof-more">Read every client story in full ↗</Link></p>
        {anySample && <p className="corridor-note">Sample brands and stories, shown as placeholders until our first client stories are approved.</p>}
      </div>
      <ul className="sr-only">
        {clientWins.map(win => (
          <li key={win.company}>{win.company}{win.sample ? " (sample)" : ""}: {win.story.before} {win.story.move} {win.story.after}</li>
        ))}
      </ul>
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
