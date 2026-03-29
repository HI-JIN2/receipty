"use client";

import * as React from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode | Array<React.ReactNode>;
  action?: React.ReactNode;
  visual?: React.ReactNode;
};

export default function PageHeader({ eyebrow, title, description, action, visual }: PageHeaderProps) {
  const lines = Array.isArray(description) ? description : description ? [description] : [];

  const left = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-[var(--ui-muted)]">
          <span className="h-1 w-4 bg-[var(--ui-primary)]/20" />
          {eyebrow}
          <span className="h-1 w-4 bg-[var(--ui-primary)]/20" />
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
    </>
  );

  return (
    <header className="ui-page-header">
      {visual ? (
        <div className="grid gap-6 sm:grid-cols-[1.15fr_0.85fr] sm:items-start">
          <div className="flex flex-col gap-4">{left}</div>
          <div className="sm:pt-1">{visual}</div>
        </div>
      ) : (
        left
      )}
    </header>
  );
}
