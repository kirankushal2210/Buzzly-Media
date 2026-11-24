"use client";

import { useRef } from "react";
import { Badge, Button, SurfaceCard } from "@/components/ui/core";
import { engagementTiers } from "@/lib/engagements";

/**
 * "Manage Retainer / Upgrade Tier" dialog. Front end only.
 * TODO: Connect Razorpay Subscriptions checkout here
 */
export function RetainerManager({ currentSlug }: { currentSlug: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant="secondary" onClick={() => dialogRef.current?.showModal()}>Manage Retainer / Upgrade Tier</Button>
      <dialog ref={dialogRef} className="retainer-dialog" aria-labelledby="retainer-dialog-title" onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
        <div className="retainer-dialog-inner">
          <div className="retainer-dialog-head">
            <h2 id="retainer-dialog-title">Manage your retainer</h2>
            <Button variant="ghost" size="sm" onClick={() => dialogRef.current?.close()} aria-label="Close">Close ×</Button>
          </div>
          <ul className="retainer-options">
            {engagementTiers.map(tier => {
              const current = tier.slug === currentSlug;
              return (
                <SurfaceCard as="li" key={tier.slug} className={current ? "is-current" : undefined}>
                  <div>
                    <span className="bz-mono">Tier {tier.number} · {tier.term}</span>
                    <h3>{tier.name}</h3>
                    <p>{tier.summary}</p>
                  </div>
                  {current
                    ? <Badge tone="cream">Current plan</Badge>
                    : <Button size="sm" variant="secondary" disabled aria-disabled title="Online plan changes are coming soon">Switch to this tier</Button>}
                </SurfaceCard>
              );
            })}
          </ul>
          <p className="retainer-dialog-note">Online plan changes and payments are coming soon. To change your plan today, message your account lead.</p>
        </div>
      </dialog>
    </>
  );
}
