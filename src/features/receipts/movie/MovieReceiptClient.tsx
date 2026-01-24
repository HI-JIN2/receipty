"use client";

import { useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";

import Barcode from "@/components/Barcode";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SearchIcon from "@/components/icons/SearchIcon";
import ReceiptCard from "@/features/receipts/shared/ReceiptCard";
import ReceiptColumns from "@/features/receipts/shared/ReceiptColumns";
import { PASTEL_COLORS } from "@/features/receipts/shared/palette";
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

const PHOTO_TICKET_MM = { width: 55, height: 85 };
const MINI_RECEIPT_MM = { width: 85, height: 60 };
const MOVIE_RECEIPT_MM = { width: 60 };
const PX_PER_MM = 96 / 25.4;
const PHOTO_TICKET_PX = {
  width: Math.round(PHOTO_TICKET_MM.width * PX_PER_MM),
  height: Math.round(PHOTO_TICKET_MM.height * PX_PER_MM),
};
const MINI_RECEIPT_PX = {
  width: Math.round(MINI_RECEIPT_MM.width * PX_PER_MM),
  height: Math.round(MINI_RECEIPT_MM.height * PX_PER_MM),
};
const MOVIE_RECEIPT_PX = {
  width: Math.round(MOVIE_RECEIPT_MM.width * PX_PER_MM),
};

const MOVIE_RECEIPT_DISCLAIMER_LINES = [
  "티켓 미지참시 교환, 환불 불가",
  "결제수단 변경 및 교환, 환불은 상영시간 전 구매한 매장에서 가능",
  "입장지연에 따른 관람 불편 최소화를 위해 본영화는 약 10여분 후에 시작됩니다.",
];

export default function MovieReceiptClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [receiptNumber, setReceiptNumber] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<MovieSearchItem[]>([]);
  const [movieSearching, setMovieSearching] = useState(false);
  const [movieSearchError, setMovieSearchError] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<ReceiptState>({
    mode: "receipt",
    tmdbId: null,
    posterUrl: null,
    releaseDate: null,
    title: "Movie Title",
    watchedAt: "",
    watchedTime: "",
    issuedAt: "",
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

    format: "60mm",
    backgroundColor: "#ffffff",
    includeBarcode: true,
  });

  const switchToManualMovieInput = () => {
    setMovieQuery("");
    setMovieResults([]);
    setMovieSearchError(null);
    setReceipt((prev) => ({
      ...prev,
      tmdbId: null,
      posterUrl: null,
      releaseDate: null,
    }));

    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  const normalizeTimeHHMM = (value: string) => {
    const v = value.trim();
    if (!v) return "";

    const hhmm = v.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) {
      const hh = Math.min(23, Math.max(0, Number(hhmm[1])));
      const mm = Math.min(59, Math.max(0, Number(hhmm[2])));
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    const digits = v.replace(/[^0-9]/g, "");
    if (digits.length === 3 || digits.length === 4) {
      const raw = digits.padStart(4, "0");
      const hh = Math.min(23, Math.max(0, Number(raw.slice(0, 2))));
      const mm = Math.min(59, Math.max(0, Number(raw.slice(2, 4))));
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    return v;
  };

  const [showtimeStartInput, setShowtimeStartInput] = useState("");
  const [showtimeEndInput, setShowtimeEndInput] = useState("");

  useEffect(() => {
    const match = receipt.showtime.match(/(\d{2}:\d{2})~(\d{2}:\d{2})/);
    const first = receipt.showtime.match(/\d{2}:\d{2}/)?.[0] ?? "";

    if (match) {
      setShowtimeStartInput(match[1]);
      setShowtimeEndInput(match[2]);
      return;
    }

    if (first && !showtimeStartInput && !showtimeEndInput) {
      setShowtimeStartInput(first);
      setShowtimeEndInput("");
    }
    // Intentionally don't overwrite while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.showtime]);

  const commitShowtime = (rawStart: string, rawEnd: string) => {
    const start = normalizeTimeHHMM(rawStart);
    const end = normalizeTimeHHMM(rawEnd);

    setShowtimeStartInput(start);
    setShowtimeEndInput(end);

    const combined = start && end ? `${start}~${end}` : start;
    setReceipt((prev) => ({ ...prev, showtime: combined }));
  };

  const normalizedTitle = receipt.title.trim().toLowerCase();
  const normalizedSubtitle = receipt.subtitle.trim().toLowerCase();
  const shouldShowSubtitle =
    normalizedSubtitle.length > 0 && normalizedSubtitle !== normalizedTitle;

  const getShowtimeLine = () => {
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

    const session = receipt.session?.trim() ?? "";
    const showtime = receipt.showtime?.trim() ?? "";

    const parts = [dateStr ? `${dateStr}(${dayStr})` : "", session, showtime].filter(Boolean);

    return parts.join(" ").trim();
  };

  const getTotalPeopleLine = () => {
    const match = receipt.ticketType.match(/(\d+)\s*명/);
    const count = match ? match[1] : "1";
    return `총인원 ${count}명 (일반 ${count}명)`;
  };

  const getReceiptNumberTag = () => {
    if (receiptNumber === null) return "[---]";
    const num = receiptNumber.toString().padStart(10, "0");
    return `[${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}]`;
  };

  const getSerialNumber = () => {
    if (receiptNumber === null) return "----";

    const date = receipt.issuedAt ? new Date(receipt.issuedAt) : new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const seq = receiptNumber.toString().padStart(4, "0");
    return `${yyyy}-${mm}${dd}-${seq}`;
  };

  const getMiniSeatLine = () => {
    const hall = receipt.hall?.trim() || "1관";
    const seat = (receipt.seat?.trim() || "E열 07").replace(/번\s*$/u, "");
    return `${hall} ${seat}`.trim();
  };

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
        includeBarcode: mode === "mini" ? false : prev.includeBarcode,
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
      tmdbId: item.id,
      posterUrl: item.posterUrl,
      releaseDate: item.releaseDate,
      title: item.titleKo || prev.title,
      subtitle: item.titleEn || prev.subtitle,
      ageRating: item.ageRating || prev.ageRating,
    }));

    setMovieResults([]);
    setMovieSearchError(null);
  };

  const getBarcodeValue = () => {
    const num = receiptNumber ? receiptNumber.toString().padStart(10, "0") : "0000000000";
    const mode = receipt.mode === "photo" ? "P" : "R";
    return `RM${mode}${num}`;
  };

  const handleSave = async () => {
    if (!previewRef.current) return;

    const issuedAtIso = new Date().toISOString();
    setReceipt((prev) => ({ ...prev, issuedAt: issuedAtIso }));

    setIsExporting(true);
    setSaveMessage(null);

    try {
      const receiptPayload: MovieReceipt = {
        mode: receipt.mode,
        tmdbId: receipt.tmdbId,
        posterUrl: receipt.posterUrl,
        releaseDate: receipt.releaseDate,
        title: receipt.title,
        watchedAt: receipt.watchedAt,
        watchedTime: receipt.watchedTime,
        issuedAt: issuedAtIso,
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
        pixelRatio: receipt.mode === "photo" || receipt.mode === "mini" ? 3 : 2,
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

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) {
      alert("링크를 가져올 수 없습니다.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      } catch (err) {
        console.error("Clipboard API 실패:", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        throw new Error("execCommand failed");
      }
    } catch (err) {
      console.error("링크 복사 실패:", err);
      alert(`링크: ${url}\n\n위 링크를 수동으로 복사해주세요.`);
    }
  };

  return (
    <section className="flex flex-col gap-6 sm:gap-10">
      <PageHeader
        eyebrow="Movie Receipt Maker"
        title="영화 영수증 만들기"
        description={["관람 기록을 영수증처럼 뽑아, 다이어리나 티켓북에 붙여두세요.", "영수증/미니 영수증/포토티켓 모드를 지원해요."]}
        action={
          <>
            <SecondaryButton
              onClick={handleShare}
              className="group flex items-center gap-2 px-3 py-1.5 text-xs active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
              aria-label="링크 공유"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              <span className="hidden sm:inline">공유</span>
            </SecondaryButton>
            {copySuccess && (
              <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
                <div className="relative whitespace-nowrap rounded-lg bg-[var(--foreground)] px-3 py-2 text-[11px] text-white shadow-lg sm:text-xs">
                  링크 복사
                  <div className="absolute left-1/2 -top-1 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[var(--foreground)]" />
                </div>
              </div>
            )}
          </>
        }
      />

      <ReceiptColumns
        left={
          <ReceiptCard className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">영수증 에디터</h2>
            <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">
              제목/관람일/극장명 같은 기본 정보를 채워보세요.
            </p>

            <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                TMDB 검색 (자동 채우기)
              </label>
              <button
                type="button"
                onClick={switchToManualMovieInput}
                className="-mt-1 self-start text-xs font-semibold text-[var(--ui-primary)] hover:underline"
              >
                검색에 없나요? 직접 입력
              </button>
              <form onSubmit={handleMovieSearch} className="flex items-stretch gap-2">
                <input
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  placeholder="영화 제목 검색"
                  className="ui-input w-auto min-w-0 flex-1 text-sm text-[var(--foreground)]"
                />
                <PrimaryButton
                  type="submit"
                  aria-label="검색"
                  className="shrink-0 px-4 py-2 text-sm"
                  disabled={movieSearching}
                >
                  {movieSearching ? "검색 중" : <SearchIcon className="h-4 w-4" />}
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
              <div className="flex w-full flex-wrap gap-2">
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
                  onClick={() => setMode("mini")}
                  className={`flex-1 rounded-[var(--ui-radius-control)] border px-3 py-2 text-sm font-semibold transition ${
                    receipt.mode === "mini"
                      ? "border-[color-mix(in_srgb,var(--ui-primary)_55%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_10%,transparent)] text-[var(--foreground)]"
                      : "border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] text-[var(--ui-muted)] hover:bg-[var(--ui-secondary-hover-bg)]"
                  }`}
                >
                  미니 영수증
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
                {PASTEL_COLORS.map((color) => (
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
                영화 제목
              </label>
              <input
                ref={titleInputRef}
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

            {(receipt.mode === "photo" || receipt.mode === "receipt" || receipt.mode === "mini") && (
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
                    name="session"
                    value={receipt.session}
                    onChange={handleChange}
                    placeholder="회차 (예: 5회)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <div className="flex min-w-0 items-center gap-2">
                    <input
                      type="text"
                      value={showtimeStartInput}
                      onChange={(e) => setShowtimeStartInput(e.target.value)}
                      onBlur={() => commitShowtime(showtimeStartInput, showtimeEndInput)}
                      inputMode="numeric"
                      placeholder="20:30"
                      className="ui-input w-1/2 text-sm text-[var(--foreground)]"
                      aria-label="상영 시작"
                    />
                    <span className="text-xs font-semibold text-black/40">~</span>
                    <input
                      type="text"
                      value={showtimeEndInput}
                      onChange={(e) => setShowtimeEndInput(e.target.value)}
                      onBlur={() => commitShowtime(showtimeStartInput, showtimeEndInput)}
                      inputMode="numeric"
                      placeholder="22:30"
                      className="ui-input w-1/2 text-sm text-[var(--foreground)]"
                      aria-label="상영 종료"
                    />
                  </div>
                  <input
                    name="hall"
                    value={receipt.hall}
                    onChange={handleChange}
                    placeholder="상영관 (예: 1관)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                  <input
                    name="seat"
                    value={receipt.seat}
                    onChange={handleChange}
                    placeholder="좌석 (예: E열 07)"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>
            )}

            <input type="hidden" name="format" value={receipt.format} />

            {receipt.mode !== "mini" && (
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
            )}

            {receipt.mode !== "mini" && (
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
            )}
            </div>
          </ReceiptCard>
        }
        right={
          <ReceiptCard className="p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">미리보기</h2>
              <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                {receipt.mode === "photo"
                  ? "포토티켓 55×85mm"
                  : receipt.mode === "mini"
                    ? "미니 85×60mm"
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
                      : receipt.mode === "mini"
                        ? `${MINI_RECEIPT_PX.width}px`
                        : `${MOVIE_RECEIPT_PX.width}px`,
                  height:
                    receipt.mode === "photo"
                      ? `${PHOTO_TICKET_PX.height}px`
                      : receipt.mode === "mini"
                        ? `${MINI_RECEIPT_PX.height}px`
                        : undefined,
                  padding:
                    receipt.mode === "photo"
                      ? "12px 10px 12px 10px"
                      : receipt.mode === "mini"
                        ? "10px 10px 10px 10px"
                        : "18px 14px 20px 14px",
                  fontSize: receipt.mode === "photo" ? "13px" : "16px",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily:
                    receipt.mode === "photo"
                      ? "var(--font-ui), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
                      : "Galmuri11, var(--font-ui), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
                  borderRadius: receipt.mode === "photo" ? "12px" : "0px",
                  boxShadow: "none",
                }}
              >
              {receipt.mode === "photo" ? (
                <>
                  {/* Top Section: Format, Age Rating, Title */}
                  <div className="mb-1 flex items-start justify-between">
                    <div className="text-stone-900" style={{ fontSize: "11px" }}>
                      {receipt.photoFormat || "2D"}
                    </div>
                    <div className="text-stone-900" style={{ fontSize: "11px" }}>
                      {receipt.ageRating || "12세관람가"}
                    </div>
                  </div>

                  <div className="mb-1">
                    <div
                      className="mb-1 border-b border-stone-900"
                      style={{ borderWidth: "1px" }}
                    />
                    <div
                      className="font-semibold text-stone-900"
                      style={{ fontSize: "15px", lineHeight: "1.2", marginBottom: "2px" }}
                    >
                      {receipt.title || "Movie Title"}
                    </div>
                    <div
                      className="break-words text-stone-700"
                      style={{ fontSize: "11px", lineHeight: "1.2" }}
                    >
                      {shouldShowSubtitle ? receipt.subtitle : ""}
                    </div>
                    <div
                      className="mt-0.5 border-b border-stone-900"
                      style={{ borderWidth: "1px" }}
                    />
                  </div>

                  {/* Middle Section: place/date, showtime, seat, people */}
                  <div className="mt-1 text-stone-900" style={{ fontSize: "11px" }}>
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

                    <div className="h-3" />

                    <div>
                      {(receipt.showtime || "20:30~23:07") +
                        (receipt.session ? ` (${receipt.session})` : "")}
                    </div>

                    <div className="h-3" />

                    <div>{(receipt.hall || "2관").trim()}</div>
                    <div>{(receipt.seat || "E열 07번").trim()}</div>

                    <div className="h-3" />

                    <div>
                      {receipt.ticketType || "일반 1명"}
                    </div>
                  </div>

                  {receipt.note && (
                    <div
                      className="mt-2 whitespace-pre-wrap break-words text-stone-700"
                      style={{ fontSize: "11px", lineHeight: "1.25" }}
                    >
                      {receipt.note}
                    </div>
                  )}

                </>
              ) : receipt.mode === "mini" ? (
                <>
                  <div
                    className="text-center text-stone-900"
                    style={{
                      fontWeight: 500,
                      fontSize: "calc(var(--movie-receipt-size-md) + 3px)",
                      letterSpacing: "-0.01em",
                      lineHeight: "1.1",
                    }}
                  >
                    ★ 영화입장권 ★
                  </div>

                  <div
                    className="mt-0.5 w-full overflow-hidden text-center whitespace-nowrap text-stone-700"
                    style={{
                      fontSize: "var(--movie-receipt-size-sm)",
                      fontWeight: 400,
                      letterSpacing: "-0.06em",
                    }}
                  >
                    {(() => {
                      const date = receipt.issuedAt ? new Date(receipt.issuedAt) : new Date();
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      const hh = String(date.getHours()).padStart(2, "0");
                      const min = String(date.getMinutes()).padStart(2, "0");
                      return `${yyyy}-${mm}-${dd} ${hh}:${min}(BOX_KIOSK_A5)[전체발권]`;
                    })()}
                  </div>

                  <div
                    className="mt-2 text-left text-stone-900"
                    style={{ fontWeight: 400, fontSize: "var(--movie-receipt-size-md)", lineHeight: "1.1" }}
                  >
                    {(receipt.photoFormat || "2D") + ", " + (receipt.ageRating || "전체관람가")}
                  </div>

                  <div
                    className="mt-0.5 text-left text-stone-900"
                    style={{
                      fontWeight: 400,
                      fontSize: "var(--movie-receipt-size-lg)",
                      lineHeight: "1.05",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {receipt.title}
                  </div>

                  {shouldShowSubtitle && (
                    <div
                      className="mt-0.5 break-words text-left text-stone-700"
                      style={{
                        fontWeight: 400,
                        fontSize: "var(--movie-receipt-size-sm)",
                        lineHeight: "1.15",
                      }}
                    >
                      {receipt.subtitle}
                    </div>
                  )}

                  <div
                    className="mt-1 inline-block w-fit max-w-full self-start whitespace-nowrap bg-stone-900 px-1 py-0.5 text-left text-white"
                    style={{
                      fontWeight: 500,
                      fontSize: "var(--movie-receipt-size-md)",
                      lineHeight: "1.1",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {getShowtimeLine()}
                  </div>

                  <div
                    className="mt-1 text-left text-stone-900"
                    style={{ fontWeight: 400, fontSize: "var(--movie-receipt-size-md)", lineHeight: "1.1" }}
                  >
                    {getMiniSeatLine()}
                  </div>

                  <div
                    className="mt-0.5 text-left text-stone-900"
                    style={{ fontWeight: 400, fontSize: "var(--movie-receipt-size-md)", lineHeight: "1.1" }}
                  >
                    {getTotalPeopleLine()}
                  </div>

                  <div
                    className="mt-0.5 text-left text-stone-900"
                    style={{ fontWeight: 400, fontSize: "var(--movie-receipt-size-md)", lineHeight: "1.1" }}
                  >
                    {receipt.theater}
                    <span
                      className="ml-1"
                      style={{ fontSize: "var(--movie-receipt-size-sm)", color: "#78716c" }}
                    >
                      {getReceiptNumberTag()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Header: ★ RVIP 영화입장권 ★ */}
                  <div
                    className="mb-2 text-center text-stone-900"
                    style={{
                      fontWeight: 500,
                      fontSize: "var(--movie-receipt-size-lg)",
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2",
                    }}
                  >
                    ★ 영화입장권 ★
                  </div>

                  {/* Issuance Details */}
                  <div
                    className="mb-1 w-full overflow-hidden text-center whitespace-nowrap text-stone-700"
                    style={{
                      fontSize: "var(--movie-receipt-size-sm)",
                      fontWeight: 400,
                      lineHeight: "1.12",
                      letterSpacing: "-0.06em",
                    }}
                  >
                    {(() => {
                      const date = receipt.issuedAt ? new Date(receipt.issuedAt) : new Date();
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      const hh = String(date.getHours()).padStart(2, "0");
                      const min = String(date.getMinutes()).padStart(2, "0");
                      return `${yyyy}-${mm}-${dd} ${hh}:${min}(BOX_KIOSK_A5)[전체발권]`;
                    })()}
                  </div>

                  {/* Dashed Line */}
                  <div
                    className="mb-3 border-b border-dashed border-stone-400"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Format and Rating */}
                  <div
                    className="mb-1 text-left text-stone-900"
                    style={{
                      fontWeight: 400,
                      fontSize: "var(--movie-receipt-size-md)",
                    }}
                  >
                    {receipt.photoFormat || "2D"}
                    {receipt.photoFormat && receipt.ageRating ? ", " : ""}
                    {receipt.ageRating || "전체관람가"}
                  </div>

                  {/* Movie Title */}
                  <div className="mb-0.5">
                    <div
                      className="text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: "var(--movie-receipt-size-lg)",
                        lineHeight: "1.05",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {receipt.title || "영화 제목"}
                    </div>
                    {shouldShowSubtitle && (
                      <div
                        className="mt-0.5 break-words text-stone-700"
                        style={{
                          fontWeight: 400,
                          fontSize: "var(--movie-receipt-size-sm)",
                          lineHeight: "1.15",
                        }}
                      >
                        {receipt.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Showtime Info (Black Box) */}
                  {receipt.showtime && (
                    <div
                      className="my-1.5 inline-block w-fit max-w-full self-start whitespace-nowrap bg-stone-900 px-0.5 py-[1px] text-left text-white"
                      style={{
                        fontWeight: 500,
                        fontSize: "var(--movie-receipt-size-md)",
                        lineHeight: "1.1",
                        letterSpacing: "-0.07em",
                        transform: "scaleX(0.98)",
                        transformOrigin: "left",
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
                          return `${dateStr}(${dayStr}) ${session} ${showtime}`.trim();
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
                        fontSize: "var(--movie-receipt-size-md)",
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
                      className="mb-0.5 text-left text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: "var(--movie-receipt-size-md)",
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
                      className="mb-1 text-left text-stone-900"
                      style={{
                        fontWeight: 400,
                        fontSize: "var(--movie-receipt-size-md)",
                      }}
                    >
                      {receipt.theater}
                      <span
                        className="ml-1"
                        style={{ fontSize: "var(--movie-receipt-size-sm)", color: "#78716c" }}
                      >
                        {getReceiptNumberTag()}
                      </span>
                    </div>
                  )}

                  {/* Dashed Line */}
                  <div
                    className="my-2 border-b border-dashed border-stone-400"
                    style={{ borderWidth: "1px" }}
                  />

                  {/* Disclaimer/Notes */}

              {receipt.mode === "receipt" && (
                <div
                  className="mb-2 text-left text-stone-700"
                  style={{
                    fontWeight: 400,
                    fontSize: "var(--movie-receipt-size-sm)",
                    lineHeight: "1.18",
                  }}
                >
                  {MOVIE_RECEIPT_DISCLAIMER_LINES.map((line) => (
                    <div key={line} className="mb-0.5">
                      * {line}
                    </div>
                  ))}
                </div>
              )}
                </>
              )}

              {receipt.mode === "receipt" && receipt.note && (
                <div className="mt-4 mb-2">
                  <div
                    className="whitespace-pre-wrap break-words text-stone-700"
                    style={{
                      fontSize: "var(--movie-receipt-size-sm)",
                      lineHeight: "1.5",
                    }}
                  >
                    {receipt.note}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col items-center pt-3">
                {receipt.mode !== "mini" && receipt.includeBarcode && (
                  <div className="flex w-full flex-col items-center">
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
                    <div
                      className="mt-2 text-stone-700"
                      style={{ fontSize: "var(--movie-receipt-size-sm)" }}
                    >
                      일련번호 {getSerialNumber()}
                    </div>
                  </div>
                )}

                <div
                  className="mt-3 text-center text-stone-900"
                  style={{
                    fontSize: "var(--movie-receipt-size-sm)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    fontFamily: "var(--font-book-cafe), var(--font-ui)",
                  }}
                >
                  Receipt Marker
                </div>
              </div>
            </div>
          </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              {saveMessage && (
                <p className="text-center text-xs text-[var(--ui-muted)]">{saveMessage}</p>
              )}
              <PrimaryButton
                type="button"
                onClick={handleSave}
                disabled={isExporting}
                className="w-full max-w-[320px] rounded-2xl px-8 py-3 text-sm uppercase tracking-wide sm:max-w-[360px]"
              >
                {isExporting ? "저장 중..." : "JPEG로 저장"}
              </PrimaryButton>
            </div>
          </ReceiptCard>
        }
      />
    </section>
  );
}
