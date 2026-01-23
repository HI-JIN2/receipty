/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SearchIcon from "@/components/icons/SearchIcon";
import ReceiptColumns from "@/features/receipts/shared/ReceiptColumns";
import ReceiptCard from "@/features/receipts/shared/ReceiptCard";
import { PASTEL_COLORS, getPreviewBorderColor } from "@/features/receipts/shared/palette";

import type { BaseReceipt } from "@/features/receipts/core/types";
import type { BookResult } from "@/features/receipts/book/types";

type ReceiptState = BaseReceipt & {
  includeQRCode: boolean;
};

export default function BookReceiptClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selected, setSelected] = useState<BookResult[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState<ReceiptState>({
    title: "Book Receipt",
    renter: "",
    rentalDate: "",
    returnDate: "",
    note: "",
    format: "3inch",
    backgroundColor: "#ffffff",
    includeQRCode: true,
  });

  const getBorderColor = getPreviewBorderColor;

  const getReceiptQRData = () => {
    const receiptNum = receiptNumber
      ? `발급번호: ${receiptNumber.toString().padStart(6, "0")}\n`
      : "";

    const booksInfo = selected
      .map((book, idx) => `${idx + 1}. ${book.title}`)
      .join("\n");

    const data = [
      receiptNum,
      `제목: ${receipt.title || "Book Receipt"}`,
      `이용자: ${receipt.renter || "-"}`,
      `대여일: ${receipt.rentalDate || "-"}`,
      `반납예정: ${receipt.returnDate || "-"}`,
      `도서(${selected.length}권):`,
      booksInfo,
      receipt.note ? `메모: ${receipt.note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return data;
  };

  const getKey = (book: BookResult) => book.isbn ?? `${book.title}-${book.publisher}`;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "검색 중 오류가 발생했습니다.");
        setResults([]);
        return;
      }
      setResults(data.items ?? []);
      setDisplayCount(10);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (book: BookResult) => {
    const key = getKey(book);
    setSelected((prev) => {
      const isSelected = prev.some((b) => getKey(b) === key);
      if (isSelected) return prev.filter((b) => getKey(b) !== key);
      return [...prev, book];
    });
  };

  const handleRemove = (key: string) => {
    setSelected((prev) => prev.filter((b) => getKey(b) !== key));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setSelected((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleReceiptChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setReceipt((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = async () => {
    if (!previewRef.current || !selected.length) return;

    setIsExporting(true);
    setIsSaving(true);
    setSaveMessage(null);

    try {
      let receiptNum: number | null = null;

      const receiptPayload: BaseReceipt = {
        title: receipt.title,
        renter: receipt.renter,
        rentalDate: receipt.rentalDate,
        returnDate: receipt.returnDate,
        note: receipt.note,
        format: receipt.format,
        backgroundColor: receipt.backgroundColor,
      };
      try {
        const res = await fetch("/api/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "book",
            selected,
            receipt: receiptPayload,
          }),
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
      const fileName = `book-receipt-${receipt.title || "receipt"}-${Date.now()}.jpg`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setSaveMessage(
        receiptNum !== null ? "이미지 저장 완료" : "이미지 저장 완료 (데이터 전송 실패)",
      );
    } catch (err) {
      console.error("이미지 생성 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
      setIsSaving(false);
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
      const userConfirmed = confirm(
        `링크를 자동으로 복사할 수 없습니다.\n\nURL: ${url}\n\n이 URL을 복사하시겠습니까?`,
      );
      if (userConfirmed) {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch {
          alert(`링크: ${url}\n\n위 링크를 수동으로 복사해주세요.`);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <section className="flex flex-col gap-6 sm:gap-10">
      <PageHeader
        eyebrow="Book Receipt Maker"
        title="나만의 도서영수증 만들기"
        description={[
          "전자책이나 친구에게 빌린 책 등 대출영수증이 없을 때 사용할 수 있어요.",
          "프린트기나 라벨지로 뽑아서 스크랩, 다이어리 등에 활용해요.",
        ]}
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
          <>
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="ui-card w-full p-4 text-left transition"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)]">네이버 도서 검색</h2>
                <p className="mt-2 text-xs text-[var(--ui-muted)]">영수증에 담을 책을 검색해보세요.</p>
                <div className="mt-4 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--ui-muted)]">
                  <span className="sr-only">검색</span>
                  <SearchIcon className="h-4 w-4" />
                </div>
              </button>
            </div>

            <div className="hidden lg:block">
              <ReceiptCard className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">
                  네이버 도서 검색
                </h2>
                <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">
                  영수증에 담을 책을 검색해보세요.
                </p>
                <form onSubmit={handleSearch} className="mt-6 flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="제목, 저자, ISBN을 입력하세요"
                      className="ui-input w-full pr-10 text-base text-[var(--foreground)]"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/40 transition hover:bg-black/5 hover:text-[var(--ui-muted)]"
                        aria-label="검색어 지우기"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <PrimaryButton
                    type="submit"
                    aria-label="검색"
                    disabled={loading}
                    className="shrink-0 px-4 py-2 text-sm"
                  >
                    {loading ? "검색 중..." : <SearchIcon className="h-4 w-4" />}
                  </PrimaryButton>
                </form>
                {error && (
                  <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 grid gap-4">
                  {results.length === 0 && !loading ? null : (
                    <>
                      {results.slice(0, displayCount).map((item) => (
                        <div
                          key={`${item.isbn ?? item.title}-${item.publisher}`}
                          className="ui-card-solid flex flex-col gap-3 p-3 transition hover:shadow-[var(--ui-shadow-hover)] sm:flex-row sm:gap-4 sm:p-4"
                        >
                          <div className="flex gap-3 sm:gap-4">
                            {item.cover_url ? (
                              <img
                                src={item.cover_url}
                                alt={item.title}
                                className="h-20 w-14 flex-shrink-0 rounded-xl border border-black/10 bg-white object-cover shadow-sm sm:h-24 sm:w-16"
                              />
                            ) : (
                              <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-black/10 bg-white text-xs text-black/40 sm:h-24 sm:w-16">
                                no cover
                              </div>
                            )}
                            <div className="flex flex-1 flex-col gap-1 text-xs text-[var(--ui-muted)] sm:text-sm">
                              <div className="break-words text-sm font-semibold text-[var(--foreground)] sm:text-base">
                                {item.title}
                              </div>
                              <div className="text-[var(--ui-muted)]">
                                {item.author} · {item.publisher}
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px] text-black/45 sm:gap-3 sm:text-xs">
                                {item.isbn && <span>ISBN: {item.isbn}</span>}
                                {item.published_at && <span>출간일: {item.published_at}</span>}
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)] transition hover:bg-black/10"
                                  >
                                    naver↗
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end sm:flex-col sm:justify-between">
                            <button
                              type="button"
                              onClick={() => handleAdd(item)}
                              className={`flex h-9 w-9 items-center justify-center rounded-2xl border-2 transition-all duration-200 sm:h-10 sm:w-10 ${
                                selected.some((b) => getKey(b) === getKey(item))
                                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  : "border-[color-mix(in_srgb,var(--ui-primary)_65%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_14%,transparent)] text-[var(--ui-primary)]"
                              }`}
                              aria-label={
                                selected.some((b) => getKey(b) === getKey(item)) ? "제거" : "추가"
                              }
                            >
                              {selected.some((b) => getKey(b) === getKey(item)) ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                      {results.length > displayCount && (
                        <button
                          type="button"
                          onClick={() => setDisplayCount(results.length)}
                          className="mt-2 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-card)] px-4 py-2 text-sm font-semibold text-[var(--ui-muted)] transition hover:bg-[var(--ui-card-solid)]"
                        >
                          더 보기 ({results.length - displayCount}개)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </ReceiptCard>
            </div>

            {isSearchModalOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setIsSearchModalOpen(false)}
                />
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-[var(--background)]">
                  <div className="flex items-center justify-between border-b border-black/10 bg-white/80 px-4 py-4 backdrop-blur">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">도서 검색</h2>
                    <button
                      type="button"
                      onClick={() => setIsSearchModalOpen(false)}
                      className="rounded-2xl p-2 text-[var(--ui-muted)] transition hover:bg-black/5"
                      aria-label="닫기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSearch} className="mb-4 flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="제목, 저자, ISBN을 입력하세요"
                          className="ui-input w-full pr-10 text-base text-[var(--foreground)]"
                          autoFocus
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/40 transition hover:bg-black/5 hover:text-[var(--ui-muted)]"
                            aria-label="검색어 지우기"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <PrimaryButton
                        type="submit"
                        aria-label="검색"
                        disabled={loading}
                        className="shrink-0 px-4 py-2 text-sm"
                      >
                        {loading ? "검색 중..." : <SearchIcon className="h-4 w-4" />}
                      </PrimaryButton>
                    </form>

                    {error && (
                      <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-4">
                      {results.length === 0 && !loading ? (
                        <p className="text-sm text-[var(--ui-muted)]">
                          검색어를 입력하고 검색 버튼을 눌러주세요.
                        </p>
                      ) : (
                        <>
                          {results.slice(0, displayCount).map((item) => (
                            <div
                              key={`${item.isbn ?? item.title}-${item.publisher}`}
                              className="ui-card-solid flex flex-col gap-3 p-3"
                            >
                              <div className="flex gap-3">
                                {item.cover_url ? (
                                  <img
                                    src={item.cover_url}
                                    alt={item.title}
                                    className="h-20 w-14 flex-shrink-0 rounded-xl border border-black/10 bg-white object-cover shadow-sm"
                                  />
                                ) : (
                                  <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-black/10 bg-white text-xs text-black/40">
                                    no cover
                                  </div>
                                )}
                                <div className="flex flex-1 flex-col gap-1 text-xs text-[var(--ui-muted)]">
                                  <div className="break-words text-sm font-semibold text-[var(--foreground)]">
                                    {item.title}
                                  </div>
                                  <div className="text-[var(--ui-muted)]">
                                    {item.author} · {item.publisher}
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-[10px] text-black/45">
                                    {item.isbn && <span>ISBN: {item.isbn}</span>}
                                    {item.published_at && <span>출간일: {item.published_at}</span>}
                                    {item.link && (
                                      <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)] transition hover:bg-black/10"
                                      >
                                        naver↗
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleAdd(item)}
                                  className={`flex h-9 w-9 items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                                    selected.some((b) => getKey(b) === getKey(item))
                                      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                      : "border-[color-mix(in_srgb,var(--ui-primary)_65%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_14%,transparent)] text-[var(--ui-primary)]"
                                  }`}
                                  aria-label={
                                    selected.some((b) => getKey(b) === getKey(item)) ? "제거" : "추가"
                                  }
                                >
                                  {selected.some((b) => getKey(b) === getKey(item)) ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="h-5 w-5"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="h-5 w-5"
                                    >
                                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                          {results.length > displayCount && (
                            <SecondaryButton
                              type="button"
                              onClick={() => setDisplayCount(results.length)}
                              className="mt-2 px-4 py-2 text-sm"
                            >
                              더 보기 ({results.length - displayCount}개)
                            </SecondaryButton>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ReceiptCard className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">영수증 에디터</h2>
              <p className="mt-2 text-xs text-[var(--ui-muted)] sm:text-sm">
                선택한 도서 정보를 기반으로 영수증 상단 정보와 메모를 설정하세요.
              </p>

            <div className="mt-5 grid gap-4">
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
                  영수증 제목
                </label>
                <input
                  name="title"
                  value={receipt.title}
                  onChange={handleReceiptChange}
                  className="ui-input text-sm text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                    대여일
                  </label>
                  <input
                    type="date"
                    name="rentalDate"
                    value={receipt.rentalDate}
                    onChange={handleReceiptChange}
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                    반납 예정일
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={receipt.returnDate}
                    onChange={handleReceiptChange}
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                    이용자
                  </label>
                  <input
                    name="renter"
                    value={receipt.renter}
                    onChange={handleReceiptChange}
                    placeholder="홍길동"
                    className="ui-input text-sm text-[var(--foreground)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                    출력 포맷
                  </label>
                  <select
                    name="format"
                    value={receipt.format}
                    onChange={handleReceiptChange}
                    className="ui-input text-sm text-[var(--foreground)]"
                  >
                    <option value="3inch">3인치 (가로 3인치)</option>
                    <option value="2inch">2인치 (가로 2인치)</option>
                  </select>
                </div>
              </div>

              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                    선택된 도서 관리
                  </label>
                  {selected.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelected([])}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      전체 삭제
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-black/45">
                  목록을 드래그해서 순서를 정리하거나, 우측 X 버튼으로 삭제할 수 있어요.
                </p>
                <div className="mt-3 min-w-0 max-w-full space-y-2 overflow-hidden rounded-2xl border border-dashed border-black/10 bg-white/60 p-3">
                  {selected.length === 0 ? (
                    <p className="text-sm text-[var(--ui-muted)]">아직 책을 선택하지 않았어요.</p>
                  ) : (
                    selected.map((book, index) => (
                      <div
                        key={`${getKey(book)}-editor`}
                        className={`flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border px-2 py-2 text-sm text-[var(--foreground)] transition ${
                          dragIndex === index
                            ? "border-[color-mix(in_srgb,var(--ui-primary)_45%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary)_10%,transparent)]"
                            : "border-transparent hover:border-black/10"
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(event) => handleDragOver(event, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex h-7 w-7 flex-none cursor-grab items-center justify-center rounded-xl border border-black/10 bg-white text-[var(--ui-muted)] hover:bg-black/5 active:cursor-grabbing">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            className="h-3 w-3"
                          >
                            <path
                              fill="currentColor"
                              d="M5 5.25C5 4.56 5.56 4 6.25 4s1.25.56 1.25 1.25S6.94 6.5 6.25 6.5 5 5.94 5 5.25Zm6.5 0C11.5 4.56 12.06 4 12.75 4S14 4.56 14 5.25 13.44 6.5 12.75 6.5 11.5 5.94 11.5 5.25ZM5 10c0-.69.56-1.25 1.25-1.25S7.5 9.31 7.5 10s-.56 1.25-1.25 1.25S5 10.69 5 10Zm6.5 0c0-.69.56-1.25 1.25-1.25S14 9.31 14 10s-.56 1.25-1.25 1.25S11.5 10.69 11.5 10ZM6.25 13.75C5.56 13.75 5 14.31 5 15s.56 1.25 1.25 1.25S7.5 15.69 7.5 15 6.94 13.75 6.25 13.75Zm6.5 0C12.06 13.75 11.5 14.31 11.5 15s.56 1.25 1.25 1.25S14 15.69 14 15s-.56-1.25-1.25-1.25Z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 break-words font-semibold leading-snug">
                            {book.title}
                          </div>
                          <div className="mt-0.5 line-clamp-1 break-words text-xs text-[var(--ui-muted)]">
                            {book.author} · {book.publisher}
                          </div>
                          <div className="mt-0.5 line-clamp-1 break-words text-[11px] text-black/45">
                            {book.isbn || book.published_at || "—"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(getKey(book))}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-muted)]">
                  메모
                </label>
                <textarea
                  name="note"
                  value={receipt.note}
                  onChange={handleReceiptChange}
                  rows={3}
                  placeholder="특이사항, 북카페 자리, 기기 메모 등을 남겨보세요."
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
            </ReceiptCard>

          </>
        }
        right={
          <ReceiptCard className="p-4 transition">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">미리보기</h2>
              </div>
              <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-muted)] sm:text-[11px]">
                {receipt.format === "3inch" ? "3인치 (가로 3인치)" : "2인치 (가로 2인치)"}
              </span>
            </div>

            <div className="mt-4 flex justify-center overflow-x-auto">
                <div
                  ref={previewRef}
                  className="flex-shrink-0 text-stone-700"
                  style={{
                    backgroundColor: receipt.backgroundColor,
                    width: receipt.format === "3inch" ? "288px" : "192px",
                    minHeight: receipt.format === "3inch" ? "600px" : "500px",
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
                    {receipt.title || "대출확인증"}
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
                  <p
                    className="mt-1.5 text-stone-600"
                    style={{
                      fontSize: receipt.format === "3inch" ? "12px" : "11px",
                    }}
                  >
                    총 <span className="font-semibold">{selected.length.toString().padStart(2, "0")}</span> 권
                  </p>
                </div>

                <div
                  className="space-y-1"
                  style={{
                    fontSize: receipt.format === "3inch" ? "13px" : "11px",
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-stone-600">이용자</span>
                    <span className="font-semibold text-stone-900">{receipt.renter || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">대여일</span>
                    <span className="font-semibold text-stone-900">{receipt.rentalDate || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">반납 예정</span>
                    <span className="font-semibold text-stone-900">{receipt.returnDate || "—"}</span>
                  </div>
                </div>

                {selected.length > 0 && (
                  <div
                    className="my-4 border-b border-dashed"
                    style={{ borderColor: getBorderColor(receipt.backgroundColor) }}
                  />
                )}

                <div className="mt-4">
                  {selected.length === 0 ? (
                    <p
                      className="text-stone-500"
                      style={{
                        fontSize: receipt.format === "3inch" ? "13px" : "11px",
                      }}
                    >
                      아직 책을 선택하지 않았어요.
                    </p>
                  ) : (
                    <div
                      className="space-y-2.5"
                      style={{
                        fontSize: receipt.format === "3inch" ? "13px" : "11px",
                      }}
                    >
                      {selected.map((book, idx) => (
                        <div
                          key={`${getKey(book)}-preview`}
                          className="flex items-start gap-2 py-1 text-stone-800"
                        >
                          <div
                            className="flex-shrink-0 pt-0.5 font-semibold text-amber-900/80"
                            style={{
                              fontSize: receipt.format === "3inch" ? "12px" : "11px",
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="break-words font-semibold leading-tight">{book.title}</div>
                            <div
                              className="mt-0.5 leading-tight text-stone-600"
                              style={{
                                fontSize: receipt.format === "3inch" ? "11px" : "10px",
                              }}
                            >
                              {book.author} · {book.publisher}
                            </div>
                            <div
                              className="mt-0.5 text-stone-500"
                              style={{
                                fontSize: receipt.format === "3inch" ? "10px" : "9px",
                              }}
                            >
                              {book.isbn || book.published_at || "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                {selected.length > 0 && receipt.includeQRCode && (
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
                        value={getReceiptQRData()}
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

            <div className="mt-4 flex flex-col items-center gap-2">
              {saveMessage && (
                <p className="text-center text-xs text-[var(--ui-muted)]">{saveMessage}</p>
              )}
              <PrimaryButton
                type="button"
                onClick={handlePrint}
                disabled={isExporting || isSaving || selected.length === 0}
                className="w-full max-w-[320px] rounded-2xl px-8 py-3 text-sm uppercase tracking-wide sm:max-w-[360px]"
              >
                {isExporting || isSaving ? "저장 중..." : "JPEG로 저장"}
              </PrimaryButton>
            </div>
          </ReceiptCard>
        }
      />
    </section>
  );
}
