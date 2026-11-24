"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/Link";

/** The client portal is only offered inside the Clients section. */
export function useInClientsSection() {
  const pathname = usePathname() ?? "";
  return pathname === "/clients" || pathname.startsWith("/clients/");
}

export function ClientPortalLink({ className, children, onClick }: { className: string; children: React.ReactNode; onClick?: () => void }) {
  if (!useInClientsSection()) return null;
  return <Link className={className} href="/portal/login" onClick={onClick}>{children}</Link>;
}
