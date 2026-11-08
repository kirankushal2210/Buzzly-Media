"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { validateInquiry, type InquiryErrors, type InquiryField } from "@/lib/inquiry-validation";

const SUCCESS_MESSAGE = "Thanks! Your message has reached Buzzly. Our team will review your project and get back to you shortly.";
const FIELD_ORDER: InquiryField[] = ["name", "email", "company", "interest", "message"];

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [touched, setTouched] = useState<Partial<Record<InquiryField, boolean>>>({});
  const [deliveryReady, setDeliveryReady] = useState<boolean | null>(null);
  const uid = useId();
  const errorId = (field: InquiryField) => `${uid}-${field}-error`;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact", { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<{ ready: boolean }> : null)
      .then(result => setDeliveryReady(Boolean(result?.ready)))
      .catch(() => { if (!controller.signal.aborted) setDeliveryReady(false); });
    return () => controller.abort();
  }, []);

  // Prefill the email handed over from the footer quick-inquiry field (?email=).
  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    const input = formRef.current?.elements.namedItem("email") as HTMLInputElement | null;
    if (email && input && !input.value) input.value = email.slice(0, 200);
  }, []);

  const readForm = () => Object.fromEntries(new FormData(formRef.current!).entries()) as Record<string, string>;

  /** Re-validate after blur, and live once a field has been touched. */
  const revalidate = (nextTouched = touched) => {
    const result = validateInquiry(readForm());
    const all: InquiryErrors = result.ok ? {} : result.errors;
    setErrors(Object.fromEntries(Object.entries(all).filter(([key]) => nextTouched[key as InquiryField])) as InquiryErrors);
  };

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const field = ((event.target as unknown) as HTMLInputElement).name as InquiryField;
    if (!FIELD_ORDER.includes(field)) return;
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    revalidate(nextTouched);
  };

  const onChange = (event: FormEvent<HTMLFormElement>) => {
    const field = ((event.target as unknown) as HTMLInputElement).name as InquiryField;
    if (touched[field]) revalidate();
    if (status === "sent" || status === "error") { setStatus("idle"); setNotice(""); }
  };

  const focusFirstError = (found: InquiryErrors) => {
    const first = FIELD_ORDER.find(field => found[field]);
    if (first) (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // double-submit guard (Enter key, double click)
    const data = readForm();
    const result = validateInquiry(data);
    if (!result.ok) {
      setTouched(Object.fromEntries(FIELD_ORDER.map(field => [field, true])));
      setErrors(result.errors);
      setStatus("error");
      setNotice("Please check the highlighted fields.");
      focusFirstError(result.errors);
      return;
    }
    if (deliveryReady === false) {
      setStatus("error");
      setNotice("Our inbox is being set up. Please try again a little later.");
      return;
    }

    inFlight.current = true;
    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.value, website: data.website ?? "" }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; fields?: InquiryErrors };
      if (!response.ok) {
        if (body.fields) { setErrors(body.fields); focusFirstError(body.fields); }
        throw new Error(body.error || "We couldn’t send your message just now. Please try again in a moment.");
      }
      formRef.current?.reset();
      setErrors({});
      setTouched({});
      setStatus("sent");
      setNotice(SUCCESS_MESSAGE);
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Please try again.");
    } finally {
      inFlight.current = false;
    }
  }

  const sending = status === "sending";
  const fieldProps = (field: InquiryField) => ({
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
    disabled: sending,
  });
  const fieldError = (field: InquiryField) => errors[field]
    ? <span className="field-error" id={errorId(field)}>{errors[field]}</span>
    : null;

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} onBlur={onBlur} onChange={onChange} noValidate aria-busy={sending}>
      <label><span className="field-label">Your name <span className="field-required" aria-hidden="true">*</span></span>
        <input {...fieldProps("name")} autoComplete="name" required maxLength={100} />
        {fieldError("name")}
      </label>
      <label><span className="field-label">Email <span className="field-required" aria-hidden="true">*</span></span>
        <input {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" required maxLength={200} />
        {fieldError("email")}
      </label>
      <label><span className="field-label">Company or brand <span className="field-optional">(optional)</span></span>
        <input {...fieldProps("company")} autoComplete="organization" maxLength={120} />
        {fieldError("company")}
      </label>
      <label><span className="field-label">What would you like to build? <span className="field-required" aria-hidden="true">*</span></span>
        <select {...fieldProps("interest")} required defaultValue="">
          <option value="" disabled>Select one</option>
          <option value="content">Content and social media</option>
          <option value="brand">Brand strategy</option>
          <option value="distribution">Distribution</option>
          <option value="partnership">Partnership</option>
          <option value="other">Something else</option>
        </select>
        {fieldError("interest")}
      </label>
      <label><span className="field-label">Tell us more <span className="field-required" aria-hidden="true">*</span></span>
        <textarea {...fieldProps("message")} required maxLength={5000} />
        {fieldError("message")}
      </label>
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" autoComplete="off" tabIndex={-1} /></label>
      <button type="submit" disabled={sending} aria-disabled={sending}>{sending ? "Sending…" : "Send inquiry ↗"}</button>
      {deliveryReady === false && <p className="contact-preview-note">Our inbox is being set up. You can still fill in the form; sending will open shortly.</p>}
      <p ref={statusRef} tabIndex={-1} className={`contact-status${status === "sent" ? " is-success" : status === "error" ? " is-error" : ""}`} role="status" aria-live="polite">{notice}</p>
    </form>
  );
}
