import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "accent" | "solid" | "muted" | "cream";

/** Editorial uppercase pill for statuses, tiers and categories (e.g. Needs Review, Most popular, Strategy). */
export function Badge({ tone = "neutral", as, className, children }: { tone?: BadgeTone; as?: ElementType; className?: string; children: ReactNode }) {
  const Tag = (as ?? "span") as ElementType;
  return <Tag className={cx("bz-badge", `bz-badge-${tone}`, className)}>{children}</Tag>;
}
