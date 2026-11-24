import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Slot } from "radix-ui";
import Link from "@/components/Link";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type Base = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode };
type AsChild = Base & { asChild: true; href?: undefined };
type AsLink = Base & { href: string; asChild?: false } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;
type AsButton = Base & { href?: undefined; asChild?: false } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

/** Class string for anything that should look like a button. */
export const buttonClass = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
  cx("bz-btn", `bz-btn-${variant}`, `bz-btn-${size}`, className);

/**
 * Theme-locked button. Renders a <button>, a link when `href` is set (in-page
 * #anchors and external URLs use a plain <a>), or styles its single child
 * with `asChild`. Every size keeps a 44px minimum tap target (app/ui.css).
 */
export function Button(props: AsChild | AsLink | AsButton) {
  if (props.asChild) {
    const { variant, size, className, children } = props;
    return <Slot.Root className={buttonClass(variant, size, className)}>{children}</Slot.Root>;
  }
  if (props.href !== undefined) {
    const { variant, size, className, href, children, asChild: _asChild, ...rest } = props;
    void _asChild;
    const plain = href.startsWith("#") || /^https?:\/\//.test(href);
    return plain
      ? <a href={href} className={buttonClass(variant, size, className)} {...rest}>{children}</a>
      : <Link href={href} className={buttonClass(variant, size, className)} {...rest}>{children}</Link>;
  }
  const { variant, size, className, children, type = "button", asChild: _asChild, ...rest } = props;
  void _asChild;
  return <button type={type} className={buttonClass(variant, size, className)} {...rest}>{children}</button>;
}
