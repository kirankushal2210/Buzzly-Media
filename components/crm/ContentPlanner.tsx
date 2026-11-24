"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Emoji, TYPE_EMOJI } from "@/components/crm/emoji";
import Link from "@/components/Link";
import { CONTENT_PLATFORMS, CONTENT_STAGES, CONTENT_TYPES, type CrmRecord } from "@/lib/crm-config";
import {
  PLURAL, addDays, daysInMonth, isoDay, monthOf, monthProgress, nextStage, nextTask, spreadDates, tasksDue,
  type ContentType, type Task, type TypeProgress,
} from "@/lib/content-plan";

/**
 * Client content planner: what's due today, each client's month against what
 * was promised (reels, stories, posts), and a calendar of every piece.
 * Real records only. Styles: app/admin/shell.css (.cp-*).
 */
const TYPE_TONE: Record<ContentType, string> = { Reel: "is-reel", Story: "is-story", Post: "is-post" };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const nice = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", opts);
const daysLate = (due: string, today: string) => Math.round((Date.parse(today) - Date.parse(due)) / 86400000);

function Ring({ p }: { p: TypeProgress }) {
  const r = 26, c = 2 * Math.PI * r;
  const total = Math.max(1, p.promised);
  const planned = Math.min(1, p.planned / total), posted = Math.min(1, p.posted / total);
  return (
    <svg viewBox="0 0 64 64" className="cp-ring" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="cp-ring-track" />
      <circle cx="32" cy="32" r={r} className="cp-ring-planned" strokeDasharray={`${planned * c} ${c}`} />
      <circle cx="32" cy="32" r={r} className={`cp-ring-posted ${TYPE_TONE[p.type]}`} strokeDasharray={`${posted * c} ${c}`} />
    </svg>
  );
}

function PromiseCard({ p, onPlan, busy }: { p: TypeProgress; onPlan?: () => void; busy?: boolean }) {
  return (
    <span className={`cp-promise ${TYPE_TONE[p.type]}`}>
      <span className="cp-ring-wrap">
        <Ring p={p} />
        <span className="cp-ring-label"><Emoji name={TYPE_EMOJI[p.type]} /></span>
      </span>
      <span className="cp-promise-text">
        <strong>{p.posted}<small>/{p.promised || "—"}</small></strong>
        <span>{PLURAL[p.type]} posted</span>
        <small className="cp-sub">
          {p.promised === 0 ? "No promise set" : `${p.planned} planned${p.behind ? ` · ${p.behind} behind` : ""}`}
        </small>
        {onPlan && p.unplanned > 0 && (
          <button type="button" className="crm-btn is-small" onClick={onPlan} disabled={busy}>
            <Plus aria-hidden="true" />Plan {p.unplanned} more
          </button>
        )}
      </span>
    </span>
  );
}

type Draft = Partial<Record<string, string>> & { id?: string };

