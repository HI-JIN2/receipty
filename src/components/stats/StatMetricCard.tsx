type StatMetricCardProps = {
  label: string;
  value: number | string;
  note?: string;
};

export default function StatMetricCard({ label, value, note }: StatMetricCardProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="ui-card p-6">
      <p className="text-sm font-medium text-[var(--ui-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{displayValue}</p>
      {note ? <p className="mt-2 text-xs text-[var(--ui-muted)]">{note}</p> : null}
    </div>
  );
}
