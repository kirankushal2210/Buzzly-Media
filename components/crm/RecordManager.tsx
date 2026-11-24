"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { entities, type CrmRecord, type EntityKey, type Field } from "@/lib/crm-config";
import { derivedColumns } from "@/lib/crm-metrics";
import { date, dateTime, money, number, percent } from "@/components/crm/format";
import { Check, ChevronDown, Plus, Search, Trash2, X } from "lucide-react";

type FieldErrors = Record<string, string[] | undefined>;
type Toast = { text: string; undo?: () => void; tone?: "error" };

function display(field: Field, value: unknown) {
  switch (field.type) {
    case "money": return money(value);
    case "number": return number(value);
    case "percent": return value === undefined || value === "" ? "—" : `${value}%`;
    case "date": return date(value);
    case "datetime": return dateTime(value);
    default: return value === undefined || value === "" ? "—" : String(value);
  }
}

const statusTone = (value: string) =>
  /^hot|won|active|completed|live|running|positive|on target|agreed|^yes$|strong/i.test(value) ? "good"
    : /lost|churned|no-show|cancelled|negative|ended|above target|declined|dropped|^no$|weak/i.test(value) ? "bad"
      : /^cold|new|planned|planning|scheduled|discovery|saved|shortlisted|drafting/i.test(value) ? "new" : "mid";

/** Tesler's law: the system fills the obvious values so people don't have to. */
function defaultsFor(entityKey: EntityKey): Record<string, string> {
  const today = new Date().toISOString().slice(0, 10);
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  if (entityKey === "weekly") return { weekOf: monday.toISOString().slice(0, 10) };
  if (entityKey === "aiChecks") return { checkedOn: today };
  if (entityKey === "adResearch" || entityKey === "experiments" || entityKey === "outreach") return { startDate: today };
  return {};
}

const DELETE_DELAY = 6000;

/**
 * One CRM section: list, search, filter, add, edit and delete, driven by lib/crm-config.ts.
 * UX laws applied: progressive disclosure in forms (essentials first), forgiving input,
 * smart defaults, whole-row targets, immediate (optimistic) feedback, undo instead of
 * a confirm dialog, and a visible filter state.
 */
