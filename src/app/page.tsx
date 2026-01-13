/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

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
  const previewRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState({
    title: "Book Receipt",
    renter: "",
    rentalDate: "",
    returnDate: "",
    note: "",
    format: "standard",
    backgroundColor: "#fef7ed", // 기본 파스텔 베이지
  });

  const pastelColors = [
    { name: "베이지", value: "#fef7ed" },
    { name: "핑크", value: "#fce7f3" },
    { name: "라벤더", value: "#f3e8ff" },
    { name: "민트", value: "#d1fae5" },
    { name: "스카이", value: "#e0f2fe" },
    { name: "피치", value: "#ffe4d6" },
    { name: "레몬", value: "#fef9c3" },
    { name: "화이트", value: "#ffffff" },
  ];

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
    setSelected((prev) =>
      prev.some((b) => getKey(b) === key) ? prev : [...prev, book],
    );
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
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: receipt.backgroundColor,
        scale: 2, // 고해상도
        useCORS: true,
        logging: false,
      });

      // JPEG로 변환
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      
      // 다운로드
      const link = document.createElement("a");
      const fileName = `book-receipt-${receipt.title || "receipt"}-${Date.now()}.jpg`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("이미지 생성 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            <span className="h-[1px] w-6 bg-amber-900/40" />
            Book Receipt
            <span className="h-[1px] w-6 bg-amber-900/40" />
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
            북카페처럼, 조용히 책 영수증을 남기는 공간.
          </h1>
          <p className="max-w-3xl text-lg text-stone-700">
            전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로
            붙여두세요. 로그인 없이 가볍게 쓰고, 인기 책 랭킹만 살짝 공유합니다.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-stone-700">
            <span className="rounded-full bg-[#f1e2cf] px-4 py-2 text-[13px] shadow-sm shadow-amber-200/70">
              Next.js (App Router)
            </span>
            <span className="rounded-full bg-[#f1e2cf] px-4 py-2 text-[13px] shadow-sm shadow-amber-200/70">
              Supabase
            </span>
            <span className="rounded-full bg-[#f1e2cf] px-4 py-2 text-[13px] shadow-sm shadow-amber-200/70">
              Tailwind CSS
            </span>
            <span className="rounded-full bg-[#f1e2cf] px-4 py-2 text-[13px] shadow-sm shadow-amber-200/70">
              GitHub Pages / Vercel 배포
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-6 shadow-[0_18px_45px_rgba(87,63,36,0.15)]">
              <h2 className="text-xl font-semibold text-stone-900">
                네이버 도서 검색
              </h2>
              <p className="mt-2 text-sm text-stone-700">
                오늘 읽을 책, 혹은 최근에 빌린 전자책을 검색해서 영수증에 담아보세요.
              </p>
              <form
                onSubmit={handleSearch}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="제목, 저자, ISBN을 입력하세요"
                  className="flex-1 rounded-xl border border-[#d1bda0] bg-[#fdf6ee] px-4 py-3 text-base text-stone-900 shadow-sm outline-none ring-amber-100 transition focus:border-amber-700 focus:ring"
                />
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
                    지금 마음에 떠오르는 책 제목을 적어보면, 아래에 조용히 결과가 나타납니다.
                  </p>
                ) : (
                  results.map((item) => (
                    <div
                      key={`${item.isbn ?? item.title}-${item.publisher}`}
                      className="flex gap-4 rounded-2xl border border-[#e0cdb3] bg-[#fbf4ea] p-4 shadow-sm transition hover:border-amber-700/70 hover:shadow-[0_12px_28px_rgba(87,63,36,0.28)]"
                    >
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="h-24 w-16 rounded-md border border-[#d3b894] bg-[#f7efe2] object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-24 w-16 items-center justify-center rounded-md border border-dashed border-[#d3b894] bg-[#f7efe2] text-xs text-stone-400">
                          no cover
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-1 text-sm text-stone-700">
                        <div className="text-base font-semibold text-stone-900">
                          {item.title}
                        </div>
                        <div className="text-stone-600">
                          {item.author} · {item.publisher}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                          {item.isbn && <span>ISBN: {item.isbn}</span>}
                          {item.published_at && (
                            <span>출간일: {item.published_at}</span>
                          )}
                          <span className="rounded-full bg-[#f0e0c7] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
                            source: {item.source}
                          </span>
                        </div>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-amber-900 hover:underline"
                          >
                            네이버 상세보기 ↗
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col justify-between">
                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-amber-50 shadow-sm transition hover:bg-stone-950 disabled:opacity-50"
                          disabled={selected.some(
                            (b) => getKey(b) === getKey(item),
                          )}
                        >
                          {selected.some((b) => getKey(b) === getKey(item))
                            ? "추가됨"
                            : "선택/추가"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-6 shadow-[0_18px_45px_rgba(87,63,36,0.15)]">
              <h2 className="text-xl font-semibold text-stone-900">
                영수증 에디터
              </h2>
              <p className="mt-2 text-sm text-stone-700">
                선택한 도서 정보를 기반으로 영수증 상단 정보와 메모를 설정하세요.
              </p>
              <div className="mt-5 grid gap-4">
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
                      placeholder="예: 홍길동"
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
                      <option value="standard">Standard (A4/일반)</option>
                      <option value="label">Label (좁은 폭)</option>
                      <option value="photo">Photo (포토 프린터)</option>
                    </select>
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
              </div>
            </div>

            <div
              ref={previewRef}
              className="rounded-2xl border border-[#e2d2bd] p-6 shadow-[0_18px_45px_rgba(87,63,36,0.12)] transition"
              style={{ backgroundColor: receipt.backgroundColor }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                    미리보기
                  </p>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {receipt.title || "Book Receipt"}
                  </h3>
                </div>
                <span className="rounded-full bg-[#f0e0c7] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900/80">
                  {receipt.format}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-stone-700">
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

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                    선택된 도서
                  </p>
                </div>
                <div className="mt-3 space-y-2 rounded-xl border border-dashed border-[#d7c2a5] bg-[#fdf6ee] p-3">
                  {selected.length === 0 ? (
                    <p className="text-sm text-stone-500">
                      아직 책을 선택하지 않았어요.
                    </p>
                  ) : (
                    selected.map((book, idx) => (
                      <div
                        key={`${getKey(book)}-preview`}
                        className="flex items-start justify-between gap-3 rounded-lg px-2 py-1 text-sm text-stone-800"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{book.title}</div>
                          <div className="text-xs text-stone-600">
                            {book.author} · {book.publisher}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {book.isbn || book.published_at || "—"}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-amber-900/80">
                          {idx + 1}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
                  메모
                </p>
                <div className="mt-2 rounded-xl border border-dashed border-[#d7c2a5] bg-[#fdf6ee] px-3 py-3 text-sm text-stone-800">
                  {receipt.note ? receipt.note : "메모가 여기에 표시됩니다."}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isExporting || selected.length === 0}
                  className="rounded-2xl bg-amber-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-amber-50 shadow-[0_12px_30px_rgba(87,63,36,0.35)] transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "저장 중..." : "JPEG로 저장"}
                </button>
            </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