export function ContentPlanner() {
  const today = isoDay(new Date());
  const [clients, setClients] = useState<CrmRecord[] | null>(null);
  const [pieces, setPieces] = useState<CrmRecord[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string>("all");
  const [month, setMonth] = useState(monthOf(today));
  const [range, setRange] = useState(7);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    (async () => { try {
      const [c, p] = await Promise.all(["clients", "content"].map(async e => {
        const res = await fetch(`/api/crm/${e}`);
        if (res.status === 401) { window.location.assign("/admin/login"); throw new Error("signed out"); }
        const body = await res.json() as { records?: CrmRecord[]; error?: string };
        if (!body.records) throw new Error(body.error || "Couldn’t load the planner.");
        return body.records;
      }));
      setClients(c.filter(x => x.data.status !== "Churned").sort((a, b) => str(a.data.name).localeCompare(str(b.data.name))));
      setPieces(p);
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t load the planner."); } })();
  }, []);

  // ?client=<id> opens one client straight away (links from elsewhere in the CRM).
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("client");
    if (id) setSelected(id); // eslint-disable-line react-hooks/set-state-in-effect -- one-off, from the URL
  }, []);
  const choose = (id: string) => {
    setSelected(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("client"); else url.searchParams.set("client", id);
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  useEffect(() => {
    const d = dialog.current;
    if (draft && d && !d.open) d.showModal();
    if (!draft && d?.open) d.close();
  }, [draft]);

  const nameOf = useCallback((id: string) => str(clients?.find(c => c.id === id)?.data.name) || "Unknown client", [clients]);
  const client = clients?.find(c => c.id === selected) ?? null;
  const scoped = useMemo(() => (client ? pieces.filter(p => p.data.clientId === client.id) : pieces), [pieces, client]);
  const tasks = useMemo(() => tasksDue(scoped, today), [scoped, today]);
  const taskCount = useCallback((id: string) => tasksDue(pieces.filter(p => p.data.clientId === id), today).length, [pieces, today]);

  async function save(data: Record<string, string>, id?: string) {
    const res = await fetch(id ? `/api/crm/content/${id}` : "/api/crm/content", {
      method: id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({})) as { record?: CrmRecord; error?: string; fields?: Record<string, string[]> };
    if (!res.ok || !body.record) throw new Error(body.fields ? Object.entries(body.fields).map(([k, v]) => `${k}: ${v[0]}`).join(" · ") : body.error || "Couldn’t save.");
    const saved = body.record;
    setPieces(list => (id ? list.map(p => (p.id === id ? saved : p)) : [...list, saved]));
    return saved;
  }
  const clean = (data: Record<string, string | number>) =>
    Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => [k, String(v)]));

  async function advance(task: Task) {
    const to = nextStage(str(task.piece.data.stage));
    if (!to) return;
    setBusy(true);
    try { await save({ ...clean(task.piece.data), stage: to }, task.piece.id); } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t save."); }
    setBusy(false);
  }

  async function planRest(p: TypeProgress) {
    if (!client) return;
    setBusy(true);
    try {
      const dates = spreadDates(p.unplanned, month, today, p.type);
      for (const [i, postDate] of dates.entries()) {
        await save({ clientId: client.id, type: p.type, stage: "Idea", postDate, title: `${p.type} ${p.planned + i + 1} of ${p.promised}` });
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t plan."); }
    setBusy(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = clean(Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>);
    setBusy(true); setFormError("");
    try { await save(data, draft?.id); setDraft(null); } catch (e) { setFormError(e instanceof Error ? e.message : "Couldn’t save."); }
    setBusy(false);
  }

  async function remove() {
    if (!draft?.id || !window.confirm("Delete this piece from the plan?")) return;
    const id = draft.id;
    const res = await fetch(`/api/crm/content/${id}`, { method: "DELETE" });
    if (res.ok) { setPieces(list => list.filter(p => p.id !== id)); setDraft(null); } else setFormError("Couldn’t delete.");
  }

  const openNew = (postDate = today, type: ContentType = "Reel") =>
    setDraft({ clientId: client?.id ?? clients?.[0]?.id ?? "", type, stage: "Idea", postDate });
  const openPiece = (p: CrmRecord) => setDraft({ id: p.id, ...clean(p.data) });

  if (error) return <p className="crm-error" role="alert">{error}</p>;
  if (!clients) return <p className="crm-muted">Loading…</p>;
  if (clients.length === 0) {
    return (
      <div className="crm-empty">
        <p>No clients yet. Add a client with what you promised them each month (reels, stories and posts), and their plan appears here.</p>
        <Link className="crm-btn is-primary" href="/admin/clients?add=clients"><Plus aria-hidden="true" />Add a client</Link>
      </div>
    );
  }

  // Calendar grid for the month (weeks start on Monday).
  const first = `${month}-01`;
  const lead = (new Date(`${first}T00:00:00`).getDay() + 6) % 7;
  const cells = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysInMonth(month) }, (_, i) => addDays(first, i))];
  const byDay = (day: string) => scoped.filter(p => p.data.postDate === day).sort((a, b) => str(a.data.type).localeCompare(str(b.data.type)));
  const shiftMonth = (n: number) => {
    const d = new Date(`${month}-01T00:00:00`); d.setMonth(d.getMonth() + n);
    setMonth(isoDay(d).slice(0, 7));
  };
  const upcoming = scoped.filter(p => str(p.data.postDate) >= today && str(p.data.postDate) <= addDays(today, range - 1))
    .sort((a, b) => str(a.data.type).localeCompare(str(b.data.type)));
  const grouped = client ? [{ id: client.id, tasks }] : clients.map(c => ({ id: c.id, tasks: tasks.filter(t => t.clientId === c.id) })).filter(g => g.tasks.length);
  const fields = draft ?? {};

  return (
    <div className="cp">
      <nav className="cp-clients" aria-label="Clients">
        <button type="button" aria-pressed={selected === "all"} onClick={() => choose("all")}>All clients</button>
        {clients.map(c => {
          const n = taskCount(c.id);
          return (
            <button key={c.id} type="button" aria-pressed={selected === c.id} onClick={() => choose(c.id)}>
              {str(c.data.name)}{n > 0 && <b aria-label={`${n} due today`}>{n}</b>}
            </button>
          );
        })}
      </nav>

      <section className="crm-panel cp-today" aria-labelledby="cp-today">
        <div className="cp-head">
          <div>
            <p className="cp-kicker">{nice(today, { weekday: "long", day: "numeric", month: "long" })}</p>
            <h2 id="cp-today">{client ? `Today for ${str(client.data.name)}` : "Today across clients"}</h2>
          </div>
          <button type="button" className="crm-btn is-primary" onClick={() => openNew()}><Plus aria-hidden="true" />Add content</button>
        </div>
        {tasks.length === 0
          ? <p className="cp-clear"><Check aria-hidden="true" />Nothing due today{client ? ` for ${str(client.data.name)}` : ""}. {scoped.length === 0 ? "Plan the month below to get started." : "You’re on schedule."}</p>
          : grouped.map(g => (
            <div key={g.id} className="cp-group">
              {!client && <h3>{nameOf(g.id)} <small>{g.tasks.length} to do</small></h3>}
              <ul className="cp-tasks">
                {g.tasks.map(t => {
                  const type = str(t.piece.data.type) as ContentType;
                  const late = daysLate(t.due, today);
                  return (
                    <li key={t.piece.id} className={t.overdue ? "is-late" : undefined}>
                      <button type="button" className="cp-check" onClick={() => advance(t)} disabled={busy}
                        aria-label={`Done: ${t.action} for ${str(t.piece.data.title)}. Move to the next stage.`} title="Done, move to the next stage">
                        <Check aria-hidden="true" />
                      </button>
                      <span className={`cp-type ${TYPE_TONE[type]}`}><Emoji name={TYPE_EMOJI[type] ?? "pin"} />{type}</span>
                      <button type="button" className="cp-task-text" onClick={() => openPiece(t.piece)}>
                        <strong>{t.action}</strong>
                        <small>{str(t.piece.data.title)} · posts {nice(str(t.piece.data.postDate))} · now: {str(t.piece.data.stage)}</small>
                      </button>
                      {t.overdue && <span className="cp-late">{late} {late === 1 ? "day" : "days"} late</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </section>

      <section className="crm-panel cp-upcoming" aria-labelledby="cp-up">
        <div className="cp-head">
          <div>
            <h2 id="cp-up">Coming up</h2>
            <p className="crm-muted">Everything planned to post{client ? ` for ${str(client.data.name)}` : ""} in the next {range} days, and the next job for each</p>
          </div>
          <div className="cp-range" role="group" aria-label="How many days to show">
            {[3, 7, 14].map(n => <button key={n} type="button" aria-pressed={range === n} onClick={() => setRange(n)}>{n} days</button>)}
          </div>
        </div>
        <div className="cp-board">
          {Array.from({ length: range }, (_, i) => addDays(today, i)).map(day => {
            const items = upcoming.filter(p => p.data.postDate === day);
            return (
              <div key={day} className={`cp-col${day === today ? " is-today" : ""}`}>
                <div className="cp-col-head">
                  <strong>{day === today ? "Today" : day === addDays(today, 1) ? "Tomorrow" : nice(day, { weekday: "short" })}</strong>
                  <span>{nice(day)}</span>
                  <b aria-label={`${items.length} pieces`}>{items.length}</b>
                </div>
                {items.map(p => {
                  const type = str(p.data.type) as ContentType;
                  const task = nextTask(p, today);
                  return (
                    <button key={p.id} type="button" className={`cp-up-card ${TYPE_TONE[type]}${p.data.stage === "Posted" ? " is-done" : ""}${task?.overdue ? " is-late" : ""}`} onClick={() => openPiece(p)}>
                      {!client && <span className="cp-up-client">{nameOf(str(p.data.clientId))}</span>}
                      <span className="cp-up-title"><Emoji name={TYPE_EMOJI[type] ?? "pin"} />{str(p.data.title)}</span>
                      <span className="cp-up-stage">{str(p.data.stage)}</span>
                      {task && <span className="cp-up-next">{task.overdue ? "Late: " : "Next: "}{task.action.toLowerCase()}{task.due > today ? ` by ${nice(task.due)}` : ""}</span>}
                    </button>
                  );
                })}
                <button type="button" className="cp-col-add" onClick={() => openNew(day)}><Plus aria-hidden="true" />Add</button>
              </div>
            );
          })}
        </div>
      </section>

      {!client && (
        <div className="cp-grid">
          {clients.map(c => {
            const progress = monthProgress(c, pieces, monthOf(today), today);
            const behind = progress.filter(p => p.behind > 0);
            const promised = progress.some(p => p.promised > 0);
            return (
              <button key={c.id} type="button" className="crm-panel cp-card" onClick={() => choose(c.id)}>
                <span className="cp-card-head">
                  <strong>{str(c.data.name)}</strong>
                  <span className={`cp-pace ${!promised ? "" : behind.length ? "is-behind" : "is-ok"}`}>
                    {!promised ? "Set promises" : behind.length ? `Behind on ${behind.map(p => PLURAL[p.type].toLowerCase()).join(", ")}` : "On track"}
                  </span>
                </span>
                <span className="cp-card-rings">{progress.map(p => <PromiseCard key={p.type} p={p} />)}</span>
                <span className="cp-card-foot">{taskCount(c.id)} due today · open plan <ChevronRight aria-hidden="true" /></span>
              </button>
            );
          })}
        </div>
      )}

      {client && (
        <>
          <section className="crm-panel" aria-labelledby="cp-promises">
            <div className="cp-head">
              <h2 id="cp-promises">{nice(`${month}-01`, { month: "long", year: "numeric" })}: promised vs posted</h2>
              <Link className="crm-link" href="/admin/clients">Edit promises</Link>
            </div>
            <div className="cp-promises">
              {monthProgress(client, pieces, month, today).map(p => <PromiseCard key={p.type} p={p} busy={busy} onPlan={month >= monthOf(today) ? () => planRest(p) : undefined} />)}
            </div>
          </section>
        </>
      )}

      <>

          <section className="crm-panel cp-cal-panel" aria-labelledby="cp-cal">
            <div className="cp-head">
              <h2 id="cp-cal">Content calendar{client ? "" : ": all clients"}</h2>
              <div className="cp-month">
                <button type="button" className="crm-btn is-icon" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft aria-hidden="true" /></button>
                <span>{nice(`${month}-01`, { month: "long", year: "numeric" })}</span>
                <button type="button" className="crm-btn is-icon" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight aria-hidden="true" /></button>
              </div>
            </div>
            <div className="cp-legend">{CONTENT_TYPES.map(t => <span key={t} className={TYPE_TONE[t]}><i />{PLURAL[t]}</span>)}<span className="is-done"><i />Posted</span></div>
            <div className="cp-cal">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d} className="cp-dow">{d}</span>)}
              {cells.map((day, i) => day === null ? <span key={`x${i}`} className="cp-day is-blank" /> : (
                <div key={day} className={`cp-day${day === today ? " is-today" : ""}${day < today ? " is-past" : ""}`}>
                  <span className="cp-day-num">{Number(day.slice(8))}</span>
                  <div className="cp-chips">
                    {byDay(day).map(p => {
                      const type = str(p.data.type) as ContentType;
                      const task = nextTask(p, today);
                      return (
                        <button key={p.id} type="button" onClick={() => openPiece(p)}
                          className={`cp-chip ${TYPE_TONE[type]}${p.data.stage === "Posted" ? " is-done" : ""}${task?.overdue ? " is-late" : ""}`}
                          title={`${client ? "" : `${nameOf(str(p.data.clientId))}: `}${type}: ${str(p.data.title)} (${str(p.data.stage)})`}>
                          {p.data.stage === "Posted" && <Check aria-hidden="true" />}{client ? "" : `${nameOf(str(p.data.clientId))} · `}{str(p.data.title)}
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" className="cp-add" aria-label={`Add content on ${nice(day)}`} onClick={() => openNew(day)}><Plus aria-hidden="true" /></button>
                </div>
              ))}
            </div>
          </section>

          <section className="crm-panel" aria-labelledby="cp-pipe">
            <h2 id="cp-pipe" className="cp-h2">Where everything stands</h2>
            <ol className="cp-pipe">
              {CONTENT_STAGES.map(s => {
                const n = scoped.filter(p => p.data.stage === s && monthOf(str(p.data.postDate)) === month).length;
                return <li key={s} className={n ? "has" : undefined}><b>{n}</b><span>{s}</span></li>;
              })}
            </ol>
          </section>
      </>

      <dialog ref={dialog} className="crm-dialog" onClose={() => setDraft(null)} aria-labelledby="cp-dialog-title">
        {draft && (
          <form className="crm-form" onSubmit={submit} key={draft.id ?? `${draft.postDate}-new`}>
            <div className="crm-dialog-head">
              <h3 id="cp-dialog-title">{draft.id ? "Edit content" : "Add content"}</h3>
              <button type="button" className="crm-btn is-icon" onClick={() => setDraft(null)} aria-label="Close"><X aria-hidden="true" /></button>
            </div>
            <div className="crm-form-grid">
              <label className="is-wide">Title or idea <b>*</b><input name="title" required defaultValue={fields.title} placeholder="e.g. Morning coffee pour, slow motion" /></label>
              <label>Client <b>*</b>
                <select name="clientId" required defaultValue={fields.clientId}>{clients.map(c => <option key={c.id} value={c.id}>{str(c.data.name)}</option>)}</select>
              </label>
              <label>Type <b>*</b><select name="type" required defaultValue={fields.type}>{CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
              <label>Stage <b>*</b><select name="stage" required defaultValue={fields.stage}>{CONTENT_STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
              <label>Post date <b>*</b><input name="postDate" type="date" required defaultValue={fields.postDate} /></label>
              <label>Platform<select name="platform" defaultValue={fields.platform ?? ""}><option value="">—</option>{CONTENT_PLATFORMS.map(s => <option key={s}>{s}</option>)}</select></label>
              <label>Who is on it<input name="owner" defaultValue={fields.owner} placeholder="Who is on it" /></label>
              <label className="is-wide">Hook / brief<textarea name="hook" rows={3} defaultValue={fields.hook} placeholder="Hook / brief" /></label>
              <label className="is-wide">Link (draft or live post)<input name="link" type="url" defaultValue={fields.link} placeholder="https://" /></label>
              <label className="is-wide">Notes<textarea name="notes" rows={2} defaultValue={fields.notes} placeholder="Notes" /></label>
            </div>
            <div className="crm-dialog-foot">
              {formError ? <p className="crm-error" role="alert">{formError}</p> : <p className="crm-muted">Fields marked * are required</p>}
              {draft.id && <button type="button" className="crm-btn is-danger" onClick={remove}><Trash2 aria-hidden="true" />Delete</button>}
              <button type="submit" className="crm-btn is-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
