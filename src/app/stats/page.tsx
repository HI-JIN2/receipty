import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type StatsResponse = {
  ok: boolean;
  printsCount: number;
  printBooksCount: number;
  topBooks: Array<{
    bookId: number | string;
    title: string;
    author: string | null;
    cover_url: string | null;
    count: number;
  }>;
  error?: string;
};

export default async function StatsPage() {
  let data: StatsResponse;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_stats");

    if (rpcError || !rpcData) {
      console.error("get_stats rpc error:", rpcError);
      data = {
        ok: false,
        printsCount: 0,
        printBooksCount: 0,
        topBooks: [],
        error: rpcError?.message ?? "통계 조회에 실패했습니다.",
      };
    } else {
      data = {
        ok: true,
        printsCount: rpcData.printsCount ?? 0,
        printBooksCount: rpcData.printBooksCount ?? 0,
        topBooks: rpcData.topBooks ?? [],
      };
    }
  } catch (err) {
    console.error("Stats page error:", err);
    data = {
      ok: false,
      printsCount: 0,
      printBooksCount: 0,
      topBooks: [],
      error: "통계 조회 중 오류가 발생했습니다.",
    };
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            <span className="h-[1px] w-6 bg-amber-900/40" />
            Stats
            <span className="h-[1px] w-6 bg-amber-900/40" />
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl lg:text-4xl">
            독서 발자국
          </h1>
          <p className="max-w-3xl text-base text-stone-700 sm:text-lg">
            지금까지 만들어진 영수증과, 영수증에 담은 책들을 모아봤어요.
          </p>
        </header>

        {!data.ok ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            통계를 불러오지 못했습니다.{" "}
            <span className="font-semibold">{data.error ?? ""}</span>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-6 shadow-[0_10px_25px_rgba(193,160,120,0.14)]">
                <p className="text-sm font-medium text-stone-600">
                  지금까지 만들어진 영수증 수
                </p>
                <p className="mt-2 text-3xl font-semibold text-stone-900">
                  {data.printsCount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-6 shadow-[0_10px_25px_rgba(193,160,120,0.14)]">
                <p className="text-sm font-medium text-stone-600">
                  지금까지 영수증에 들어간 책 수
                </p>
                <p className="mt-2 text-3xl font-semibold text-stone-900">
                  {data.printBooksCount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2d2bd] bg-[#fcf7ef] p-6 shadow-[0_10px_25px_rgba(193,160,120,0.14)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                  인기 도서 TOP 10
                </h2>
                <Link
                  href="/"
                  className="text-sm font-medium text-amber-900/80 hover:underline"
                >
                  홈으로
                </Link>
              </div>

              {data.topBooks.length === 0 ? (
                <p className="mt-4 text-sm text-stone-600">
                  아직 집계할 데이터가 없습니다.
                </p>
              ) : (
                <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                  {data.topBooks.map((b, idx) => (
                    <li
                      key={`${b.bookId}`}
                      className="flex gap-3 rounded-2xl border border-[#e0cdb3] bg-[#fbf4ea] p-4"
                    >
                      <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-md border border-[#d3b894] bg-[#f7efe2]">
                        {b.cover_url ? (
                          <Image
                            src={b.cover_url}
                            alt={b.title}
                            width={48}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-stone-400">no</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-amber-900">
                            {idx + 1}.
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-stone-900">
                              {b.title}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                              {b.author ?? "—"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-amber-900/80">
                            {b.count.toLocaleString()}회
                          </p>
                          <Link
                            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                              `${b.title} ${b.author ?? ""}`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#f0e0c7] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900/80 hover:bg-[#e8d4b3] transition"
                          >
                            naver↗
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}

        <footer className="mt-8 border-t border-[#e2d2bd] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                홈
              </Link>
              <span className="text-sm font-medium text-stone-400">독서 발자국</span>
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
  );
}


