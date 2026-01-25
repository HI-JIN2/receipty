import { createClient } from "@supabase/supabase-js";
import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";
import RankedMediaItem from "@/components/stats/RankedMediaItem";
import StatMetricCard from "@/components/stats/StatMetricCard";

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
        error: rpcError?.message ?? "리포트 조회에 실패했습니다.",
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
      error: "리포트 조회 중 오류가 발생했습니다.",
    };
  }

  return (
    <SiteChrome activeHref="/book/stats">
      <PageHeader
        eyebrow="receipty studio"
        title="도서 리포트"
        description="지금까지 만든 도서 영수증과 인기 도서를 모아봤어요."
      />

      {!data.ok ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          리포트를 불러오지 못했습니다. <span className="font-semibold">{data.error ?? ""}</span>
        </div>
      ) : (
        <>
          <div className="ui-stats-grid">
            <StatMetricCard label="지금까지 만들어진 영수증 수" value={data.printsCount} />
            <StatMetricCard label="지금까지 영수증에 들어간 책 수" value={data.printBooksCount} />
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
                  <RankedMediaItem
                    key={`${b.bookId}`}
                    rank={idx + 1}
                    imageSrc={b.cover_url}
                    imageAlt={b.title}
                    primaryText={b.title}
                    secondaryText={b.author}
                    count={b.count}
                  />
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </SiteChrome>
  );
}
