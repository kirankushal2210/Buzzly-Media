"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { CallSlotPicker } from "@/components/CallSlotPicker";
import { Badge, Button, FieldInput, FieldSelect } from "@/components/ui/core";
import { decodeAudit, scoreContentEngine } from "@/lib/audit-engine";
import { tierBySlug, type EngagementTier } from "@/lib/engagements";
import { LEAD_FIELDS, MONTHLY_BUDGETS, PRIMARY_GOALS, leadFieldErrors, leadSchema, type LeadField, type LeadFieldErrors, type LeadInput } from "@/lib/lead";

const SIMULATED_SEND_MS = 400;

function WhatsAppConnect() {
  // TODO: Wire WhatsApp Business URL in backend phase
  return <a className="lead-whatsapp" href="#whatsapp-placeholder">Prefer WhatsApp? Message our strategy team directly ↗</a>;
}

/** Replaces the form once the request is in: confirmation, then the call-slot picker. */
function LeadConfirmation({ lead }: { lead: LeadInput }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <div className="lead-confirmation">
      <p className="lead-confirmation-tag">Request received · {lead.brandUrl}</p>
      <h3 ref={headingRef} tabIndex={-1}>Request received—pick a 20-minute slot below for an intro call.</h3>
      <p>Thanks, {lead.fullName.split(" ")[0]}. We’ll be in touch at {lead.email}.</p>
      <CallSlotPicker lead={lead} />
      <WhatsAppConnect />
    </div>
  );
}

type Context = { tier: EngagementTier | null; audit: string | null };

/**
 * The 5-field qualifying lead form used on the homepage (#lead-form) and on
 * /contact. Reads ?scope=<tier> (pre-selects the goal) and ?audit=<code>
 * (attaches the readiness diagnostic) from the URL.
 *
 * Front end only for now: a submitted request is kept in React state.
 * TODO: Wire Next.js Server Action + Resend + PostgreSQL here
 */
export function LeadQualifierForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const goalRef = useRef<HTMLSelectElement>(null);
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [lead, setLead] = useState<LeadInput | null>(null);
  const [context, setContext] = useState<Context>({ tier: null, audit: null });
  const uid = useId();
  const errorId = (field: LeadField) => `${uid}-${field}-error`;

  // Context from /services (tier buttons, readiness audit) arrives in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tier = tierBySlug(params.get("scope")) ?? null;
    const code = params.get("audit");
    const audit = decodeAudit(code) ? code : null;
    if (tier && goalRef.current && !goalRef.current.value) goalRef.current.value = tier.goal;
    if (tier || audit) setContext({ tier, audit }); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
  }, []);

  const readForm = () => Object.fromEntries(new FormData(formRef.current!).entries());

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const field = (event.target as unknown as HTMLInputElement).name as LeadField;
    if (sending || !LEAD_FIELDS.includes(field)) return;
    const parsed = leadSchema.safeParse(readForm());
    const message = parsed.success ? undefined : leadFieldErrors(parsed.error)[field];
    setErrors(current => ({ ...current, [field]: message }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const data = readForm();
    if (typeof data.website === "string" && data.website.trim()) return; // honeypot: ignore bots
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const found = leadFieldErrors(parsed.error);
      setErrors(found);
      setNotice("Please check the highlighted fields.");
      const first = LEAD_FIELDS.find(field => found[field]);
      if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setNotice("");
    setSending(true);
    // TODO: Wire Next.js Server Action + Resend + PostgreSQL here (replace the simulated delay).
    window.setTimeout(() => { setLead(parsed.data); setSending(false); }, SIMULATED_SEND_MS);
  };

  if (lead) return <LeadConfirmation lead={lead} />;

  const auditResult = context.audit ? scoreContentEngine(decodeAudit(context.audit)!) : null;
  const field = (name: LeadField) => ({ name, error: errors[name], errorId: errorId(name), required: true, disabled: sending });

  return (
    <form ref={formRef} className="lead-form" onSubmit={submit} onBlur={onBlur} noValidate aria-busy={sending}>
      {(context.tier || auditResult) && (
        <div className="lead-context" aria-label="Attached to your request">
          {context.tier && <Badge tone="accent">Scope · {context.tier.name}</Badge>}
          {auditResult && <Badge tone="accent">Diagnostic · {auditResult.score}/100</Badge>}
          <button type="button" className="lead-context-clear" onClick={() => setContext({ tier: null, audit: null })}>Remove</button>
        </div>
      )}
      <FieldInput {...field("fullName")} label="Full Name" type="text" autoComplete="name" maxLength={100} />
      <FieldInput {...field("email")} label="Work Email" type="email" inputMode="email" autoComplete="email" maxLength={200} />
      <FieldInput {...field("brandUrl")} label="Brand Website or Instagram Handle" type="text" autoComplete="url" placeholder="https://yourbrand.com or @handle" maxLength={200} />
      <FieldSelect {...field("primaryGoal")} ref={goalRef} label="Primary Goal" options={PRIMARY_GOALS} />
      <FieldSelect {...field("monthlyBudget")} label="Monthly Growth Budget" options={MONTHLY_BUDGETS} />
      {context.tier && <input type="hidden" name="scope" value={context.tier.slug} />}
      {context.audit && <input type="hidden" name="audit" value={context.audit} />}
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <label className="lead-honeypot" aria-hidden="true">Leave this blank<input name="website" autoComplete="off" tabIndex={-1} /></label>
      <Button type="submit" size="lg" className="lead-submit" disabled={sending} aria-disabled={sending}>
        {sending ? "Sending your request…" : "Send Project Inquiry →"}
      </Button>
      <WhatsAppConnect />
      <p className={`lead-status${notice ? " is-error" : ""}`} role="status" aria-live="polite">{notice}</p>
    </form>
  );
}
