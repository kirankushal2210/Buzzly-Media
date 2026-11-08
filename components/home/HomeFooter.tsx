import Link from "@/components/Link";
import { companies } from "@/lib/content";
import { studioStatus } from "@/lib/site";
import { QuickInquiry } from "@/components/home/QuickInquiry";

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

/** Site footer. On the homepage, section links scroll in-page; elsewhere they go to the matching route. */
export function HomeFooter({ variant = "home" }: { variant?: "home" | "interior" }) {
  const home = variant === "home";
  return (
    <footer className="sitefooter" id="contact">
      <FooterGrid />
      <div className="footer-intro wrap">
        <p>Buzzly builds brands through content, bringing together strategy, storytelling, and distribution for our own sub-companies and ambitious outside partners.</p>
        <Link className="cta" href="/contact">Let’s Connect</Link>
      </div>
      <div className="footer-live wrap">
        <div className={`footer-status${studioStatus.accepting ? " is-open" : ""}`} role="status">
          <span className="footer-status-dot" aria-hidden="true" />
          <div><strong>{studioStatus.label}</strong><small>{studioStatus.detail}</small></div>
        </div>
        <ul className="footer-building" aria-label="Sub-companies currently in build">
          {companies.map(company => (
            <li key={company.slug} style={{ ["--accent" as string]: company.accent }}>
              <span className="footer-status-dot is-small" aria-hidden="true" />
              <Link href={`/companies/${company.slug}`}>{company.name}</Link>
              <small>Sub-company in build</small>
            </li>
          ))}
        </ul>
        <QuickInquiry />
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
          {home ? <a href="#clients">Clients</a> : <Link href="/clients">Clients</Link>}
          <Link href="/about">About</Link>
          {home ? <a href="#how">How we work</a> : <Link href="/services">How we work</Link>}
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
      <div className="footer-grid-wrap"><FooterGrid /></div>
      <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} Buzzly. All rights reserved.</span><nav className="footer-legal" aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div>
    </footer>
  );
}