export function RecordManager({ entityKey, board = false, where, title }: {
  entityKey: EntityKey; board?: boolean;
  /** Show only records whose fields match, and pre-fill new ones with them (e.g. one ad channel). */
  where?: Record<string, string>;
  /** Heading override, e.g. "Paid search campaigns". */
  title?: string;
}) {
  const entity = entities[entityKey];
  const whereKey = JSON.stringify(where ?? {});
  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"table" | "board">(board ? "board" : "table");
  const [editing, setEditing] = useState<CrmRecord | "new" | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const statusField = entity.fields.find(f => f.key === entity.statusField);
  const columns = entity.fields.filter(f => f.column);
  const essentials = entity.fields.filter(f => f.required || f.column);
  const extras = entity.fields.filter(f => !f.required && !f.column);

  const notify = useCallback((next: Toast) => {
    window.clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = window.setTimeout(() => setToast(null), next.undo ? DELETE_DELAY : 3500);
  }, []);

  const load = useCallback(async () => {
    const response = await fetch(`/api/crm/${entityKey}`).catch(() => null);
    if (response?.status === 401) { window.location.assign("/admin/login"); return; }
    const body = await response?.json().catch(() => ({})) as { records?: CrmRecord[]; error?: string } | undefined;
    if (!response?.ok || !body?.records) { setState("error"); setLoadError(body?.error || "Couldn’t load records"); return; }
    setRecords(body.records);
    setState("ready");
  }, [entityKey]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (editing && !dialog.open) dialog.showModal();
    if (!editing && dialog.open) dialog.close();
  }, [editing]);

  const scoped = useMemo(() => {
    const match = JSON.parse(whereKey) as Record<string, string>;
    return records.filter(record => Object.entries(match).every(([k, v]) => record.data[k] === v));
  }, [records, whereKey]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter(record =>
      (!status || record.data[entity.statusField ?? ""] === status)
      && (!q || Object.values(record.data).some(value => String(value).toLowerCase().includes(q))));
  }, [scoped, query, status, entity.statusField]);
  const filtering = Boolean(query.trim() || status);

  const open = (record: CrmRecord | "new") => { setErrors({}); setFormError(""); setEditing(record); };

  // Quick actions link here with ?add=<entity>: open that form straight away, then tidy the URL.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("add") !== entityKey) return;
    url.searchParams.delete("add");
    window.history.replaceState(null, "", url.pathname + url.search);
    setEditing("new"); // eslint-disable-line react-hooks/set-state-in-effect -- one-off, from the URL
  }, [entityKey]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErrors({});
    setFormError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const isNew = editing === "new";
    const response = await fetch(isNew ? `/api/crm/${entityKey}` : `/api/crm/${entityKey}/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { record?: CrmRecord; error?: string; fields?: FieldErrors } | undefined;
    setSaving(false);
    if (!response?.ok || !body?.record) {
      setErrors(body?.fields ?? {});
      setFormError(body?.error || "Couldn’t save. Check your connection and try again.");
      return;
    }
    setRecords(current => isNew ? [body.record!, ...current] : current.map(r => (r.id === body.record!.id ? body.record! : r)));
    notify({ text: isNew ? `${entity.singular[0].toUpperCase()}${entity.singular.slice(1)} added` : "Changes saved" });
    setEditing(null);
  }

  /** Forgiveness over confirmation: the record disappears at once and is only deleted if nobody presses Undo. */
  function remove(record: CrmRecord) {
    setEditing(null);
    setRecords(current => current.filter(r => r.id !== record.id));
    let undone = false;
    const timer = window.setTimeout(async () => {
      if (undone) return;
      const response = await fetch(`/api/crm/${entityKey}/${record.id}`, { method: "DELETE" }).catch(() => null);
      if (!response?.ok) {
        setRecords(current => [record, ...current]);
        notify({ text: "Couldn’t delete that. It’s been put back", tone: "error" });
      }
    }, DELETE_DELAY);
    notify({
      text: `Deleted “${record.data[entity.titleField]}”`,
      undo: () => {
        undone = true;
        window.clearTimeout(timer);
        setRecords(current => [record, ...current].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        notify({ text: "Restored" });
      },
    });
  }

  /** Doherty threshold: the card moves instantly; it moves back only if the save fails. */
  async function moveTo(record: CrmRecord, value: string) {
    const key = entity.statusField!;
    const data = { ...record.data, [key]: value };
    setRecords(current => current.map(r => (r.id === record.id ? { ...r, data } : r)));
    const response = await fetch(`/api/crm/${entityKey}/${record.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { record?: CrmRecord } | undefined;
    if (body?.record) setRecords(current => current.map(r => (r.id === record.id ? body.record! : r)));
    else {
      setRecords(current => current.map(r => (r.id === record.id ? record : r)));
      notify({ text: "Couldn’t move that card. Open it to check its fields", tone: "error" });
    }
  }

  /** Fitts's law: the whole row opens the record, not just a small button. */
  const rowClick = (event: MouseEvent<HTMLTableRowElement>, record: CrmRecord) => {
    if ((event.target as HTMLElement).closest("button, a, select, input")) return;
    open(record);
  };

  const current: Record<string, string | number> = editing && editing !== "new" ? editing.data : editing === "new" ? { ...defaultsFor(entityKey), ...where } : {};
  const derivedSample = records[0] ? derivedColumns(entityKey, records[0].data) : derivedColumns(entityKey, {});
  const derivedKeys = derivedSample ? Object.keys(derivedSample) : [];
  const extrasOpen = extras.some(f => (current[f.key] ?? "") !== "" || errors[f.key]);
  const stageSteps = statusField?.options?.filter(o => o !== "Lost") ?? [];

  const fieldInput = (field: Field) => {
    const value = current[field.key];
    const err = errors[field.key]?.[0];
    const common = {
      name: field.key,
      defaultValue: value === undefined ? "" : String(value),
      required: field.required,
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `${entityKey}-${field.key}-err` : undefined,
      // The label doubles as the placeholder (the form style the admin uses), unless a field gives a better hint.
      placeholder: field.placeholder ?? (field.type === "money" ? "e.g. 45,000 or 45k" : field.label.replace(/\s*\(.*\)$/, "").replace(/\?$/, "")),
    };
    return (
      <label key={field.key} className={field.type === "textarea" ? "is-wide" : undefined}>
        <span>{field.label}{field.required && <b aria-hidden="true"> *</b>}</span>
        {field.type === "textarea" ? <textarea {...common} rows={4} />
          : field.type === "select" ? (
            <select {...common} defaultValue={value === undefined ? (field.required ? field.options![0] : "") : String(value)}>
              {!field.required && <option value="">—</option>}
              {field.options!.map(option => <option key={option}>{option}</option>)}
            </select>
          )
            : field.type === "money"
              ? <input {...common} type="text" inputMode="decimal" autoComplete="off" />
              : <input {...common} type={{ number: "number", percent: "number", date: "date", datetime: "datetime-local", email: "email", tel: "tel", url: "url", text: "text" }[field.type] ?? "text"} min={["number", "percent"].includes(field.type) ? 0 : undefined} max={field.type === "percent" ? 100 : undefined} />}
        {err && <em className="crm-error" id={`${entityKey}-${field.key}-err`}>{err}</em>}
      </label>
    );
  };

  return (
    <section className="crm-section" aria-labelledby={`${entityKey}-title`}>
      <div className="crm-section-head">
        <div>
          <h2 id={`${entityKey}-title`}>{title ?? entity.label}</h2>
          <p className="crm-muted">
            {filtering
              ? <>Showing {number(visible.length)} of {number(scoped.length)} <button type="button" className="crm-clear" onClick={() => { setQuery(""); setStatus(""); }}>Clear filters</button></>
              : <>{number(scoped.length)} {scoped.length === 1 ? entity.singular : `${entity.singular}s`}</>}
          </p>
        </div>
        <div className="crm-toolbar">
          <div className="crm-search"><Search aria-hidden="true" /><input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} aria-label={`Search ${entity.label}`} /></div>
          {statusField && (
            <select value={status} onChange={e => setStatus(e.target.value)} aria-label={`Filter by ${statusField.label}`}>
              <option value="">All {statusField.label.toLowerCase()}{statusField.label.endsWith("s") ? "es" : "s"}</option>
              {statusField.options!.map(option => <option key={option}>{option}</option>)}
            </select>
          )}
          {board && (
            <div className="crm-seg" role="group" aria-label="View">
              <button type="button" aria-pressed={view === "board"} onClick={() => setView("board")}>Board</button>
              <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Table</button>
            </div>
          )}
          <button type="button" className="crm-btn is-primary" onClick={() => open("new")}><Plus aria-hidden="true" />Add {entity.singular}</button>
        </div>
      </div>

      {state === "loading" && (
        <div className="crm-skeleton" aria-busy="true" aria-label={`Loading ${entity.label}`}>
          {[0, 1, 2].map(i => <span key={i} />)}
        </div>
      )}
      {state === "error" && <p className="crm-error">{loadError}</p>}

      {state === "ready" && scoped.length === 0 && (
        <div className="crm-empty">
          <p>No {entity.singular}s yet</p>
          <button type="button" className="crm-btn" onClick={() => open("new")}><Plus aria-hidden="true" />Add the first one</button>
        </div>
      )}

      {state === "ready" && scoped.length > 0 && view === "board" && statusField && (
        <div className="crm-board">
          {statusField.options!.map(column => {
            const cards = visible.filter(r => r.data[statusField.key] === column);
            const total = cards.reduce((sum, r) => sum + (Number(r.data.value) || 0), 0);
            const step = stageSteps.indexOf(column);
            return (
              <div key={column} className="crm-board-col">
                <h3><span className={`crm-tag is-${statusTone(column)}`}>{column}</span> <small>{cards.length}{total ? ` · ${money(total)}` : ""}</small></h3>
                {cards.map(card => (
                  <article key={card.id} className="crm-card">
                    <button type="button" className="crm-card-open" onClick={() => open(card)}>
                      <strong>{String(card.data[entity.titleField] ?? "")}</strong>
                      <span>{[card.data.company, card.data.value !== undefined ? money(card.data.value) : "", card.data.expectedClose ? `close ${date(card.data.expectedClose)}` : ""].filter(Boolean).join(" · ")}</span>
                    </button>
                    {step >= 0 && (
                      <span className="crm-progress" role="img" aria-label={`Stage ${step + 1} of ${stageSteps.length}`}>
                        <i style={{ width: `${((step + 1) / stageSteps.length) * 100}%` }} />
                      </span>
                    )}
                    <select aria-label="Move to stage" value={column} onChange={e => moveTo(card, e.target.value)}>
                      {statusField.options!.map(option => <option key={option}>{option}</option>)}
                    </select>
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {state === "ready" && scoped.length > 0 && view === "table" && (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead><tr>{columns.map(c => <th key={c.key} scope="col">{c.label}</th>)}{derivedKeys.map(k => <th key={k} scope="col">{k}</th>)}</tr></thead>
            <tbody>
              {visible.map(record => {
                const derived = derivedColumns(entityKey, record.data);
                return (
                  <tr key={record.id} onClick={e => rowClick(e, record)} className="is-clickable">
                    {columns.map((c, i) => (
                      <td key={c.key} data-label={c.label}>
                        {c.key === entity.statusField && record.data[c.key]
                          ? <span className={`crm-tag is-${statusTone(String(record.data[c.key]))}`}>{String(record.data[c.key])}</span>
                          : i === 0 ? <button type="button" className="crm-link" onClick={() => open(record)}>{display(c, record.data[c.key])}</button>
                            : display(c, record.data[c.key])}
                      </td>
                    ))}
                    {derived && derivedKeys.map(k => {
                      const v = derived[k] ?? null;
                      if (typeof v === "string") return <td key={k} data-label={k}>{k === "Suggested owner" ? v : <span className={`crm-tag is-${statusTone(v)}`}>{v}</span>}</td>;
                      if (v === null && k === "Alert") return <td key={k} data-label={k} className="crm-muted">Set a target</td>;
                      return <td key={k} data-label={k}>{k === "CPL" ? money(v ?? undefined) : k === "ROAS" ? (v === null ? "—" : `${v.toFixed(2)}×`) : percent(v, 1)}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && <p className="crm-muted crm-pad">Nothing matches. <button type="button" className="crm-clear" onClick={() => { setQuery(""); setStatus(""); }}>Clear filters</button></p>}
        </div>
      )}

      <dialog ref={dialogRef} className="crm-dialog" onClose={() => setEditing(null)} aria-labelledby={`${entityKey}-dialog-title`}>
        {editing && (
          <form className="crm-form" onSubmit={save} noValidate key={editing === "new" ? "new" : editing.id}>
            <div className="crm-dialog-head">
              <h3 id={`${entityKey}-dialog-title`}>{editing === "new" ? `Add ${entity.singular}` : String(editing.data[entity.titleField] ?? `Edit ${entity.singular}`)}</h3>
              <button type="button" className="crm-btn is-icon" onClick={() => setEditing(null)} aria-label="Close"><X aria-hidden="true" /></button>
            </div>
            <div className="crm-form-grid">{essentials.map(fieldInput)}</div>
            {extras.length > 0 && (
              <details className="crm-more" open={extrasOpen}>
                <summary><ChevronDown aria-hidden="true" />More details <span className="crm-muted">{extras.map(f => f.label.split(" (")[0].toLowerCase()).slice(0, 4).join(", ")}{extras.length > 4 ? "…" : ""}</span></summary>
                <div className="crm-form-grid">{extras.map(fieldInput)}</div>
              </details>
            )}
            {formError && <p className="crm-error crm-form-error" role="alert">{formError}</p>}
            <div className="crm-dialog-foot">
              {editing !== "new" && <button type="button" className="crm-btn is-danger" onClick={() => remove(editing)}><Trash2 aria-hidden="true" />Delete</button>}
              <span className="crm-muted">{editing !== "new" ? `Updated ${dateTime(editing.updatedAt)}` : "Fields marked * are required"}</span>
              <button type="submit" className="crm-btn is-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        )}
      </dialog>

      {toast && (
        <div className={`crm-toast${toast.tone === "error" ? " is-error" : ""}`} role="status" aria-live="polite">
          {toast.tone !== "error" && <Check aria-hidden="true" />}
          <span>{toast.text}</span>
          {toast.undo && <button type="button" onClick={() => { toast.undo!(); }}>Undo</button>}
        </div>
      )}
    </section>
  );
}
