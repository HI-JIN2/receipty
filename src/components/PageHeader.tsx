"use client";

import * as React from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode | Array<React.ReactNode>;
  action?: React.ReactNode;
};

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  const lines = Array.isArray(description) ? description : description ? [description] : [];

  return (
    <header className="ui-page-header">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
          {eyebrow}
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
        </p>

        <div className="relative mr-1 min-h-8">{action ?? null}</div>
      </div>

      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      {lines.length > 0 && (
        <div className="flex flex-col gap-1">
          {lines.map((line, idx) => (
            <p key={idx} className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
              {line}
            </p>
          ))}
        </div>
      )}
    </header>
  );
}
