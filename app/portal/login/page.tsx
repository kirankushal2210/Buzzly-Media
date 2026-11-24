import type { Metadata } from "next";
import Link from "@/components/Link";
import { BuzzlyLogo } from "@/components/BuzzlyLogo";
import { Badge, Button, FieldInput, SurfaceCard } from "@/components/ui/core";
import { demoCredentials, clientProfile } from "@/data/portal-mock";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to your Buzzly client workspace to review content, track distribution and manage your retainer." };

/**
 * Client sign-in, front end only. The button opens the demo workspace directly.
 * TODO: Replace with Clerk or Auth.js sign-in (session cookie + proxy.ts route protection) in the backend phase.
 */
export default function PortalLogin() {
  return (
    <main className="portal-login">
      <SurfaceCard className="portal-login-card">
        <Link href="/" className="portal-login-logo" aria-label="Back to the Buzzly website">
          <BuzzlyLogo variant="horizontal" theme="dark" size="sm" />
        </Link>
        <p className="bz-eyebrow">Client workspace</p>
        <h1>Review, approve <em>and track your content.</em></h1>
        <p className="portal-login-lede">Your content queue, distribution results and retainer in one place.</p>

        <div className="portal-login-form">
          <FieldInput label="Work email" type="email" name="demo-email" defaultValue={demoCredentials.email} readOnly autoComplete="off" />
          <FieldInput label="Password" type="password" name="demo-password" defaultValue={demoCredentials.password} readOnly autoComplete="off" hint="Demo credentials are filled in for you." />
          <Button href="/portal" size="lg" className="portal-login-submit">Enter Demo Client Workspace →</Button>
        </div>

        <div className="portal-login-note">
          <Badge tone="accent">Demo</Badge>
          <p>This workspace uses sample data for {clientProfile.brandName}, a fictional brand on the {clientProfile.planName} plan. Client accounts with real sign-in are coming soon.</p>
        </div>
        <Link href="/" className="portal-login-back">← Back to buzzly.in</Link>
      </SurfaceCard>
    </main>
  );
}
