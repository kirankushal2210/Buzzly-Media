import { Button, SurfaceCard } from "@/components/ui/core";

/** Conversion card closing every playbook. */
export function InsightCta() {
  return (
    <SurfaceCard as="aside" className="insight-cta" aria-labelledby="insight-cta-title">
      <p className="bz-eyebrow">Work with Buzzly</p>
      <h2 id="insight-cta-title">Want this applied to <em>your brand?</em></h2>
      <p>Tell us about your brand in five questions, and we’ll get back to you about what we could build together.</p>
      <div className="insight-cta-actions">
        <Button href="/contact#lead-form" size="lg">Start a Project →</Button>
        <Button href="/services#readiness-audit" variant="ghost">Or get your Content Engine Score</Button>
      </div>
    </SurfaceCard>
  );
}
