"use client";

import Image from "next/image";
import { useId, useState, type FormEvent } from "react";
import { Badge, Button, FieldInput, FieldTextarea, SurfaceCard } from "@/components/ui/core";
import { CLIENT_AUTHOR, DELIVERABLE_STATUSES, formatPortalDate, type Deliverable, type DeliverableStatus } from "@/data/portal-mock";

type Filter = "All" | DeliverableStatus;

const statusTone: Record<DeliverableStatus, "accent" | "cream" | "solid" | "neutral"> = {
  "Needs Review": "accent",
  Approved: "cream",
  "Revision Requested": "solid",
  Scheduled: "neutral",
};

const toSeconds = (stamp: string) => {
  const [minutes, seconds] = stamp.split(":").map(Number);
  return minutes * 60 + seconds;
};

/** Inline revision note: a timestamp in the asset plus what to change. */
function RevisionForm({ asset, onSubmit, onCancel }: { asset: Deliverable; onSubmit: (timestamp: string, note: string) => void; onCancel: () => void }) {
  const uid = useId();
  const [errors, setErrors] = useState<{ timestamp?: string; note?: string }>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const timestamp = String(data.get("timestamp") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    const found: typeof errors = {};
    if (!/^\d{1,2}:\d{2}$/.test(timestamp) || Number(timestamp.split(":")[1]) > 59) found.timestamp = "Use minutes:seconds, e.g. 00:08.";
    else if (toSeconds(timestamp) > toSeconds(asset.duration)) found.timestamp = `This asset is ${asset.duration} long.`;
    if (note.length < 3) found.note = "Tell us what to change.";
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit(timestamp.padStart(5, "0"), note);
  };

  return (
    <form className="revision-form" onSubmit={submit} noValidate>
      <FieldInput label="Timestamp" name="timestamp" placeholder="00:08" inputMode="numeric" maxLength={5} error={errors.timestamp} errorId={`${uid}-ts`} required className="revision-ts" autoFocus />
      <FieldTextarea label="What should change?" name="note" placeholder="Tighten the opening cut" maxLength={400} error={errors.note} errorId={`${uid}-note`} required rows={2} />
      <div className="revision-actions">
        <Button type="submit" size="sm">Send revision note</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function DeliverableCard({ asset, onApprove, onRevise }: { asset: Deliverable; onApprove: () => void; onRevise: (timestamp: string, note: string) => void }) {
  const [revising, setRevising] = useState(false);
  const canApprove = asset.status === "Needs Review" || asset.status === "Revision Requested";
  const canRevise = asset.status !== "Scheduled";

  return (
    <SurfaceCard as="article" className={`deliverable is-${asset.status.toLowerCase().replace(/\s+/g, "-")}`} aria-labelledby={`${asset.id}-title`}>
      <div className="deliverable-poster">
        <Image src={asset.posterUrl} alt="" fill sizes="(max-width: 750px) 30vw, 140px" />
        <span className="deliverable-duration">{asset.duration}</span>
      </div>
      <div className="deliverable-body">
        <div className="deliverable-meta">
          <Badge tone={statusTone[asset.status]}>{asset.status === "Approved" ? "✓ Approved" : asset.status}</Badge>
          <span className="bz-mono">{asset.format} · {asset.platform}</span>
        </div>
        <h3 id={`${asset.id}-title`}>{asset.title}</h3>
        <p className="deliverable-hook"><span className="bz-mono">Hook</span>“{asset.hookLine}”</p>
        <p className="deliverable-date bz-mono">{asset.status === "Scheduled" ? "Publishes" : "Planned for"} {formatPortalDate(asset.scheduledDate)}</p>

        {asset.revisions.length > 0 && (
          <ol className="deliverable-thread" aria-label="Revision notes">
            {asset.revisions.map(note => (
              <li key={note.id} className={note.author === CLIENT_AUTHOR ? "is-client" : undefined}>
                <span className="thread-ts">{note.timestamp}</span>
                <p>{note.note}<small>{note.author === CLIENT_AUTHOR ? "You" : "Buzzly"}</small></p>
              </li>
            ))}
          </ol>
        )}

        {revising ? (
          <RevisionForm asset={asset} onCancel={() => setRevising(false)} onSubmit={(timestamp, note) => { onRevise(timestamp, note); setRevising(false); }} />
        ) : (
          (canApprove || canRevise) && (
            <div className="deliverable-actions">
              {canApprove && <Button size="sm" onClick={onApprove}>Approve for Publishing</Button>}
              {canRevise && <Button size="sm" variant="secondary" onClick={() => setRevising(true)} aria-expanded={false}>Request Revision</Button>}
            </div>
          )
        )}
      </div>
    </SurfaceCard>
  );
}

/**
 * Content queue with one-click approval and timestamped revision requests.
 * Front end only: changes live in this browser tab.
 * TODO: Persist approvals and revision notes through the backend in the next phase.
 */
export function ContentApprovalBoard({ initial }: { initial: Deliverable[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("All");
  const [announcement, setAnnouncement] = useState("");

  const update = (id: string, change: (asset: Deliverable) => Deliverable, message: string) => {
    setItems(current => current.map(asset => (asset.id === id ? change(asset) : asset)));
    setAnnouncement(message);
  };

  const filters: Filter[] = ["All", ...DELIVERABLE_STATUSES];
  const count = (value: Filter) => (value === "All" ? items.length : items.filter(asset => asset.status === value).length);
  const shown = filter === "All" ? items : items.filter(asset => asset.status === filter);

  return (
    <section className="approval" aria-labelledby="approval-title">
      <div className="approval-head">
        <h2 id="approval-title">Content queue</h2>
        <div className="approval-filters" role="tablist" aria-label="Filter by status">
          {filters.map(value => (
            <button key={value} type="button" role="tab" aria-selected={filter === value} className="approval-filter" onClick={() => setFilter(value)}>
              {value} <span>({count(value)})</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {shown.length ? (
        <div className="approval-grid">
          {shown.map(asset => (
            <DeliverableCard
              key={asset.id}
              asset={asset}
              onApprove={() => update(asset.id, current => ({ ...current, status: "Approved" }), `${asset.title} approved for publishing.`)}
              onRevise={(timestamp, note) => update(asset.id, current => ({
                ...current,
                status: "Revision Requested",
                notes: [...current.revisions, { id: `${current.id}-${current.revisions.length + 1}`, timestamp, note, author: CLIENT_AUTHOR, createdAt: new Date().toISOString() }],
              }), `Revision requested on ${asset.title} at ${timestamp}.`)}
            />
          ))}
        </div>
      ) : (
        <SurfaceCard className="approval-empty"><p>Nothing in “{filter}” right now.</p></SurfaceCard>
      )}
    </section>
  );
}
