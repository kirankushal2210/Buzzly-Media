"use client";

import { useState } from "react";
import { Button } from "@/components/ui/core";
import { formatPortalDate, formatRupees, clientProfile, type Invoice } from "@/data/portal-mock";

type State = "idle" | "preparing" | "done";

/**
 * Downloads a plain-text demo receipt generated in the browser.
 * TODO: Serve real PDF receipts from the billing backend in the next phase.
 */
export function ReceiptButton({ invoice }: { invoice: Invoice }) {
  const [state, setState] = useState<State>("idle");

  const download = () => {
    if (state === "preparing") return;
    setState("preparing");
    window.setTimeout(() => {
      const text = [
        "BUZZLY MEDIA — DEMO RECEIPT (sample data, not a tax document)",
        "",
        `Receipt:  ${invoice.id}`,
        `Client:   ${clientProfile.brandName}`,
        `Plan:     ${clientProfile.planName}`,
        `Period:   ${invoice.period}`,
        `Issued:   ${formatPortalDate(invoice.issuedOn)}`,
        `Amount:   ${formatRupees(invoice.amount)}`,
        `Status:   ${invoice.status}`,
      ].join("\n");
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
      const link = Object.assign(document.createElement("a"), { href: url, download: `${invoice.id}-receipt.txt` });
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setState("done");
    }, 600);
  };

  const label = state === "preparing" ? "Preparing…" : state === "done" ? "Downloaded ✓" : "Download receipt";
  return <Button size="sm" variant="ghost" onClick={download} disabled={state === "preparing"} aria-live="polite">{label}</Button>;
}
