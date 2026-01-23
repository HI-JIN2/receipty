"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--ui-primary)_28%,transparent)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-primary)] text-[var(--ui-primary-ink)] shadow-[0_16px_40px_rgba(87,63,36,0.22)] hover:brightness-95 active:brightness-90",
  secondary:
    "border border-[var(--ui-border)] bg-[var(--ui-card)] text-[var(--foreground)] shadow-sm hover:bg-[var(--ui-card-solid)] active:bg-[var(--ui-card-solid)]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variantClass = variantClasses[variant];
  return (
    <button
      className={`${baseClasses} ${variantClass} ${className}`}
      {...props}
    />
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} />;
}
