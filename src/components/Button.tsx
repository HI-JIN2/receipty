"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-[var(--ui-radius-control)] text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,filter] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--ui-ring)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-primary)] text-[var(--ui-primary-ink)] shadow-[0_10px_24px_rgba(25,36,31,0.16)] hover:brightness-95 active:brightness-90",
  secondary:
    "border border-[var(--ui-secondary-border)] bg-[var(--ui-secondary-bg)] text-[var(--ui-secondary-text)] shadow-none hover:bg-[var(--ui-secondary-hover-bg)] active:bg-[var(--ui-secondary-hover-bg)]",
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
