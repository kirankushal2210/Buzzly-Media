import Link from "@/components/Link";
import { BuzzlyLogo } from "@/components/BuzzlyLogo";
import { PortalNav } from "@/components/portal/PortalNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge, Button } from "@/components/ui/core";
import { clientProfile } from "@/data/portal-mock";

/**
 * Workspace shell, isolated from the marketing header and footer.
 * Front end only: no session check yet.
 * TODO: Replace with Clerk or Auth.js in the backend phase — verify the session
 * here (and in proxy.ts) and redirect signed-out visitors to /portal/login.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-shell">
      <header className="portal-top">
        <div className="portal-brand">
          <Link href="/portal" aria-label="Workspace home"><BuzzlyLogo variant="horizontal" theme="dark" size="sm" /></Link>
          <span className="bz-mono">Client workspace</span>
        </div>
        <div className="portal-client">
          <span className="portal-client-dot" aria-hidden="true" />
          <span><strong>{clientProfile.brandName}</strong><small>{clientProfile.planName}</small></span>
          <Badge tone="accent">Demo</Badge>
        </div>
        <div className="portal-actions">
          <ThemeToggle showLabel={false} />
          <Button href="/portal/login" variant="secondary" size="sm">Sign Out</Button>
        </div>
      </header>
      <PortalNav />
      <p className="portal-demo-note" role="note">Demo workspace: {clientProfile.brandName} is a fictional brand, and every figure, date and amount here is sample data.</p>
      <main className="portal-main">{children}</main>
    </div>
  );
}
