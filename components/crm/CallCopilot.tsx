"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Copy, ExternalLink, Globe, MapPin, Phone, Send } from "lucide-react";
import type { CrmRecord } from "@/lib/crm-config";
import { callScript, callingWindow, gapsList } from "@/lib/outreach";
import { dateTime } from "@/components/crm/format";

type Outcome = "No answer" | "Call back" | "Spoke, not interested" | "Spoke, interested" | "Do not call";
const QUEUE = ["Not called", "No answer", "Call back"];
const INDUSTRY: Record<string, string> = {
  "Restaurant, café or cloud kitchen": "Food & restaurants",
  "Clinic or wellness": "Healthcare & wellness",
  "Real estate": "Real estate",
};
const CALLER_KEY = "buzzly-crm-caller";

const tomorrowAt11 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T11:00`;
};

const strip = (data: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "" && v !== undefined && v !== null));

/**
 * Sales calling agent: a call copilot. Picks who to call next, writes a
 * personalised script from the prospect's record, and logs the outcome in one
 * click (updating the prospect, and creating a lead and a call record when
 * someone is interested). People make every call and every decision.
 */
export function CallCopilot() {
  const [prospects, setProspects] = useState<CrmRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [caller, setCaller] = useState("");
  const [notes, setNotes] = useState("");
  const [callBackAt, setCallBackAt] = useState(tomorrowAt11);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    const response = await fetch("/api/crm/prospects").catch(() => null);
    if (response?.status === 401) { window.location.assign("/admin/login"); return; }
    const body = await response?.json().catch(() => ({})) as { records?: CrmRecord[] } | undefined;
    if (!body?.records) { setState("error"); return; }
    setProspects(body.records);
    setState("ready");
  }, []);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => {
    try { setCaller(localStorage.getItem(CALLER_KEY) ?? ""); } catch { /* storage unavailable */ } // eslint-disable-line react-hooks/set-state-in-effect -- one-time read
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const queue = useMemo(() => prospects
    .filter(p => QUEUE.includes(String(p.data.callStatus)))
    .sort((a, b) => {
      const due = (r: CrmRecord) => String(r.data.nextCall || "0000");
      return due(a).localeCompare(due(b)) || (Number(a.data.attempts) || 0) - (Number(b.data.attempts) || 0);
    }), [prospects]);

  const current = prospects.find(p => p.id === selected) ?? queue[0] ?? null;
  const script = current ? callScript(current.data, caller) : null;
  const window9to9 = callingWindow(now);
  const previewUrl = current ? `${typeof window === "undefined" ? "" : window.location.origin}/p/${current.id}` : "";
  const previewReady = current && ["Ready", "Sent", "Viewed"].includes(String(current.data.previewStatus));

  async function patch(record: CrmRecord, data: Record<string, string | number>) {
    const response = await fetch(`/api/crm/prospects/${record.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(strip(data)) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { record?: CrmRecord; error?: string } | undefined;
    if (!body?.record) throw new Error(body?.error || "Couldn’t save");
    setProspects(list => list.map(p => (p.id === record.id ? body.record! : p)));
    return body.record;
  }

  async function log(outcome: Outcome) {
    if (!current) return;
    setBusy(true);
    const stamp = new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    const line = `${stamp} · ${outcome}${notes.trim() ? `: ${notes.trim()}` : ""}${caller.trim() ? ` (${caller.trim()})` : ""}`;
    const data: Record<string, string | number> = {
      ...current.data,
      callStatus: outcome,
      attempts: (Number(current.data.attempts) || 0) + 1,
      notes: [line, String(current.data.notes ?? "")].filter(Boolean).join("\n").slice(0, 5000),
      ...(caller.trim() ? { owner: caller.trim() } : {}),
    };
    if (outcome === "Call back") data.nextCall = callBackAt;
    else delete data.nextCall;
    try {
      await patch(current, data);
      const spoke = outcome.startsWith("Spoke");
      if (spoke) {
        await fetch("/api/crm/calls", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(strip({
            title: `${String(current.data.contactName || current.data.business)}, ${String(current.data.business)}`,
            callType: "Discovery", status: "Completed", scheduledAt: new Date().toISOString().slice(0, 16),
            outcome: outcome === "Spoke, interested" ? "Positive" : "Negative", owner: caller.trim(), summary: notes.trim(),
          })),
        });
      }
      if (outcome === "Spoke, interested") {
        await fetch("/api/crm/leads", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(strip({
            name: String(current.data.contactName || current.data.business), company: String(current.data.business),
            email: String(current.data.email ?? ""), phone: String(current.data.phone ?? ""),
            source: "Outreach", status: "Contacted", industry: INDUSTRY[String(current.data.category)] ?? "Other",
            owner: caller.trim(), notes: `From cold calling. ${notes.trim()}`.trim(),
          })),
        });
      }
      setFlash(outcome === "Spoke, interested" ? `Logged. ${String(current.data.business)} added to Leads, and the call to Sales & calls` : `Logged: ${outcome}`);
      setNotes("");
      setSelected(null);
    } catch (error) {
      setFlash(error instanceof Error ? error.message : "Couldn’t save");
    } finally {
      setBusy(false);
      window.setTimeout(() => setFlash(""), 4000);
    }
  }

  async function markSent() {
    if (!current) return;
    await patch(current, { ...current.data, previewStatus: "Sent" }).then(() => setFlash("Preview marked as sent")).catch(() => setFlash("Couldn’t update"));
  }

  if (state === "loading") return <div className="crm-skeleton" aria-busy="true"><span /><span /><span /></div>;
  if (state === "error") return <p className="crm-error">Couldn’t load prospects</p>;

  return (
    <div className="cc">
      <aside className="cc-queue crm-section" aria-label="Call queue">
        <h2>Up next</h2>
        <p className="crm-muted">{queue.length} to call · not called, no answer or call back</p>
        <label className="cc-caller"><span>You are calling as</span>
          <input value={caller} placeholder="Your name" onChange={e => { setCaller(e.target.value); try { localStorage.setItem(CALLER_KEY, e.target.value); } catch { /* storage unavailable */ } }} />
        </label>
        <ol>
          {queue.map(p => (
            <li key={p.id}>
              <button type="button" aria-current={current?.id === p.id ? "true" : undefined} onClick={() => { setSelected(p.id); setNotes(""); }}>
                <strong>{String(p.data.business)}</strong>
                <span>{[p.data.area, p.data.callStatus, p.data.nextCall ? `due ${dateTime(p.data.nextCall)}` : "", p.data.attempts ? `${p.data.attempts} tries` : ""].filter(Boolean).join(" · ")}</span>
              </button>
            </li>
          ))}
        </ol>
        {queue.length === 0 && <p className="crm-muted">Nobody to call. Add prospects below</p>}
      </aside>

      <section className="cc-desk crm-section" aria-label="Call copilot">
        {!current || !script ? (
          <div className="crm-empty"><p>Add a prospect below to start calling</p></div>
        ) : (
          <>
            {!window9to9.open && (
              <p className="cc-warn"><AlertTriangle aria-hidden="true" />It’s outside 9 AM–9 PM. Promotional calls in India are only allowed in that window, so schedule a call back instead</p>
            )}
            <div className="cc-head">
              <div>
                <h2>{String(current.data.business)}</h2>
                <p className="crm-muted">{[current.data.category, current.data.area, current.data.contactName ? `ask for ${current.data.contactName}` : ""].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="cc-links">
                {current.data.phone && <a className="crm-btn is-primary" href={`tel:${String(current.data.phone).replace(/\s+/g, "")}`}><Phone aria-hidden="true" />{String(current.data.phone)}</a>}
                {current.data.website && <a className="crm-btn is-icon" href={String(current.data.website)} target="_blank" rel="noopener noreferrer" aria-label="Website"><Globe aria-hidden="true" /></a>}
                {current.data.instagram && <a className="crm-btn is-icon" href={String(current.data.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><ExternalLink aria-hidden="true" /></a>}
                {current.data.mapsLink && <a className="crm-btn is-icon" href={String(current.data.mapsLink)} target="_blank" rel="noopener noreferrer" aria-label="Google Maps"><MapPin aria-hidden="true" /></a>}
              </div>
            </div>

            <div className="cc-preview">
              <span>Brand preview · <b>{String(current.data.previewStatus)}</b>{current.data.previewViewedAt ? ` · opened ${dateTime(current.data.previewViewedAt)}` : ""}</span>
              {previewReady ? (
                <span className="cc-preview-actions">
                  <button type="button" className="crm-btn is-small" onClick={() => navigator.clipboard?.writeText(previewUrl).then(() => setFlash("Preview link copied"))}><Copy aria-hidden="true" />Copy link</button>
                  <a className="crm-btn is-small" href={`/p/${current.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" />Open</a>
                  {current.data.previewStatus === "Ready" && <button type="button" className="crm-btn is-small" onClick={markSent}><Send aria-hidden="true" />Mark sent</button>}
                </span>
              ) : <span className="crm-muted">Fill in “What we noticed” and set Preview to Ready to create their page</span>}
            </div>

            <ol className="cc-script">
              <li><span>Open</span><p>{script.opener}</p></li>
              <li><span>Why you’re calling</span><p>{script.reason}</p></li>
              {script.noticed && <li><span>Make it about them</span><p>{script.noticed}</p></li>}
              <li><span>Ask</span><ul>{script.questions.map(q => <li key={q}>{q}</li>)}</ul></li>
              <li><span>Close</span><p>{script.close}</p></li>
            </ol>

            <details className="cc-objections">
              <summary>If they say…</summary>
              <dl>{script.objections.map(o => <div key={o.q}><dt>“{o.q}”</dt><dd>{o.a}</dd></div>)}</dl>
            </details>

            {gapsList(current.data.brandGaps).length === 0 && <p className="crm-muted">Tip: add what you noticed about their brand to the prospect, and the script uses it</p>}

            <label className="cc-notes"><span>Call notes</span>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What they said, who decides, best time to call" />
            </label>

            <div className="cc-outcomes" role="group" aria-label="Log the outcome">
              <button type="button" className="crm-btn" disabled={busy} onClick={() => log("No answer")}>No answer</button>
              <span className="cc-callback">
                <input type="datetime-local" value={callBackAt} onChange={e => setCallBackAt(e.target.value)} aria-label="Call back at" />
                <button type="button" className="crm-btn" disabled={busy} onClick={() => log("Call back")}>Call back</button>
              </span>
              <button type="button" className="crm-btn" disabled={busy} onClick={() => log("Spoke, not interested")}>Not interested</button>
              <button type="button" className="crm-btn" disabled={busy} onClick={() => log("Do not call")}>Do not call</button>
              <button type="button" className="crm-btn is-primary" disabled={busy} onClick={() => log("Spoke, interested")}>Interested</button>
            </div>
            <p className="crm-status" role="status" aria-live="polite">{flash}</p>
          </>
        )}
      </section>
    </div>
  );
}
