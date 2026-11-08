import Image from "next/image";
import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";

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
        <div className="story-ring" aria-hidden="true" />
        <div className="story-photo photo-main"><Image src="/media/buzzly-properties-poster.webp" alt="Frame from the Buzzly Properties film" fill sizes="(max-width: 750px) 80vw, 40vw" /></div>
        <div className="story-photo photo-small"><Image src="/media/de-food-kampney-poster.webp" alt="Frame from the De Food Kampney film" fill sizes="(max-width: 750px) 45vw, 22vw" /></div>
        <span className="story-stamp" aria-hidden="true">BUZZLY<br />IN MOTION ↗</span>
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

const reels = [
  { src: "/media/de-food-kampney-poster.webp", alt: "Frame from the De Food Kampney film", label: "01 / Food Platform", href: "/companies/de-food-kampney" },
  { src: "/media/buzzly-health-poster.webp", alt: "Frame from the Buzzly Health film", label: "02 / Healthcare", href: "/companies/buzzly-health" },
  { src: "/media/buzzly-properties-poster.webp", alt: "Frame from the Buzzly Properties film", label: "03 / Real Estate", href: "/companies/buzzly-properties" },
];

export function ContentLine() {
  return (
    <Reveal className="contentline wrap" id="content">
      <div className="eyebrow">Content as distribution</div>
      <h2>Made to be seen.<br /><em>Built to connect.</em></h2>
      <p>Ideas become films, reels, images and stories that help people discover and understand a brand. These frames come from the films of Buzzly’s own sub-companies.</p>
      <div className="reels">
        {reels.map(reel => (
          <Link className="reel" key={reel.label} href={reel.href}>
            <Image src={reel.src} alt={reel.alt} fill sizes="(max-width: 750px) 50vw, 25vw" /><span>{reel.label}</span>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
