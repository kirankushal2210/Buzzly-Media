import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";

export function ServiceBillboard() {
  return (
    <Reveal className="servicebillboard wrap" id="services">
      <p className="eyebrow">BUZZLY / WHAT WE DO</p>
      <h2>We know what<br />moves brands.</h2>
      <div className="servicewords">
        {["CONTENT", "SOCIAL", "DISTRIBUTION"].map(word => (
          <Link key={word} href="/services">
            {word} <span>↗</span>
          </Link>
        ))}
      </div>
      <p>Strategy, storytelling, and distribution help brands earn attention and build lasting reach.</p>
      <div className="serviceactions">
        <a className="cta" href="#start-project">Start a Project</a>
        <Link className="outlinecta" href="/services">Explore Our Services</Link>
      </div>
    </Reveal>
  );
}
