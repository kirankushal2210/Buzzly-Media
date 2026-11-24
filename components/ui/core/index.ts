/**
 * Buzzly's shared UI primitives, used by the public site and the client portal.
 * They live in ui/core/ because components/ui/ already holds shadcn's
 * button.tsx, badge.tsx and field.tsx, and Button.tsx would be the same file
 * on case-insensitive file systems (Windows, macOS). Styles: app/ui.css.
 */
export { Button, buttonClass, type ButtonSize, type ButtonVariant } from "./Button";
export { SurfaceCard } from "./SurfaceCard";
export { Badge, type BadgeTone } from "./Badge";
export { Field, FieldInput, FieldSelect, FieldTextarea } from "./Field";
export { Marquee } from "./Marquee";
