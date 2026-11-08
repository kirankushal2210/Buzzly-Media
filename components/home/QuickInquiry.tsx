"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

/** Footer inquiry anchor: takes an email and continues to the full contact form with it prefilled. */
export function QuickInquiry() {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    router.push(value ? `/contact?email=${encodeURIComponent(value)}` : "/contact");
  };

  return (
    <form className="quick-inquiry" onSubmit={submit} aria-label="Start an inquiry">
      <label htmlFor={id}>Start with your email</label>
      <div>
        <input id={id} type="email" autoComplete="email" placeholder="you@brand.com" value={email} onChange={event => setEmail(event.target.value)} maxLength={200} />
        <button type="submit">Continue ↗</button>
      </div>
    </form>
  );
}
