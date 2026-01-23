import type { ComponentPropsWithoutRef } from "react";

type ReceiptCardProps = ComponentPropsWithoutRef<"div">;

export default function ReceiptCard({ className, ...props }: ReceiptCardProps) {
  return (
    <div
      className={`ui-card min-w-0 overflow-hidden${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
