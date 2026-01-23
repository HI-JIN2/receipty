type ReceiptColumnsProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default function ReceiptColumns({ left, right }: ReceiptColumnsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">{left}</div>
      <div className="flex min-w-0 flex-col gap-8">{right}</div>
    </div>
  );
}
