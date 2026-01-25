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

export default async function MovieStatsPage() {
  const [{ count: printsCount }, { data: rows, error: rowsError }] = await Promise.all([
    supabase.from("movie_prints").select("id", { count: "exact", head: true }),
    supabase
      .from("movie_prints")
      .select("id, payload")
      .order("printed_at", { ascending: false })
      .range(0, 4999),
  ]);

  if (rowsError) {
    console.error("movie stats query error:", rowsError);
  }

  type TopMovieRow = {
    id: number;
    payload: unknown;
  };

  const countsByMovieKey = new Map<
    string,
    { titleKo: string; titleEn: string | null; posterUrl: string | null; count: number }
  >();

  for (const r of (rows ?? []) as unknown as TopMovieRow[]) {
    const payload = r?.payload;
    if (!payload || typeof payload !== "object") continue;

    const titleKo =
      "title" in payload && typeof (payload as { title?: unknown }).title === "string"
        ? (payload as { title: string }).title
        : "(제목 없음)";

    const titleEn =
      "subtitle" in payload && typeof (payload as { subtitle?: unknown }).subtitle === "string"
        ? (payload as { subtitle: string }).subtitle
        : null;

    const posterUrl =
      "posterUrl" in payload && typeof (payload as { posterUrl?: unknown }).posterUrl === "string"
        ? (payload as { posterUrl: string }).posterUrl
        : null;

    const tmdbIdRaw = "tmdbId" in payload ? (payload as { tmdbId?: unknown }).tmdbId : null;
    const tmdbId = typeof tmdbIdRaw === "number" ? tmdbIdRaw : typeof tmdbIdRaw === "string" ? Number(tmdbIdRaw) : NaN;

    const releaseDate =
      "releaseDate" in payload && typeof (payload as { releaseDate?: unknown }).releaseDate === "string"
        ? (payload as { releaseDate: string }).releaseDate
        : "";

    const key = Number.isFinite(tmdbId)
      ? `tmdb:${tmdbId}`
      : `title:${titleKo.trim().toLowerCase()}|${releaseDate.trim()}`;

    const existing = countsByMovieKey.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }

    countsByMovieKey.set(key, {
      titleKo,
      titleEn,
      posterUrl,
      count: 1,
    });
  }

  const topMovies = Array.from(countsByMovieKey.entries())
    .map(([movieKey, info]) => ({ movieKey, ...info }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <SiteChrome activeHref="/movie/stats">
      <PageHeader
        eyebrow="receipty studio"
        title="영화 리포트"
        description="영화 영수증 생성 현황과 인기 영화를 모아봤어요."
      />

      <div className="ui-stats-grid">
        <StatMetricCard label="영화 영수증 수" value={printsCount ?? 0} />
        <StatMetricCard
          label="기록된 영화 수"
          value={countsByMovieKey.size}
        />
      </div>

      <div className="ui-section-compact">
        <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">인기 영화 TOP 10</h2>

        {topMovies.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ui-muted)]">
            {rowsError ? "리포트를 불러오지 못했습니다." : "아직 집계할 데이터가 없습니다."}
          </p>
        ) : (
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {topMovies.map((m, idx) => (
              <RankedMediaItem
                key={m.movieKey}
                rank={idx + 1}
                imageSrc={m.posterUrl}
                imageAlt={m.titleKo}
                primaryText={m.titleKo}
                secondaryText={m.titleEn}
                count={m.count}
              />
            ))}
          </ol>
        )}
      </div>
    </SiteChrome>
  );
}
