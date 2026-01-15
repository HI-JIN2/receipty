"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-900 text-amber-50 shadow-[0_8px_18px_rgba(193,160,120,0.3)] hover:bg-amber-950",
  secondary:
    "border border-amber-900/20 bg-white/50 text-amber-900/80 hover:border-amber-900/40 hover:bg-white/80",
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


