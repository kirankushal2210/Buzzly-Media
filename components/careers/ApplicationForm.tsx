"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { validateInquiry } from "@/lib/inquiry-validation";

/** Fired by an "Apply for this role" button so the form picks that role and scrolls into view. */
export const APPLY_EVENT = "buzzly:apply-role";

type Field = "name" | "email" | "role" | "area" | "portfolio" | "message";
type Errors = Partial<Record<Field, string>>;
const ORDER: Field[] = ["name", "email", "role", "area", "portfolio", "message"];
const OPEN_APPLICATION = "Open application";

const isUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
};

function check(data: Record<string, string>): Errors {
  const errors: Errors = {};
  if ((data.name ?? "").trim().length < 2) errors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((data.email ?? "").trim())) errors.email = "Please add an email we can reply to.";
  if (!data.role) errors.role = "Please choose a role, or an open application.";
  if (!data.area) errors.area = "Please choose the area that fits you best.";
  const portfolio = (data.portfolio ?? "").trim();
  if (!portfolio) errors.portfolio = "Please link to your work, CV or LinkedIn.";
  else if (!isUrl(portfolio)) errors.portfolio = "Please paste a full link starting with https://";
  if ((data.message ?? "").trim().length < 20) errors.message = "A few more words, please (at least 20 characters).";
  return errors;
}

/**
 * Careers application. Sends through the same email route as the contact form
 * (POST /api/contact, interest "careers"), with the role, area, link and
 * location written into the message so it arrives as one readable email.
 */
export function ApplicationForm({ roles, areas }: { roles: string[]; areas: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/contact").then(r => r.json() as Promise<{ ready?: boolean }>).then(b => setReady(b.ready !== false)).catch(() => setReady(null));
  }, []);

  useEffect(() => {
    const onApply = (event: Event) => {
      const role = (event as CustomEvent<string>).detail;
      const select = formRef.current?.elements.namedItem("role") as HTMLSelectElement | null;
      if (select && [...select.options].some(option => option.value === role)) select.value = role;
      const name = formRef.current?.elements.namedItem("name") as HTMLInputElement | null;
      window.setTimeout(() => name?.focus({ preventScroll: true }), 450);
    };
    window.addEventListener(APPLY_EVENT, onApply);
    return () => window.removeEventListener(APPLY_EVENT, onApply);
  }, []);

  const read = () => Object.fromEntries(new FormData(formRef.current!).entries()) as Record<string, string>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const data = read();
    const found = check(data);
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus("error");
      setNotice("Please check the highlighted fields.");
      const first = ORDER.find(field => found[field]);
      if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    if (ready === false) {
      setStatus("error");
      setNotice("We can’t receive applications right now. Please try again in a little while.");
      return;
    }
    const message = [
      `Applying for: ${data.role}`,
      `Area: ${data.area}`,
      `Work / CV: ${data.portfolio.trim()}`,
      data.location?.trim() ? `Based in: ${data.location.trim()}` : "",
      "",
      data.message.trim(),
    ].filter((line, index) => line || index === 4).join("\n");
    const payload = validateInquiry({ name: data.name, email: data.email, company: "", interest: "careers", message });
    if (!payload.ok) {
      setStatus("error");
      setNotice("Please shorten your message and try again.");
      return;
    }

    inFlight.current = true;
    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload.value, website: data.website ?? "" }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "We couldn’t send your application just now. Please try again in a moment.");
      formRef.current?.reset();
      setErrors({});
      setStatus("sent");
      setNotice("Thank you. Your application is in, and a person from our team will read it.");
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Please try again.");
    } finally {
      inFlight.current = false;
    }
  }

  const sending = status === "sending";
  const props = (field: Field) => ({
    name: field,
    disabled: sending,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${id}-${field}` : undefined,
  });
  const error = (field: Field) => errors[field] ? <span className="field-error" id={`${id}-${field}`}>{errors[field]}</span> : null;
  const required = <span className="field-required" aria-hidden="true">*</span>;

  return (
    <form ref={formRef} className="contact-form careers-form" onSubmit={submit} noValidate aria-busy={sending}
      onChange={() => { if (status !== "idle" && status !== "sending") { setStatus("idle"); setNotice(""); } }}>
      <div className="careers-form-row">
        <label><span className="field-label">Your name {required}</span>
          <input {...props("name")} autoComplete="name" required maxLength={100} />{error("name")}
        </label>
        <label><span className="field-label">Email {required}</span>
          <input {...props("email")} type="email" inputMode="email" autoComplete="email" required maxLength={200} />{error("email")}
        </label>
      </div>
      <div className="careers-form-row">
        <label><span className="field-label">Role {required}</span>
          <select {...props("role")} required defaultValue={roles.length ? "" : OPEN_APPLICATION}>
            {roles.length > 0 && <option value="" disabled>Select a role</option>}
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
            <option value={OPEN_APPLICATION}>Open application</option>
          </select>{error("role")}
        </label>
        <label><span className="field-label">Your area {required}</span>
          <select {...props("area")} required defaultValue="">
            <option value="" disabled>Select one</option>
            {areas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>{error("area")}
        </label>
      </div>
      <div className="careers-form-row">
        <label><span className="field-label">Link to your work, CV or LinkedIn {required}</span>
          <input {...props("portfolio")} type="url" inputMode="url" placeholder="https://" required maxLength={300} />{error("portfolio")}
        </label>
        <label><span className="field-label">Where are you based? <span className="field-optional">(optional)</span></span>
          <input name="location" disabled={sending} autoComplete="address-level2" maxLength={100} />
        </label>
      </div>
      <label><span className="field-label">Why Buzzly, and what would you bring? {required}</span>
        <textarea {...props("message")} required maxLength={4000} />{error("message")}
      </label>
      <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" autoComplete="off" tabIndex={-1} /></label>
      <button type="submit" disabled={sending} aria-disabled={sending}>{sending ? "Sending…" : "Send application ↗"}</button>
      {ready === false && <p className="contact-preview-note">We can’t receive applications right now. Please try again in a little while.</p>}
      <p ref={statusRef} tabIndex={-1} className={`contact-status${status === "sent" ? " is-success" : status === "error" ? " is-error" : ""}`} role="status" aria-live="polite">{notice}</p>
    </form>
  );
}
