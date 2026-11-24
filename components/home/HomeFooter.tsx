import Link from "@/components/Link";
import { ClientPortalLink } from "@/components/ClientPortalLink";
import { companies } from "@/lib/content";
import { socialChannels } from "@/lib/site";
import { SocialIcon } from "@/components/SocialIcon";

const fanLines = Array.from({ length: 21 }, (_, i) => -400 + i * 100);
const arcLines = [12, 47, 91, 134, 171];

function FooterGrid() {
  return (
    <svg className="footer-grid" viewBox="0 0 1200 190" preserveAspectRatio="none" aria-hidden="true">
      {fanLines.map(x => <path key={`f${x}`} d={`M${x} -10 Q${100 + (x + 400) / 2} 170 600 175`} />)}
      {arcLines.map(y => <path key={`a${y}`} d={`M-50 ${y} Q600 ${y + 70} 1250 ${y}`} />)}
    </svg>
  );
}

/** Site footer for interior pages: navigation, sub-companies, owned channels and legal links. */
export function HomeFooter({ variant = "home" }: { variant?: "home" | "interior" | string } = {}) {
  const home = variant === "home";
  return (
    <footer className="sitefooter" id="contact">
      <FooterGrid />
      <div className="footer-intro wrap">
        <p>Buzzly builds brands through content, bringing together strategy, storytelling, and distribution for our own sub-companies and ambitious outside partners.</p>
        {home ? <a className="cta" href="#start-project">Let’s Connect</a> : <Link className="cta" href="/contact">Let’s Connect</Link>}
      </div>
      <div className="footer-main wrap">
        <a className="footer-wordmark" href="#top" aria-label="Buzzly — back to top">Buzzly<span>.</span></a>
        <span className="footer-symbol" aria-hidden="true">✳</span>
        <p>Building brands through content. Ours and everyone else’s.</p>
        <nav aria-label="Our sub-companies">
          {companies.map(company => <Link key={company.slug} href={`/companies/${company.slug}`}>{company.name}</Link>)}
        </nav>
        <nav aria-label="Footer navigation">
          <Link href="/work">Work</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/team">Team</Link>
          <Link href="/careers">Careers</Link>
          {home ? <a href="#start-project">Contact</a> : <Link href="/contact">Contact</Link>}
          <ClientPortalLink className="footer-portal">Client Portal</ClientPortalLink>
        </nav>
        <nav aria-label="Buzzly on social media" className="footer-social">
          {socialChannels.map(channel => channel.href
            ? <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer" aria-label={`Buzzly on ${channel.label}`} title={channel.label}><SocialIcon name={channel.label} /></a>
            : <span key={channel.label} role="img" aria-label={`${channel.label}, coming soon`} title={`${channel.label} · coming soon`}><SocialIcon name={channel.label} /></span>)}
        </nav>
      </div>
      <div className="footer-grid-wrap"><FooterGrid /></div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} Buzzly Media · Hyderabad, Telangana, India</span>
        <nav className="footer-legal" aria-label="Legal and company">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refund">Refund Policy</Link>
        </nav>
      </div>
    </footer>
  );
}
