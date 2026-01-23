"use client";

import { useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";

import Barcode from "@/components/Barcode";
import { PrimaryButton } from "@/components/Button";
import type { MovieMode, MovieReceipt } from "@/features/receipts/movie/types";

type MovieSearchItem = {
  id: number;
  titleKo: string;
  titleEn: string;
  releaseDate: string | null;
  posterUrl: string | null;
  ageRating: string | null;
};

type ReceiptState = MovieReceipt & {
  includeBarcode: boolean;
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

const PHOTO_TICKET_MM = { width: 55, height: 85 };
const MOVIE_RECEIPT_MM = { width: 60 };
const PX_PER_MM = 96 / 25.4;
const PHOTO_TICKET_PX = {
  width: Math.round(PHOTO_TICKET_MM.width * PX_PER_MM),
  height: Math.round(PHOTO_TICKET_MM.height * PX_PER_MM),
};
const MOVIE_RECEIPT_PX = {
  width: Math.round(MOVIE_RECEIPT_MM.width * PX_PER_MM),
};

export default function MovieReceiptClient() {
  const previewRef = useRef<HTMLDivElement>(null);

  const [receiptNumber, setReceiptNumber] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<MovieSearchItem[]>([]);
  const [movieSearching, setMovieSearching] = useState(false);
  const [movieSearchError, setMovieSearchError] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<ReceiptState>({
    mode: "receipt",
    title: "Movie Receipt",
    watchedAt: "",
    watchedTime: "",
    theater: "",
    medium: "theater",
    note: "",

    photoFormat: "2D",
    ageRating: "12세관람가",
    subtitle: "",
    showtime: "",
    session: "",
    hall: "",
    seat: "",
    ticketType: "일반 1명",
    brand: "Receipt Marker",

    format: "60mm",
    backgroundColor: "#ffffff",
    includeBarcode: true,
  });

  useEffect(() => {
    setReceipt((prev) => {
      if (prev.watchedAt && prev.watchedTime) return prev;
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");

      return {
        ...prev,
        watchedAt: prev.watchedAt || `${yyyy}-${mm}-${dd}`,
        watchedTime: prev.watchedTime || "09:00",
      };
    });
  }, []);

  const setMode = (mode: MovieMode) => {
    setReceipt((prev) => {
      if (mode === prev.mode) return prev;
      return {
        ...prev,
        mode,
        format: mode === "photo" ? "photo-ticket" : "60mm",
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setReceipt((prev) => ({ ...prev, [name]: value }));
  };

  const handleMovieSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = movieQuery.trim();
    if (!q) return;

    setMovieSearching(true);
    setMovieSearchError(null);
    try {
      const res = await fetch(`/api/movie-search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMovieSearchError(data?.error ?? "검색 중 오류가 발생했습니다.");
        setMovieResults([]);
        return;
      }
      setMovieResults((data.items ?? []) as MovieSearchItem[]);
    } catch {
      setMovieSearchError("네트워크 오류가 발생했습니다.");
      setMovieResults([]);
    } finally {
      setMovieSearching(false);
    }
  };

  const applyMovie = (item: MovieSearchItem) => {
    setReceipt((prev) => ({
      ...prev,
      title: item.titleKo || prev.title,
      subtitle: item.titleEn || prev.subtitle,
      ageRating: item.ageRating || prev.ageRating,
    }));
  };

  const getBarcodeValue = () => {
    const num = receiptNumber ? receiptNumber.toString().padStart(10, "0") : "0000000000";
    const mode = receipt.mode === "photo" ? "P" : "R";
    return `RM${mode}${num}`;
  };

  const handleSave = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    setSaveMessage(null);

    try {
      const receiptPayload: MovieReceipt = {
        mode: receipt.mode,
        title: receipt.title,
        watchedAt: receipt.watchedAt,
        watchedTime: receipt.watchedTime,
        theater: receipt.theater,
        medium: receipt.medium,
        note: receipt.note,

        photoFormat: receipt.photoFormat,
        ageRating: receipt.ageRating,
        subtitle: receipt.subtitle,
        showtime: receipt.showtime,
        session: receipt.session,
        hall: receipt.hall,
        seat: receipt.seat,
        ticketType: receipt.ticketType,
        brand: receipt.brand,

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
        pixelRatio: receipt.mode === "photo" ? 3 : 2,
      });

      const link = document.createElement("a");
      link.download = `movie-${receipt.mode}-${receipt.title || "receipt"}-${Date.now()}.jpg`;
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
            제목/관람일/극장명 같은 기본 정보를 채워보세요.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                TMDB 검색 (자동 채우기)
              </label>
              <form onSubmit={handleMovieSearch} className="flex items-stretch gap-2">
                <input
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  placeholder="영화 제목 검색"
                  className="ui-input w-auto min-w-0 flex-1 text-sm text-[var(--foreground)]"
                />
                <PrimaryButton
                  type="submit"
                  className="shrink-0 px-4 py-2 text-sm"
                  disabled={movieSearching}
                >
                  {movieSearching ? "검색 중" : "검색"}
                </PrimaryButton>
              </form>
              {movieSearchError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {movieSearchError}
                </div>
              )}
              {movieResults.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-3">
                  {movieResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyMovie(item)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-black/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[var(--foreground)]">
                          {item.titleKo}
                        </div>
                        <div className="truncate text-xs text-[var(--ui-muted)]">
                          {item.titleEn}
                          {item.ageRating ? ` · ${item.ageRating}` : ""}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-[var(--ui-primary)]">적용</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                모드
              </label>
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => setMode("receipt")}
                  className={`flex-1 rounded-[var(--ui-radius-control)] border px-3 py-2 text-sm font-semibold transition ${
                    receipt.mode === "receipt"
                      ? "border-[color-mix(in_srgb,var(--ui-primary)_55%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_10%,transparent)] text-[var(--foreground)]"
                      : "border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] text-[var(--ui-muted)] hover:bg-[var(--ui-secondary-hover-bg)]"
                  }`}
                >
                  영수증
                </button>
                <button
                  type="button"
                  onClick={() => setMode("photo")}
                  className={`flex-1 rounded-[var(--ui-radius-control)] border px-3 py-2 text-sm font-semibold transition ${
                    receipt.mode === "photo"
                      ? "border-[color-mix(in_srgb,var(--ui-primary)_55%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_10%,transparent)] text-[var(--foreground)]"
                      : "border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] text-[var(--ui-muted)] hover:bg-[var(--ui-secondary-hover-bg)]"
                  }`}
                >
                  포토티켓 (55×85mm)
                </button>
              </div>
            </div>
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                부제목 (영어)
              </label>
              <input
                name="subtitle"
                value={receipt.subtitle}
                onChange={handleChange}
                placeholder="English Title"
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
                  관람 시간
                </label>
                <input
                  type="time"
                  name="watchedTime"
                  value={receipt.watchedTime}
                  onChange={handleChange}
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  인원
                </label>
                <input
                  name="ticketType"
                  value={receipt.ticketType}
                  onChange={handleChange}
                  placeholder="1명"
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  극장명
                </label>
                <input
                  name="theater"
                  value={receipt.theater}
                  onChange={handleChange}
                  placeholder="CGV 용산아이파크몰"
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            <input type="hidden" name="medium" value={receipt.medium} />

            {(receipt.mode === "photo" || receipt.mode === "receipt") && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  티켓 항목
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    name="photoFormat"
                    value={receipt.photoFormat}
                    onChange={handleChange}
                    className="ui-input text-sm text-[var(--foreground)]"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX</option>
                    <option value="SCREENX">SCREENX</option>
                    <option value="4DX SCREENX">4DX SCREENX</option>
                    <option value="DOLBY">DOLBY</option>
                    <option value="DOLBY ATMOS">DOLBY ATMOS</option>
                    <option value="MX4D">MX4D</option>
                    <option value="기타">기타</option>
                  </select>
                  <select
                    name="ageRating"
                    value={receipt.ageRating}
                    onChange={handleChange}
                    className="ui-input text-sm text-[var(--foreground)]"
                  >
                    <option value="">등급 선택</option>
                    <option value="전체관람가">전체관람가</option>
                    <option value="12세관람가">12세관람가</option>
                    <option value="15세관람가">15세관람가</option>
                    <option value="청소년관람불가">청소년관람불가</option>
                  </select>
                  <input
                    name="showtime"
                    value={receipt.showtime}
                    onChange={handleChange}
                    placeholder="상영시간 (예: 20:30~23:07)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <input
                    name="session"
                    value={receipt.session}
                    onChange={handleChange}
                    placeholder="회차 (예: 5회)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <input
                    name="hall"
                    value={receipt.hall}
                    onChange={handleChange}
                    placeholder="상영관 (예: 2관)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <input
                    name="seat"
                    value={receipt.seat}
                    onChange={handleChange}
                    placeholder="좌석 (예: E열 07번)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <input
                    name="brand"
                    value={receipt.brand}
                    onChange={handleChange}
                    placeholder="하단 문구 (예: Receipt Marker)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>
            )}

            <input type="hidden" name="format" value={receipt.format} />

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
                id="includeBarcode"
                name="includeBarcode"
                checked={receipt.includeBarcode}
                onChange={(e) =>
                  setReceipt((prev) => ({
                    ...prev,
                    includeBarcode: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-black/20 text-[var(--ui-primary)]"
              />
              <label
                htmlFor="includeBarcode"
                className="cursor-pointer text-sm font-medium text-[var(--ui-muted)]"
              >
                바코드 포함
              </label>
            </div>
          </div>
        </div>

        <div className="ui-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">미리보기</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
              {receipt.mode === "photo"
                ? "포토티켓 55×85mm"
                : "60mm"}
            </span>
          </div>

          <div className="mt-4 flex justify-center overflow-x-auto">
            <div
              ref={previewRef}
              className="flex-shrink-0 text-stone-700"
              style={{
                backgroundColor: receipt.backgroundColor,
                width:
                  receipt.mode === "photo"
                    ? `${PHOTO_TICKET_PX.width}px`
                    : `${MOVIE_RECEIPT_PX.width}px`,
                height:
                  receipt.mode === "photo"
                    ? `${PHOTO_TICKET_PX.height}px`
                    : undefined,
                minHeight:
                  receipt.mode === "photo"
                    ? undefined
                    : "560px",
                padding:
                  receipt.mode === "photo"
                    ? "12px 10px 12px 10px"
                    : "18px 14px 20px 14px",
                fontSize:
                  receipt.mode === "photo" ? "13px" : "16px",
                display: "flex",
                flexDirection: "column",
                fontFamily:
                  receipt.mode === "photo"
                    ? "var(--font-ui), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
                    : "var(--font-ticket), var(--font-ui), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
                borderRadius: receipt.mode === "photo" ? "12px" : "0px",
                boxShadow: "none",
              }}
            >
              {receipt.mode === "photo" ? (
                <>
                  {/* Top Section: Format, Age Rating, Title */}
                  <div className="mb-1.5 flex items-start justify-between">
                    <div className="text-[11px] font-semibold text-stone-900">
                      {receipt.photoFormat || "2D"}
                    </div>
                    <div className="text-[11px] font-semibold text-stone-900">
                      {receipt.ageRating || "12세관람가"}
                    </div>
                  </div>
                  <div className="mb-1.5">
                    <div
                      className="font-semibold text-stone-900"
                      style={{ fontSize: "15px", lineHeight: "1.2", marginBottom: "1px" }}
                    >
                      {receipt.title || "Movie Title"}
                    </div>
                    <div
                      className="text-stone-700"
                      style={{ fontSize: "11px", lineHeight: "1.2" }}
                    >
                      {receipt.subtitle || receipt.title || "English Title"}
                    </div>
                  </div>
                  <div
                    className="mb-1.5 border-b border-stone-900"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Middle Section: Cinema, Date, Showtime, Hall, Seat, Ticket Type */}
                  <div className="space-y-0.5" style={{ fontSize: "11px" }}>
                    <div className="text-stone-900">
                      {(() => {
                        const place = receipt.theater || "극장명";
                        let dateStr = "2023.05.03";
                        let dayStr = "수";
                        if (receipt.watchedAt) {
                          try {
                            const date = new Date(receipt.watchedAt);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            dateStr = `${year}.${month}.${day}`;
                            dayStr = date.toLocaleDateString("ko-KR", { weekday: "short" });
                          } catch {
                            // Use default
                          }
                        }
                        return `${place} | ${dateStr} (${dayStr})`;
                      })()}
                    </div>
                    <div
                      className="border-b border-stone-900"
                      style={{ borderWidth: "1px", margin: "3px 0" }}
                    />
                    <div className="text-stone-900">
                      {(receipt.showtime || "20:30~23:07") +
                        (receipt.session ? ` (${receipt.session})` : " (5회)")}
                    </div>
                    <div className="text-stone-900">
                      {receipt.hall || "2관"}
                    </div>
                    <div className="text-stone-900">
                      {receipt.seat || "E열 07번"}
                    </div>
                    <div className="text-stone-900">
                      {receipt.ticketType || "일반 1명"}
                    </div>
                  </div>

                </>
              ) : (
                <>
                  {/* Header: ★ RVIP 영화입장권 ★ */}
                  <div
                    className="mb-2 text-center text-stone-900"
                    style={{
                      fontWeight: 700,
                      fontSize: receipt.format === "3inch" ? "22px" : "20px",
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2",
                    }}
                  >
                    ★ 영화입장권 ★
                  </div>

                  {/* Issuance Details */}
                  <div
                    className="mb-1 flex w-full items-baseline justify-between gap-2 whitespace-nowrap text-stone-700"
                    style={{ fontSize: "11px", fontWeight: 400 }}
                  >
                    <span>
                      {(() => {
                        const time = receipt.watchedTime || "09:00";
                        if (!receipt.watchedAt) return `2026-01-23 ${time}`;
                        try {
                          const date = new Date(receipt.watchedAt);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          return `${year}-${month}-${day} ${time}`;
                        } catch {
                          return `2026-01-23 ${time}`;
                        }
                      })()}
                    </span>
                    <span>(BOX_KIOSK_A5)</span>
                    <span>[전체발권]</span>
                  </div>

                  {/* Dashed Line */}
                  <div
                    className="mb-3 border-b border-dashed border-stone-400"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Format and Rating */}
                  <div
                    className="mb-3 text-left text-stone-900"
                    style={{
                      fontWeight: 400,
                      fontSize: receipt.format === "3inch" ? "12px" : "11px",
                    }}
                  >
                    {receipt.photoFormat || "2D"}
                    {receipt.photoFormat && receipt.ageRating ? ", " : ""}
                    {receipt.ageRating || "전체관람가"}
                  </div>

                  {/* Movie Title */}
                  <div className="mb-2">
                    <div
                      className="text-stone-900"
                      style={{
                        fontFamily: "var(--font-ticket), var(--font-ui), ui-sans-serif, system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: receipt.format === "3inch" ? "24px" : "21px",
                        lineHeight: "1.2",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {receipt.title || "영화 제목"}
                    </div>
                    {receipt.subtitle && (
                      <div
                        className="mt-1 text-stone-700"
                        style={{
                          fontWeight: 400,
                          fontSize: receipt.format === "3inch" ? "12px" : "11px",
                          lineHeight: "1.3",
                          paddingLeft: "2px",
                        }}
                      >
                        {receipt.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Showtime Info (Black Box) */}
                  {receipt.showtime && (
                    <div
                      className="my-2 inline-block w-fit max-w-full bg-stone-900 px-1.5 py-1 text-left text-white"
                      style={{
                        fontWeight: 500,
                        fontSize: receipt.format === "3inch" ? "13px" : "12px",
                        lineHeight: "1.15",
                      }}
                    >
                      {(() => {
                        let dateStr = "";
                        let dayStr = "";
                        if (receipt.watchedAt) {
                          try {
                            const date = new Date(receipt.watchedAt);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            dateStr = `${year}.${month}.${day}`;
                            dayStr = date.toLocaleDateString("ko-KR", { weekday: "short" });
                          } catch {
                            // ignore
                          }
                        }
                        const session = receipt.session || "";
                        const showtime = receipt.showtime || "";
                        if (dateStr && showtime) {
                          return `${dateStr}(${dayStr}) ${session} ${showtime}`;
                        }
                        if (showtime) {
                          return `${session} ${showtime}`.trim();
                        }
                        return "";
                      })()}
                    </div>
                  )}

                  {/* Hall and Seat */}
                  {(receipt.hall || receipt.seat) && (
                    <div
                      className="mb-2 text-left text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: receipt.format === "3inch" ? "12px" : "11px",
                      }}
                    >
                      {[receipt.hall, receipt.seat].filter(Boolean).join(" ")}
                    </div>
                  )}

                  {/* Dashed Line */}
                  <div
                    className="my-2 border-b border-dashed border-stone-400"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Total People */}
                  {receipt.ticketType && (
                    <div
                      className="mb-2 text-left text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: receipt.format === "3inch" ? "12px" : "11px",
                      }}
                    >
                      {(() => {
                        const match = receipt.ticketType.match(/(\d+)\s*명/);
                        const count = match ? match[1] : "1";
                        return `총인원 ${count}명 (일반 ${count}명)`;
                      })()}
                    </div>
                  )}

                  {/* Theater Info */}
                  {receipt.theater && (
                    <div
                      className="mb-2 text-left text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: receipt.format === "3inch" ? "12px" : "11px",
                      }}
                    >
                      {receipt.theater}
                      {receiptNumber !== null && (
                        <span
                          style={{
                            marginLeft: "4px",
                          }}
                        >
                          [{(() => {
                            const num = receiptNumber.toString().padStart(10, "0");
                            return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
                          })()}]
                        </span>
                      )}
                    </div>
                  )}

                  {/* Dashed Line */}
                  <div
                    className="my-2 border-b border-dashed border-stone-400"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Disclaimer/Notes */}
                  {receipt.note && (
                    <div
                      className="mb-2 text-left text-stone-700"
                      style={{
                        fontWeight: 400,
                        fontSize: receipt.format === "3inch" ? "10px" : "9px",
                        lineHeight: "1.5",
                      }}
                    >
                      {receipt.note.split("\n").map((line, idx) => (
                        <div key={idx} className="mb-1">
                          * {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dashed Line before barcode */}
                  {receipt.includeBarcode && (
                    <div
                      className="mb-2 border-b border-dashed border-stone-400"
                      style={{ borderWidth: "1px" }}
                    />
                  )}
                </>
              )}

              {receipt.mode === "receipt" && receipt.note && (
                <div className="mt-4 mb-2">
                  <div
                    className="whitespace-pre-wrap break-words text-stone-700"
                    style={{
                      fontSize: receipt.format === "3inch" ? "10px" : "9px",
                      lineHeight: "1.5",
                    }}
                  >
                    {receipt.note}
                  </div>
                </div>
              )}

              {receipt.includeBarcode && (
                <div className="mt-4 flex flex-col items-center">
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: receipt.backgroundColor,
                      padding: "6px 6px",
                    }}
                  >
                    <Barcode
                      value={getBarcodeValue()}
                      width={receipt.mode === "photo" ? 1.25 : 1.45}
                      height={receipt.mode === "photo" ? 32 : 40}
                      background={receipt.backgroundColor}
                      lineColor="#1a1a1a"
                      className="mx-auto"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-stone-700">
                    NO. {receiptNumber !== null ? receiptNumber.toString().padStart(6, "0") : "------"}
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
