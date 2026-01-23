"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type BarcodeProps = {
  value: string;
  width?: number;
  height?: number;
  className?: string;
  background?: string;
  lineColor?: string;
  margin?: number;
};

export default function Barcode({
  value,
  width = 1.2,
  height = 44,
  className,
  background = "transparent",
  lineColor = "#1a1a1a",
  margin = 0,
}: BarcodeProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!value) {
      el.innerHTML = "";
      return;
    }

    try {
      JsBarcode(el, value, {
        format: "CODE128",
        width,
        height,
        displayValue: false,
        background,
        lineColor,
        margin,
      });
    } catch (err) {
      console.error("barcode render error:", err);
      el.innerHTML = "";
    }
  }, [value, width, height, background, lineColor, margin]);

  return <svg ref={ref} className={className} />;
}
