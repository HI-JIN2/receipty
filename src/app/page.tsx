/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type BookResult = {
  title: string;
  author: string;
  publisher: string;
  published_at: string | null;
  isbn: string | null;
  cover_url: string;
  link: string;
  source: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BookResult[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState({
    title: "Book Receipt",
    renter: "",
    rentalDate: "",
    returnDate: "",
    note: "",
    format: "3inch",
    backgroundColor: "#ffffff", // 기본 화이트
    includeQRCode: true, // QR 코드 포함 여부
  });

  const pastelColors = [
    { name: "화이트", value: "#ffffff" },
    { name: "베이지", value: "#fef7ed" },
    { name: "핑크", value: "#fce7f3" },
    { name: "라벤더", value: "#f3e8ff" },
    { name: "민트", value: "#d1fae5" },
    { name: "스카이", value: "#e0f2fe" },
    { name: "피치", value: "#ffe4d6" },
    { name: "레몬", value: "#fef9c3" },
  ];

  // 배경색에 맞는 테두리 색상 매핑
  const getBorderColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      "#ffffff": "#1a1a1a", // 화이트 -> 검은색
      "#fef7ed": "#8b6914", // 베이지 -> 다크 브라운
      "#fce7f3": "#c2185b", // 핑크 -> 다크 핑크
      "#f3e8ff": "#7b2cbf", // 라벤더 -> 다크 퍼플
      "#d1fae5": "#15803d", // 민트 -> 다크 그린
      "#e0f2fe": "#0369a1", // 스카이 -> 다크 블루
      "#ffe4d6": "#ea580c", // 피치 -> 다크 오렌지
      "#fef9c3": "#ca8a04", // 레몬 -> 다크 옐로우
    };
    return colorMap[bgColor] || "#1a1a1a";
  };

  // QR 코드용 영수증 정보 생성 (간소화된 형식)
  const getReceiptQRData = () => {
    // 발급번호가 있으면 포함
    const receiptNum = receiptNumber ? `발급번호: ${receiptNumber.toString().padStart(6, "0")}\n` : "";
    
    // 도서 정보를 간단하게
    const booksInfo = selected.map((book, idx) => 
      `${idx + 1}. ${book.title}`
    ).join('\n');
    
    const data = [
      receiptNum,
      `제목: ${receipt.title || "Book Receipt"}`,
      `이용자: ${receipt.renter || "-"}`,
      `대여일: ${receipt.rentalDate || "-"}`,
      `반납예정: ${receipt.returnDate || "-"}`,
      `도서(${selected.length}권):`,
      booksInfo,
      receipt.note ? `메모: ${receipt.note}` : "",
    ].filter(Boolean).join('\n');
    
    return data;
  };

  const divider = "------";

  const getKey = (book: BookResult) =>
    book.isbn ?? `${book.title}-${book.publisher}`;

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
    } catch (err) {
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
      if (isSelected) {
        // 이미 선택된 경우 제거
        return prev.filter((b) => getKey(b) !== key);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, book];
      }
    });
  };

  const handleRemove = (key: string) => {
    setSelected((prev) => prev.filter((b) => getKey(b) !== key));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
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
      // 1. Supabase에 먼저 기록 저장하여 발급번호 받기
      let receiptNum: number | null = null;
      try {
        const res = await fetch("/api/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selected, receipt }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "기록 저장 중 오류가 발생했습니다.");
        }
        // 발급번호 저장
        if (data.receiptNumber !== undefined) {
          receiptNum = data.receiptNumber;
          setReceiptNumber(data.receiptNumber);
        }
      } catch (err) {
        console.error("Supabase 저장 실패:", err);
        setSaveMessage("Supabase 기록에 실패했습니다. 이미지만 저장합니다.");
      }

      // 2. 발급번호가 포함된 상태로 이미지 저장 (QR 코드 포함을 위해 약간의 지연 추가)
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

      if (receiptNum !== null) {
        setSaveMessage("이미지 저장 완료");
      } else {
        setSaveMessage("이미지 저장 완료 (데이터 전송 실패)");
      }
    } catch (err) {
      console.error("이미지 생성 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
      setIsSaving(false);
    }
  };

  // 링크 복사 함수
  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = typeof window !== "undefined" ? window.location.href : "";
    
    if (!url) {
      alert("링크를 가져올 수 없습니다.");
      return;
    }

    // 방법 1: Clipboard API 시도 (HTTPS 또는 localhost에서만 작동)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      } catch (err) {
        console.error("Clipboard API 실패:", err);
        // 폴백으로 계속 진행
      }
    }

    // 방법 2: execCommand 사용 (구형 브라우저 지원)
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
      // 최종 폴백: 사용자에게 URL 표시
      const userConfirmed = confirm(
        `링크를 자동으로 복사할 수 없습니다.\n\nURL: ${url}\n\n이 URL을 복사하시겠습니까?`
      );
      if (userConfirmed) {
        // 사용자가 확인하면 다시 시도
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (finalErr) {
          alert(`링크: ${url}\n\n위 링크를 수동으로 복사해주세요.`);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) - SEO 향상 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Book Receipt",
            description: "전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로 붙여두세요.",
            url: process.env.NEXT_PUBLIC_SITE_URL || "",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "KRW",
            },
            creator: {
              "@type": "Organization",
              name: "HI-JIN2",
            },
          }),
        }}
      />
      <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
        <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
              <span className="h-[1px] w-6 bg-amber-900/40" />
              Book Receipt
              <span className="h-[1px] w-6 bg-amber-900/40" />
            </p>
            <div className="relative">
              <button
                onClick={handleShare}
                className="group flex items-center gap-2 rounded-lg border border-amber-900/20 bg-white/50 px-3 py-1.5 text-xs font-medium text-amber-900/80 transition-all hover:border-amber-900/40 hover:bg-white/80 hover:text-amber-900 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
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
              </button>
              {copySuccess && (
                <div className="absolute -top-12 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
                    링크가 복사되었습니다!
                    <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-stone-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-xl font-semibold leading-tight text-stone-900 sm:text-3xl lg:text-4xl">
            나만의 도서영수증 만들기
          </h1>
          <div className="flex flex-col gap-1">
            <p className="max-w-3xl text-base text-stone-700 sm:text-lg">
              전자책이나 친구에게 빌린 책 등 대출영수증이 없을 때 사용할 수 있어요.
            </p>
            <p className="max-w-3xl text-base text-stone-700 sm:text-lg">
              프린트기나 라벨지로 뽑아서 스크랩, 다이어리 등에 활용해요. 
            </p>
          </div>
      
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-4 shadow-[0_18px_45px_rgba(87,63,36,0.15)] sm:p-6">
              <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                네이버 도서 검색
              </h2>
              <p className="mt-2 text-xs text-stone-700 sm:text-sm">
                영수증에 담을 책을 검색해보세요. 
              </p>
              <form
                onSubmit={handleSearch}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="제목, 저자, ISBN을 입력하세요"
                    className="w-full rounded-xl border border-[#d1bda0] bg-[#fdf6ee] px-4 py-3 pr-10 text-base text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 transition hover:bg-stone-200 hover:text-stone-600"
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
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-amber-900 px-5 py-3 text-sm font-semibold text-amber-50 shadow-[0_10px_25px_rgba(87,63,36,0.4)] transition hover:bg-amber-950 disabled:opacity-60"
                >
                  {loading ? "검색 중..." : "검색"}
                </button>
              </form>
              {error && (
                <div className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div className="mt-6 grid gap-4">
                {results.length === 0 && !loading ? (
                  <p className="text-sm text-stone-500">
                    {/* 지금 마음에 떠오르는 책 제목을 적어보면, 아래에 조용히 결과가 나타납니다. */}
                  </p>
                ) : (
                  results.map((item) => (
                    <div
                      key={`${item.isbn ?? item.title}-${item.publisher}`}
                      className="flex flex-col gap-3 rounded-2xl border border-[#e0cdb3] bg-[#fbf4ea] p-3 shadow-sm transition hover:border-amber-700/70 hover:shadow-[0_12px_28px_rgba(87,63,36,0.28)] sm:flex-row sm:gap-4 sm:p-4"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="h-20 w-14 flex-shrink-0 rounded-md border border-[#d3b894] bg-[#f7efe2] object-cover shadow-sm sm:h-24 sm:w-16"
                          />
                        ) : (
                          <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-[#d3b894] bg-[#f7efe2] text-xs text-stone-400 sm:h-24 sm:w-16">
                            no cover
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-1 text-xs text-stone-700 sm:text-sm">
                          <div className="break-words text-sm font-semibold text-stone-900 sm:text-base">
                            {item.title}
                          </div>
                          <div className="text-stone-600">
                            {item.author} · {item.publisher}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] text-stone-500 sm:gap-3 sm:text-xs">
                            {item.isbn && <span>ISBN: {item.isbn}</span>}
                            {item.published_at && (
                              <span>출간일: {item.published_at}</span>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-[#f0e0c7] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900/80 hover:bg-[#e8d4b3] transition"
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
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all duration-200 sm:h-10 sm:w-10 ${
                            selected.some((b) => getKey(b) === getKey(item))
                              ? "border-rose-300 bg-rose-50 text-rose-600 hover:border-rose-400 hover:bg-rose-100"
                              : "border-amber-700 bg-amber-50 text-amber-900 hover:border-amber-800 hover:bg-amber-100"
                          }`}
                          aria-label={
                            selected.some((b) => getKey(b) === getKey(item))
                              ? "제거"
                              : "추가"
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
                              <path
                                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-4 shadow-[0_18px_45px_rgba(87,63,36,0.15)] sm:p-6">
              <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                영수증 에디터
              </h2>
              <p className="mt-2 text-xs text-stone-700 sm:text-sm">
                선택한 도서 정보를 기반으로 영수증 상단 정보와 메모를 설정하세요.
              </p>
              <div className="mt-5 grid gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                    배경색 (파스텔)
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
                        className={`h-8 w-8 rounded-lg border-2 transition hover:scale-110 ${
                          receipt.backgroundColor === color.value
                            ? "border-amber-900 shadow-md"
                            : "border-[#d1bda0]"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                    영수증 제목
                  </label>
                  <input
                    name="title"
                    value={receipt.title}
                    onChange={handleReceiptChange}
                    className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                      대여일
                    </label>
                    <input
                      type="date"
                      name="rentalDate"
                      value={receipt.rentalDate}
                      onChange={handleReceiptChange}
                      className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                      반납 예정일
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={receipt.returnDate}
                      onChange={handleReceiptChange}
                      className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                      이용자/메모 이름
                    </label>
                    <input
                      name="renter"
                      value={receipt.renter}
                      onChange={handleReceiptChange}
                      placeholder="홍길동"
                      className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                      출력 포맷
                    </label>
                    <select
                      name="format"
                      value={receipt.format}
                      onChange={handleReceiptChange}
                      className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                    >
                      <option value="3inch">3인치 (가로 3인치)</option>
                      <option value="2inch">2인치 (가로 2인치)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
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
                  <p className="mt-1 text-xs text-stone-500">
                    목록을 드래그해서 순서를 정리하거나, 우측 X 버튼으로 삭제할 수 있어요.
                  </p>
                  <div className="mt-3 space-y-2 rounded-xl border border-dashed border-[#d7c2a5] bg-[#fdf6ee] p-3">
                    {selected.length === 0 ? (
                      <p className="text-sm text-stone-500">
                        아직 책을 선택하지 않았어요.
                      </p>
                    ) : (
                      selected.map((book, index) => (
                        <div
                          key={`${getKey(book)}-editor`}
                          className={`flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-sm text-stone-800 transition ${
                            dragIndex === index
                              ? "border-amber-700 bg-[#f4e3cd]"
                              : "hover:border-amber-600/80"
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(event) => handleDragOver(event, index)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex h-7 w-7 flex-none cursor-grab items-center justify-center rounded-lg border border-[#d7c2a5] bg-white/80 text-amber-900/70 hover:border-amber-700 hover:text-amber-900 active:cursor-grabbing">
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
                          <div className="flex-1">
                            <div className="font-semibold">{book.title}</div>
                            <div className="text-xs text-stone-600">
                              {book.author} · {book.publisher}
                            </div>
                            <div className="text-[11px] text-stone-500">
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
                  <label className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                    메모
                  </label>
                  <textarea
                    name="note"
                    value={receipt.note}
                    onChange={handleReceiptChange}
                    rows={3}
                    placeholder="특이사항, 북카페 자리, 기기 메모 등을 남겨보세요."
                    className="rounded-lg border border-[#d1bda0] bg-[#fdf6ee] px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
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
                    className="h-4 w-4 rounded border-[#d1bda0] text-amber-900 focus:ring-amber-700"
                  />
                  <label
                    htmlFor="includeQRCode"
                    className="text-sm font-medium text-stone-700 cursor-pointer"
                  >
                    QR 코드 포함
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2d2bd] p-4 shadow-[0_18px_45px_rgba(87,63,36,0.12)] transition">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                    미리보기
                  </h2>
                </div>
                <span className="bg-[#f0e0c7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900/80 sm:text-[11px]">
                  {receipt.format === "3inch" ? "3인치 (가로 3인치)" : "2인치 (가로 2인치)"}
                </span>
              </div>

              <div className="mt-4 flex justify-center overflow-x-auto">
                <div
                  ref={previewRef}
                  className="bg-[#fdf6ee] text-stone-700 flex-shrink-0"
                  style={{
                    backgroundColor: receipt.backgroundColor,
                    width: receipt.format === "3inch" ? "288px" : "192px",
                    minHeight: receipt.format === "3inch" ? "600px" : "500px",
                    padding: receipt.format === "3inch" ? "24px 18px 32px 18px" : "20px 14px 28px 14px",
                    fontSize: receipt.format === "3inch" ? "14px" : "12px",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "var(--font-book-cafe), system-ui, sans-serif",
                    border: `1px solid ${getBorderColor(receipt.backgroundColor)}`,
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
                      총{" "}
                      <span className="font-semibold">
                        {selected.length.toString().padStart(2, "0")}
                      </span>{" "}
                      권
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
                      <span className="font-semibold text-stone-900">
                        {receipt.renter || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">대여일</span>
                      <span className="font-semibold text-stone-900">
                        {receipt.rentalDate || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">반납 예정</span>
                      <span className="font-semibold text-stone-900">
                        {receipt.returnDate || "—"}
                      </span>
                    </div>
                  </div>

                  {selected.length > 0 && (
                    <div 
                      className="my-4 border-b border-dashed"
                      style={{ borderColor: getBorderColor(receipt.backgroundColor) }}
                    ></div>
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
                            className="flex items-start justify-between gap-2 py-1 text-stone-800"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold leading-tight break-words">
                                {book.title}
                              </div>
                              <div
                                className="text-stone-600 leading-tight mt-0.5"
                                style={{
                                  fontSize: receipt.format === "3inch" ? "11px" : "10px",
                                }}
                              >
                                {book.author} · {book.publisher}
                              </div>
                              <div
                                className="text-stone-500 mt-0.5"
                                style={{
                                  fontSize: receipt.format === "3inch" ? "10px" : "9px",
                                }}
                              >
                                {book.isbn || book.published_at || "—"}
                              </div>
                            </div>
                            <div
                              className="font-semibold text-amber-900/80 flex-shrink-0"
                              style={{
                                fontSize: receipt.format === "3inch" ? "12px" : "11px",
                              }}
                            >
                              {idx + 1}
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
                      ></div>
                      <div
                        className="text-stone-800 whitespace-pre-wrap break-words"
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
                            padding: "10px",
                            backgroundColor: "#ffffff",
                            // border: `2px solid ${getBorderColor(receipt.backgroundColor)}`,
                          }}
                        >
                          <QRCodeSVG
                            value={getReceiptQRData()}
                            size={receipt.format === "3inch" ? 100 : 90}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
           
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-4 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                {saveMessage && (
                  <p className="text-xs text-stone-600 sm:mr-auto sm:text-right">
                    {saveMessage}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isExporting || isSaving || selected.length === 0}
                  className="rounded-2xl bg-amber-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-amber-50 shadow-[0_12px_30px_rgba(87,63,36,0.35)] transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting || isSaving ? "저장 중..." : "JPEG로 저장"}
                </button>
            </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 border-t border-[#e2d2bd] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                홈
              </button>
              <Link
                href="/about"
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                제작자의 말
              </Link>
            </div>
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} HI-JIN2. All rights reserved.
            </p>
          </div>
        </footer>
      </section>
    </main>
    </>
  );
}
