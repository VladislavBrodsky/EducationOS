import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { Layers3 } from "lucide-react";

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes("button", `button-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classes("card", className)} {...props}>
      {children}
    </div>
  );
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "lime" | "peach";
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={classes("badge", `badge-${variant}`, className)} {...props}>
      {children}
    </span>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

/** Reference `${htmlFor}-hint` with aria-describedby when a hint is present. */
export function Field({ label, htmlFor, hint, children, className }: FieldProps) {
  return (
    <div className={classes("field", className)}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {hint && (
        <p className="field-hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div className="progress-group">
      <div className="progress-label">
        <span>{label}</span>
        <span>{Math.round(safeValue)}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <span className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <Layers3 size={24} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}
