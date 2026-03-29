"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--ui-ring)] focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-primary)] text-[var(--ui-primary-ink)] shadow-[var(--retro-outset-shadow)] active:shadow-[var(--retro-inset-shadow)] active:translate-x-[1px] active:translate-y-[1px] px-4 py-2",
  secondary:
    "bg-[var(--ui-secondary-bg)] text-[var(--ui-secondary-text)] shadow-[var(--retro-outset-shadow)] active:shadow-[var(--retro-inset-shadow)] active:translate-x-[1px] active:translate-y-[1px] px-4 py-2",
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
