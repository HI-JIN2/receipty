/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Book Receipt
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            e북 대여 영수증을 쉽고 빠르게 만들고, 인쇄까지 한 번에.
          </h1>
          <p className="max-w-3xl text-lg text-slate-700">
            로그인 없이 책 정보를 검색하거나 수동 입력해 영수증을 생성합니다.
            Supabase에 많이 뽑힌 책 랭킹과 총 생성 횟수만 집계해 모두와 공유합니다.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">
              Next.js (App Router)
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">
              Supabase
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">
              Tailwind CSS
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">
              GitHub Pages / Vercel 배포
            </span>
          </div>
        </header>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            네이버 도서 검색(프록시 연결됨)
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            `/api/search`를 통해 네이버 도서 검색 API를 호출합니다. 검색 후
            결과를 선택하여 영수증 폼에 채우는 흐름을 이어가면 됩니다.
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 저자, ISBN을 입력하세요"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm outline-none ring-emerald-100 transition focus:border-emerald-400 focus:ring"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
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
              <p className="text-sm text-slate-500">
                검색 결과가 여기에 표시됩니다.
              </p>
            ) : (
              results.map((item) => (
                <div
                  key={`${item.isbn ?? item.title}-${item.publisher}`}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                >
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="h-24 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                      no cover
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1 text-sm text-slate-700">
                    <div className="text-base font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-slate-600">
                      {item.author} · {item.publisher}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      {item.isbn && <span>ISBN: {item.isbn}</span>}
                      {item.published_at && (
                        <span>출간일: {item.published_at}</span>
                      )}
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                        source: {item.source}
                      </span>
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        네이버 상세보기 ↗
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col justify-between">
                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              선택된 도서 ({selected.length})
            </h2>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-sm font-semibold text-rose-600 hover:text-rose-700"
              >
                모두 지우기
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            영수증에 담을 책을 선택/추가하고 필요하면 삭제하세요.
          </p>
          <div className="mt-4 grid gap-3">
            {selected.length === 0 ? (
              <p className="text-sm text-slate-500">
                아직 선택된 도서가 없습니다.
              </p>
            ) : (
              selected.map((item) => (
                <div
                  key={getKey(item)}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-600">
                      {item.author} · {item.publisher}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {item.isbn && <span>ISBN: {item.isbn}</span>}
                      {item.published_at && (
                        <span>출간일: {item.published_at}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(getKey(item))}
                    className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </section>
    </main>
  );
}
