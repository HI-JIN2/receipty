"use client";

import { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";

import { PrimaryButton } from "@/components/Button";
import type { MovieMedium, MovieReceipt } from "@/features/receipts/movie/types";

type ReceiptState = MovieReceipt & {
  includeQRCode: boolean;
};

const pastelColors = [
  { name: "화이트", value: "#ffffff" },
  { name: "베이지", value: "#fef7ed" },
  { name: "핑크", value: "#fce7f3" },
  { name: "라벤더", value: "#f3e8ff" },
  { name: "민트", value: "#d1fae5" },
  { name: "스카이", value: "#e0f2fe" },
  { name: "피치", value: "#ffe4d6" },
];

const getBorderColor = (bgColor: string) => {
  const colorMap: Record<string, string> = {
    "#ffffff": "#1a1a1a",
    "#fef7ed": "#8b6914",
    "#fce7f3": "#c2185b",
    "#f3e8ff": "#7b2cbf",
    "#d1fae5": "#15803d",
    "#e0f2fe": "#0369a1",
    "#ffe4d6": "#ea580c",
  };
  return colorMap[bgColor] || "#1a1a1a";
};

export default function MovieReceiptClient() {
  const previewRef = useRef<HTMLDivElement>(null);

  const [receiptNumber, setReceiptNumber] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<ReceiptState>({
    title: "Movie Receipt",
    viewer: "",
    watchedAt: "",
    place: "",
    medium: "theater",
    note: "",
    format: "3inch",
    backgroundColor: "#ffffff",
    includeQRCode: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setReceipt((prev) => ({ ...prev, [name]: value }));
  };

  const getQRData = () => {
    const receiptNum = receiptNumber
      ? `발급번호: ${receiptNumber.toString().padStart(6, "0")}\n`
      : "";

    const mediumLabel: Record<MovieMedium, string> = {
      theater: "극장",
      ott: "OTT",
      other: "기타",
    };

    return [
      receiptNum,
      `제목: ${receipt.title || "Movie Receipt"}`,
      `관람자: ${receipt.viewer || "-"}`,
      `관람일: ${receipt.watchedAt || "-"}`,
      `장소: ${receipt.place || "-"}`,
      `형태: ${mediumLabel[receipt.medium]}`,
      receipt.note ? `메모: ${receipt.note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSave = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    setSaveMessage(null);

    try {
      const receiptPayload: MovieReceipt = {
        title: receipt.title,
        viewer: receipt.viewer,
        watchedAt: receipt.watchedAt,
        place: receipt.place,
        medium: receipt.medium,
        note: receipt.note,
        format: receipt.format,
        backgroundColor: receipt.backgroundColor,
      };

      let receiptNum: number | null = null;
      try {
        const res = await fetch("/api/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "movie", receipt: receiptPayload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "기록 저장 중 오류가 발생했습니다.");
        if (data.receiptNumber !== undefined) {
          receiptNum = data.receiptNumber;
          setReceiptNumber(data.receiptNumber);
        }
      } catch (err) {
        console.error("Supabase 저장 실패:", err);
        setSaveMessage("Supabase 기록에 실패했습니다. 이미지만 저장합니다.");
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toJpeg(previewRef.current, {
        quality: 0.95,
        backgroundColor: receipt.backgroundColor,
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `movie-receipt-${receipt.title || "receipt"}-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();

      setSaveMessage(receiptNum ? "이미지 저장 완료" : "이미지 저장 완료 (데이터 전송 실패)");
    } catch (err) {
      console.error("이미지 생성 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 sm:gap-10">
      <header className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-black/20" />
          Movie Receipt
          <span className="h-[1px] w-6 bg-black/20" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          영화 영수증 만들기
        </h1>
        <p className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
          관람 기록을 영수증처럼 뽑아, 다이어리나 티켓북에 붙여두세요.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="ui-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">영수증 에디터</h2>
          <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">
            제목/관람일/장소 같은 기본 정보를 채워보세요.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                배경색
              </label>
              <div className="flex flex-wrap gap-2">
                {pastelColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setReceipt((prev) => ({
                        ...prev,
                        backgroundColor: color.value,
                      }))
                    }
                    className={`h-8 w-8 rounded-2xl border-2 transition hover:scale-110 ${
                      receipt.backgroundColor === color.value
                        ? "border-[var(--foreground)] shadow-md"
                        : "border-black/10"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                영수증 제목
              </label>
              <input
                name="title"
                value={receipt.title}
                onChange={handleChange}
                className="ui-input text-sm text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  관람일
                </label>
                <input
                  type="date"
                  name="watchedAt"
                  value={receipt.watchedAt}
                  onChange={handleChange}
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  관람자
                </label>
                <input
                  name="viewer"
                  value={receipt.viewer}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  장소
                </label>
                <input
                  name="place"
                  value={receipt.place}
                  onChange={handleChange}
                  placeholder="메가박스 코엑스 / 집"
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  형태
                </label>
                <select
                  name="medium"
                  value={receipt.medium}
                  onChange={handleChange}
                  className="ui-input text-sm text-[var(--foreground)]"
                >
                  <option value="theater">극장</option>
                  <option value="ott">OTT</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                출력 포맷
              </label>
              <select
                name="format"
                value={receipt.format}
                onChange={handleChange}
                className="ui-input text-sm text-[var(--foreground)]"
              >
                <option value="3inch">3인치 (가로 3인치)</option>
                <option value="2inch">2인치 (가로 2인치)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                메모
              </label>
              <textarea
                name="note"
                value={receipt.note}
                onChange={handleChange}
                rows={3}
                placeholder="별점, 함께 본 사람, 인상적인 대사 등을 남겨보세요."
                className="ui-input text-sm text-[var(--foreground)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeQRCode"
                name="includeQRCode"
                checked={receipt.includeQRCode}
                onChange={(e) =>
                  setReceipt((prev) => ({
                    ...prev,
                    includeQRCode: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-black/20 text-[var(--ui-primary)]"
              />
              <label
                htmlFor="includeQRCode"
                className="cursor-pointer text-sm font-medium text-[var(--ui-muted)]"
              >
                QR 코드 포함
              </label>
            </div>
          </div>
        </div>

        <div className="ui-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">미리보기</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
              {receipt.format === "3inch" ? "3인치" : "2인치"}
            </span>
          </div>

          <div className="mt-4 flex justify-center overflow-x-auto">
            <div
              ref={previewRef}
              className="flex-shrink-0 text-stone-700"
              style={{
                backgroundColor: receipt.backgroundColor,
                width: receipt.format === "3inch" ? "288px" : "192px",
                minHeight: receipt.format === "3inch" ? "560px" : "480px",
                padding:
                  receipt.format === "3inch"
                    ? "24px 18px 32px 18px"
                    : "20px 14px 28px 14px",
                fontSize: receipt.format === "3inch" ? "14px" : "12px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "var(--font-book-cafe), var(--font-ui), system-ui, sans-serif",
                borderRadius: "0px",
                boxShadow: "none",
              }}
            >
              <div
                className="mb-4 border-b border-dashed pb-3 text-center"
                style={{ borderColor: getBorderColor(receipt.backgroundColor) }}
              >
                <p
                  className="font-semibold text-stone-900"
                  style={{
                    fontSize: receipt.format === "3inch" ? "18px" : "15px",
                  }}
                >
                  {receipt.title || "관람확인증"}
                </p>
                {receiptNumber !== null && (
                  <p
                    className="mt-1 text-stone-500"
                    style={{
                      fontSize: receipt.format === "3inch" ? "10px" : "9px",
                    }}
                  >
                    발급번호: {receiptNumber.toString().padStart(6, "0")}
                  </p>
                )}
              </div>

              <div
                className="space-y-1"
                style={{
                  fontSize: receipt.format === "3inch" ? "13px" : "11px",
                }}
              >
                <div className="flex justify-between">
                  <span className="text-stone-600">관람자</span>
                  <span className="font-semibold text-stone-900">{receipt.viewer || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">관람일</span>
                  <span className="font-semibold text-stone-900">{receipt.watchedAt || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">장소</span>
                  <span className="font-semibold text-stone-900">{receipt.place || "—"}</span>
                </div>
              <div className="flex justify-between">
                <span className="text-stone-600">형태</span>
                <span className="font-semibold text-stone-900">
                  {receipt.medium === "theater"
                    ? "극장"
                    : receipt.medium === "ott"
                      ? "OTT"
                      : "기타"}
                </span>
              </div>
              </div>

              {receipt.note && (
                <div className="mt-6">
                  <div
                    className="mb-3 border-b border-dashed"
                    style={{ borderColor: getBorderColor(receipt.backgroundColor) }}
                  />
                  <div
                    className="whitespace-pre-wrap break-words text-stone-800"
                    style={{
                      fontSize: receipt.format === "3inch" ? "13px" : "11px",
                      lineHeight: "1.6",
                    }}
                  >
                    {receipt.note}
                  </div>
                </div>
              )}

              {receipt.includeQRCode && (
                <div className="mt-6 flex flex-col items-center">
                  <div
                    style={{
                      width: receipt.format === "3inch" ? "120px" : "110px",
                      height: receipt.format === "3inch" ? "120px" : "110px",
                      backgroundColor: receipt.backgroundColor,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    <QRCodeSVG
                      value={getQRData()}
                      size={receipt.format === "3inch" ? 100 : 90}
                      level="M"
                      bgColor={receipt.backgroundColor}
                      fgColor="#1a1a1a"
                      includeMargin={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
            {saveMessage && (
              <p className="text-xs text-[var(--ui-muted)] sm:mr-auto sm:text-right">{saveMessage}</p>
            )}
            <PrimaryButton
              type="button"
              onClick={handleSave}
              disabled={isExporting}
              className="rounded-2xl px-6 py-3 text-sm uppercase tracking-wide"
            >
              {isExporting ? "저장 중..." : "JPEG로 저장"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
