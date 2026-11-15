import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { StoryFilm } from "@/components/home/StoryFilm";

export function ServiceBillboard() {
  return (
    <>
      <Reveal className="servicebillboard wrap" id="services">
        <p className="eyebrow">BUZZLY / WHAT WE DO</p>
        <h2>We know what<br />moves brands.</h2>
        <div className="servicewords">
          {["CONTENT", "SOCIAL", "DISTRIBUTION"].map(word => <a key={word} href="#how">{word} <span>↗</span></a>)}
        </div>
        <p>Strategy, storytelling, and distribution help brands earn attention and build lasting reach.</p>
        <div className="serviceactions">
          <Link className="cta" href="/contact">Start a Project</Link>
          <a className="outlinecta" href="#how">Explore Our Approach</a>
        </div>
      </Reveal>
      <div className="typebelt" aria-hidden="true">
        <div className="typebelt-track">
          CONTENT BUILDS BRANDS <span>✳</span> CONTENT BUILDS DISTRIBUTION <span>✳</span> CONTENT BUILDS BRANDS <span>✳</span> CONTENT BUILDS DISTRIBUTION <span>✳</span>
        </div>
      </div>
    </>
  );
}

export function Manifesto() {
  return (
    <Reveal className="manifesto wrap" id="approach">
      <h2>Build the brand.<br /><em>Build the reach.</em></h2>
      <aside>
        <p>Buzzly is a technology-led company. Content and social media help us build distribution, trust, and customer reach—both for the sub-companies we own and build, and for ambitious outside businesses.</p>
        <a className="plain" href="#content">See how content moves ↗</a>
      </aside>
    </Reveal>
  );
}

const steps = [
  { title: "Find the idea", copy: "What should people understand and remember?" },
  { title: "Make it visible", copy: "Films, reels, images, and stories give that idea a form." },
  { title: "Help it travel", copy: "Content and social media can connect it with an audience." },
];

export function StoryFlow() {
  return (
    <Reveal className="storyflow wrap" id="how" aria-label="How Buzzly builds reach">
      <div className="story-visual">
        <StoryFilm />
      </div>
      <div className="story-copy">
        <p className="eyebrow">HOW IT MOVES</p>
        <h2>Ideas become<br />stories.<br /><em>Stories find people.</em></h2>
        <p className="story-lede">Buzzly brings a brand’s idea to life through content and helps it reach the people it is made for.</p>
        <ol>
          {steps.map((step, i) => (
            <li key={step.title}><span>0{i + 1}</span><div><strong>{step.title}</strong><p>{step.copy}</p></div></li>
          ))}
        </ol>
        <a className="plain" href="#content">See the content direction ↗</a>
      </div>
    </Reveal>
  );
}

/**
 * How content becomes distribution. Drawn from the research in
 * docs/12-CONTENT-AS-DISTRIBUTION-RESEARCH.md (how social-first media
 * companies and agencies build reach). Mechanisms only: no competitor names,
 * no reach or revenue promises.
 */
const mechanics = [
  { tag: "Repurpose", title: "One idea, cut for every feed.", copy: "One clear idea becomes a film, short reels, images and posts, each made for the place it will be watched rather than resized from another." },
  { tag: "Consistency", title: "Steady beats loud.", copy: "Publishing regularly on one clear subject builds an audience that comes back, so every new piece starts with people the brand has already earned." },
  { tag: "Participation", title: "Let people join in.", copy: "Content that invites people to reply, share or make their own version spreads through them, not just to them." },
  { tag: "Creators", title: "Borrow trust, then earn it.", copy: "Working with creators and communities puts a brand in front of people who already trust the person speaking." },
  { tag: "Test, then boost", title: "Prove it, then push it.", copy: "We watch what people actually watch, save and share, and only then put paid support behind it." },
  { tag: "Ownership", title: "Keep the relationship.", copy: "Every post gives interested people a simple next step, a message, a visit, an enquiry, so attention becomes a relationship the brand owns." },
];

export function ContentLine() {
  return (
    <Reveal className="contentline wrap" id="content">
      <div className="contentline-lead">
        <div className="eyebrow">Content as distribution</div>
        <h2>Content is the<br /><em>distribution.</em></h2>
        <p>The biggest social-first media companies did not start by buying reach. They built audiences with content, then brought brands and products to the people already watching. The same mechanics can work for one business.</p>
        <div className="content-loop" aria-hidden="true">
          <svg viewBox="0 0 320 320">
            <circle className="loop-track" cx="160" cy="160" r="118" />
            <g className="loop-sweep"><path d="M160 42 A118 118 0 0 1 262.2 101" /></g>
            {mechanics.map((m, i) => {
              const angle = (-90 + i * 60) * Math.PI / 180;
              const x = 160 + 118 * Math.cos(angle), y = 160 + 118 * Math.sin(angle);
              const lx = 160 + 146 * Math.cos(angle), ly = 160 + 146 * Math.sin(angle) + 4;
              return (
                <g key={m.tag} className="loop-node" style={{ animationDelay: `-${(12 - ((i * 2 + 10) % 12)) % 12}s` }}>
                  <circle cx={x} cy={y} r="6" />
                  <text x={lx} y={ly} textAnchor="middle">0{i + 1}</text>
                </g>
              );
            })}
            <text className="loop-centre" x="160" y="154" textAnchor="middle">Every round</text>
            <text className="loop-centre is-em" x="160" y="186" textAnchor="middle">teaches the next.</text>
          </svg>
        </div>
      </div>
      <ol className="mechanics">
        {mechanics.map((m, i) => (
          <li key={m.tag}>
            <span className="mechanic-no">0{i + 1}</span>
            <span className="mechanic-tag">{m.tag}</span>
            <h3>{m.title}</h3>
            <p>{m.copy}</p>
          </li>
        ))}
        <li className="mechanics-close">
          <p>What people respond to shapes the next idea. That loop is how a brand grows through content, and it is how we work with every brand we build.</p>
          <Link className="cta" href="/contact">Start a Project ↗</Link>
        </li>
      </ol>
    </Reveal>
  );
}
