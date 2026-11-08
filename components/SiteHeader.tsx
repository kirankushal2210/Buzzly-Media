"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { BuzzlyLogo } from "@/components/BuzzlyLogo";
import { MobileNav } from "@/components/MobileNav";
import { primaryNav } from "@/lib/site";

/** Shared header for the homepage and interior pages. */
export function SiteHeader({ variant }: { variant: "home" | "interior" }) {
  const pathname = usePathname();
  const home = variant === "home";
  return (
    <header className={`wrap ${home ? "home-site-header" : "interior-site-header"}`}>
      <nav className="leftnav" aria-label="Primary">
        {primaryNav.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} className="navlink" href={item.href} aria-current={active ? "page" : undefined}>
              {item.label}{item.caret && <> <span className="navcaret">⌄</span></>}
            </Link>
          );
        })}
      </nav>
      {home ? (
        <a className="logo buzzly-header-logo" href="#top" aria-label="Buzzly Media Home">
          <BuzzlyLogo variant="horizontal" theme="dark" size="sm" />
        </a>
      ) : (
        <Link className="logo buzzly-header-logo" href="/" aria-label="Buzzly Media Home">
          <BuzzlyLogo variant="horizontal" theme="dark" size="sm" />
        </Link>
      )}
      <div className="rightnav">
        {home
          ? <a className="topcontact" href="#contact">Let’s Connect ↗</a>
          : <Link className="topcontact" href="/contact">Let’s Connect ↗</Link>}
        <MobileNav contactHref="/contact" />
      </div>
    </header>
  );
}
