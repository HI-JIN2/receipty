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

const features = [
  "전자 도서 대여 영수증 생성·미리보기·인쇄",
  "라벨/포토/일반 출력 포맷 선택",
  "많이 뽑힌 책 랭킹 & 총 생성 횟수 집계",
  "Supabase + 외부 도서 API 캐시/집계",
];

const nextSteps = [
  "도서 API 연동(Naver/Kakao/Google Books 중 택1) & 검색 UI",
  "books/prints 테이블 스키마 적용 후 upsert/insert 흐름 연결",
  "영수증 프리뷰 UI & print stylesheet 작성",
  "집계 페이지(`/stats`)에 TOP N / 총 생성 횟수 표시",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold">핵심 기능</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {features.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <h2 className="text-xl font-semibold">다음 작업</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
              {nextSteps.map((item, idx) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl bg-white/5 px-4 py-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-xs leading-5 text-slate-200">
              배포: 기본은 Vercel, GitHub Pages 사용 시 정적 export + basePath
              설정을 참고하세요.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6">
          <h3 className="text-lg font-semibold text-slate-900">환경 변수</h3>
          <p className="mt-2 text-sm text-slate-600">
            Supabase와 네이버 도서 API 키를 설정하세요.
          </p>
          <div className="mt-4 grid gap-3 text-sm font-mono text-slate-800">
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
              <span>NEXT_PUBLIC_SUPABASE_URL</span>
              <span className="text-slate-500">https://xxxxx.supabase.co</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span className="text-slate-500">supabase anon public key</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
              <span>NAVER_CLIENT_ID</span>
              <span className="text-slate-500">naver api client id</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
              <span>NAVER_CLIENT_SECRET</span>
              <span className="text-slate-500">naver api client secret</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
