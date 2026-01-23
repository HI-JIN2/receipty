import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import SiteChrome from "@/components/SiteChrome";

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

export default async function BookStatsPage() {
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
    console.error("Book stats page error:", err);
    data = {
      ok: false,
      printsCount: 0,
      printBooksCount: 0,
      topBooks: [],
      error: "통계 조회 중 오류가 발생했습니다.",
    };
  }

  return (
    <SiteChrome activeHref="/book/stats">
      <header className="ui-page-header">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
          Book Stats
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          도서 통계
        </h1>
        <p className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
          지금까지 만들어진 도서 영수증과 인기 도서를 모아봤어요.
        </p>
      </header>

      {!data.ok ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          통계를 불러오지 못했습니다. <span className="font-semibold">{data.error ?? ""}</span>
        </div>
      ) : (
        <>
          <div className="ui-stats-grid">
            <div className="ui-card p-6">
              <p className="text-sm font-medium text-[var(--ui-muted)]">지금까지 만들어진 영수증 수</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {data.printsCount.toLocaleString()}
              </p>
            </div>
            <div className="ui-card p-6">
              <p className="text-sm font-medium text-[var(--ui-muted)]">지금까지 영수증에 들어간 책 수</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {data.printBooksCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="ui-section-compact">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">인기 도서 TOP 10</h2>
            </div>

            {data.topBooks.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--ui-muted)]">아직 집계할 데이터가 없습니다.</p>
            ) : (
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.topBooks.map((b, idx) => (
                  <li key={`${b.bookId}`} className="ui-card-solid flex gap-3 p-4">
                    <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white">
                      {b.cover_url ? (
                        <Image
                          src={b.cover_url}
                          alt={b.title}
                          width={48}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-black/40">no</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-[var(--ui-primary)]">{idx + 1}.</span>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
                            {b.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-[var(--ui-muted)]">
                            {b.author ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--ui-muted)]">
                          {b.count.toLocaleString()}회
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </SiteChrome>
  );
}
