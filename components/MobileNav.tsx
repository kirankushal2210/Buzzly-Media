"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { ClientPortalLink } from "@/components/ClientPortalLink";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { BuzzlyLogo } from "@/components/BuzzlyLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { primaryNav } from "@/lib/site";
import { companies } from "@/lib/content";

/** Full-height navigation drawer for small screens, built on the Radix dialog primitive. */
export function MobileNav({ contactHref }: { contactHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes (including back/forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="menu" type="button" aria-label="Open menu">☰</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-drawer-overlay" />
        <Dialog.Content className="mobile-drawer" aria-describedby={undefined}>
          <div className="mobile-drawer-head">
            <Dialog.Title className="sr-only">Site menu</Dialog.Title>
            <Link href="/" className="mobile-drawer-logo" aria-label="Buzzly Media Home" onClick={() => setOpen(false)}>
              <BuzzlyLogo variant="horizontal" theme="dark" size="sm" />
            </Link>
            <Dialog.Close className="mobile-drawer-close" aria-label="Close menu">Close ×</Dialog.Close>
          </div>
          <nav className="mobile-drawer-nav" aria-label="Mobile primary">
            {primaryNav.map((item, index) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{ animationDelay: `${0.06 + index * 0.04}s` }}
                  onClick={() => setOpen(false)}
                >
                  <span>0{index + 1}</span>{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mobile-drawer-companies">
            <span>OUR SUB-COMPANIES</span>
            {companies.map(company => (
              <Link key={company.slug} href={`/companies/${company.slug}`} onClick={() => setOpen(false)}>{company.name} ↗</Link>
            ))}
          </div>
          {contactHref.startsWith("#")
            ? <a className="cta mobile-drawer-cta" href={contactHref} onClick={() => setOpen(false)}>Let’s Connect ↗</a>
            : <Link className="cta mobile-drawer-cta" href={contactHref} onClick={() => setOpen(false)}>Let’s Connect ↗</Link>}
          <ClientPortalLink className="mobile-drawer-login" onClick={() => setOpen(false)}>Client Login</ClientPortalLink>
          <ThemeToggle />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
