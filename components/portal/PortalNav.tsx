"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/Link";

const tabs = [
  { href: "/portal", label: "Content Queue" },
  { href: "/portal/analytics", label: "Distribution & Retention" },
  { href: "/portal/scope", label: "Scope & Billing" },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="portal-nav" aria-label="Workspace">
      {tabs.map(tab => {
        const active = pathname === tab.href;
        return <Link key={tab.href} href={tab.href} className="portal-tab" aria-current={active ? "page" : undefined}>{tab.label}</Link>;
      })}
    </nav>
  );
}
