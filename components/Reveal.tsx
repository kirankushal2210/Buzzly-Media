"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useInViewOnce } from "@/hooks/use-in-view";

type RevealProps<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** Fades its content up the first time it enters the viewport (see `.reveal` in prototype.css). */
export function Reveal<T extends ElementType = "section">({ as, className = "", ...props }: RevealProps<T>) {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const Tag = (as ?? "section") as ElementType;
  return <Tag ref={ref} className={`${className} reveal${inView ? " in-view" : ""}`.trim()} {...props} />;
}
