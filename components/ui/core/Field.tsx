import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { cx } from "./cx";

type FieldShell = { label: ReactNode; error?: string; errorId?: string; hint?: ReactNode; required?: boolean; className?: string };

/** Label, control, hint and inline error, in one consistent layout. */
export function Field({ label, error, errorId, hint, required, className, children }: FieldShell & { children: ReactNode }) {
  return (
    <label className={cx("bz-field", className)}>
      <span className="bz-field-label">
        {label}
        {required && <span className="bz-field-required" aria-hidden="true"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="bz-field-hint">{hint}</span>}
      {error && <span className="bz-field-error" id={errorId}>{error}</span>}
    </label>
  );
}

const describedBy = (error?: string, errorId?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error && errorId ? errorId : undefined,
});

/** Text, email, password… input with label and error state. */
export function FieldInput({ label, error, errorId, hint, required, className, ...input }: FieldShell & Omit<ComponentPropsWithoutRef<"input">, "className">) {
  return (
    <Field label={label} error={error} errorId={errorId} hint={hint} required={required} className={className}>
      <input className="bz-input" required={required} {...describedBy(error, errorId)} {...input} />
    </Field>
  );
}

type SelectProps = FieldShell & { options: readonly string[]; placeholder?: string; ref?: Ref<HTMLSelectElement> } & Omit<ComponentPropsWithoutRef<"select">, "className" | "children">;

/** Select with a disabled "Select one" placeholder, label and error state. */
export function FieldSelect({ label, error, errorId, hint, required, className, options, placeholder = "Select one", ref, ...select }: SelectProps) {
  return (
    <Field label={label} error={error} errorId={errorId} hint={hint} required={required} className={className}>
      <select ref={ref} className="bz-input bz-select" required={required} defaultValue="" {...describedBy(error, errorId)} {...select}>
        <option value="" disabled>{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </Field>
  );
}

/** Multi-line input with label and error state. */
export function FieldTextarea({ label, error, errorId, hint, required, className, ...textarea }: FieldShell & Omit<ComponentPropsWithoutRef<"textarea">, "className">) {
  return (
    <Field label={label} error={error} errorId={errorId} hint={hint} required={required} className={className}>
      <textarea className="bz-input bz-textarea" required={required} {...describedBy(error, errorId)} {...textarea} />
    </Field>
  );
}
