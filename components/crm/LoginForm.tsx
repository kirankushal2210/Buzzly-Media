"use client";

import { useState, type FormEvent } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    if (response?.ok) { window.location.assign("/admin"); return; }
    const body = await response?.json().catch(() => ({})) as { error?: string } | undefined;
    setError(body?.error || "Couldn’t sign in. Try again");
    setBusy(false);
  }

  return (
    <form className="crm-form" onSubmit={submit}>
      <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required autoFocus disabled={busy} aria-invalid={error ? true : undefined} aria-describedby={error ? "login-error" : undefined} /></label>
      <button className="crm-btn is-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      <p className="crm-error" id="login-error" role="alert">{error}</p>
    </form>
  );
}
