"use client";
import { useEffect, useState, type FormEvent } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deliveryReady, setDeliveryReady] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact", { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<{ ready: boolean }> : null)
      .then(result => setDeliveryReady(Boolean(result?.ready)))
      .catch(() => setDeliveryReady(false));
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setMessage("");
    if (deliveryReady !== true) {
      setState("error");
      setMessage("Inquiry delivery is not connected yet.");
      return;
    }
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "We could not send your message. Please try again.");
      form.reset(); setState("sent"); setMessage("Thanks. Your message has been sent to Buzzly.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Please try again."); }
  }
  return <form className="contact-form" onSubmit={submit}>
    {deliveryReady === false && <p className="contact-preview-note">Preview only: inquiry delivery will be available when Buzzly connects its inbox.</p>}
    <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
    <label>Company or brand<input name="company" autoComplete="organization" maxLength={120} /></label>
    <label>What would you like to build?<select name="interest" required defaultValue=""><option value="" disabled>Select one</option><option value="content">Content and social media</option><option value="brand">Brand strategy</option><option value="distribution">Distribution</option><option value="partnership">Partnership</option><option value="other">Something else</option></select></label>
    <label>Tell us more<textarea name="message" required minLength={20} maxLength={5000} /></label>
    <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" autoComplete="off" tabIndex={-1} /></label>
    <button type="submit" disabled={state === "sending" || deliveryReady !== true}>{state === "sending" ? "Sending…" : "Send inquiry ↗"}</button>
    <p className="contact-status" role="status" aria-live="polite">{message}</p>
  </form>;
}
