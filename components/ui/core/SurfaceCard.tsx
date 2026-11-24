import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cx } from "./cx";

type SurfaceCardProps<T extends ElementType> = { as?: T; className?: string; tone?: "raised" | "flat" } & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** The bordered dark surface used for cards, panels and tables. Pass `as` to render a list item, link, section, etc. */
export function SurfaceCard<T extends ElementType = "div">({ as, className, tone = "raised", ...rest }: SurfaceCardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cx("bz-card", tone === "flat" && "bz-card-flat", className)} {...rest} />;
}
