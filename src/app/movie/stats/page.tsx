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
      .from("movie_print_movies")
      .select("movie_id, movies(title_ko, title_en, poster_url)")
      .order("created_at", { ascending: false })
      .range(0, 4999),
  ]);

  if (rowsError) {
    console.error("movie stats join error:", rowsError);
  }

  const movieIdSet = new Set<number>();
  const countsByMovieId = new Map<
    number,
    { titleKo: string; titleEn: string | null; posterUrl: string | null; count: number }
  >();

  for (const r of (rows ?? []) as unknown as Array<{ movie_id: unknown; movies: unknown }>) {
    const movieId = typeof r.movie_id === "number" ? r.movie_id : Number(r.movie_id);
    if (!Number.isFinite(movieId)) continue;

    movieIdSet.add(movieId);

    const existing = countsByMovieId.get(movieId);
    if (existing) {
      existing.count += 1;
      continue;
    }

    const rawMovie = r.movies;
    const movie = Array.isArray(rawMovie) ? rawMovie[0] : rawMovie;

    const titleKo =
      movie && typeof movie === "object" && "title_ko" in movie && typeof (movie as { title_ko?: unknown }).title_ko === "string"
        ? (movie as { title_ko: string }).title_ko
        : "(제목 없음)";

    const titleEn =
      movie && typeof movie === "object" && "title_en" in movie && typeof (movie as { title_en?: unknown }).title_en === "string"
        ? (movie as { title_en: string }).title_en
        : null;

    const posterUrl =
      movie && typeof movie === "object" && "poster_url" in movie && typeof (movie as { poster_url?: unknown }).poster_url === "string"
        ? (movie as { poster_url: string }).poster_url
        : null;

    countsByMovieId.set(movieId, {
      titleKo,
      titleEn,
      posterUrl,
      count: 1,
    });
  }

  const topMovies = Array.from(countsByMovieId.entries())
    .map(([movieId, info]) => ({ movieId, ...info }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <SiteChrome activeHref="/movie/stats">
      <PageHeader
        eyebrow="Movie Stats"
        title="영화 통계"
        description="영화 영수증 생성 현황과 인기 영화를 보여줘요."
      />

      <div className="ui-stats-grid">
        <StatMetricCard label="영화 영수증 수" value={printsCount ?? 0} />
        <StatMetricCard
          label="영화의 수"
          value={movieIdSet.size}
        />
      </div>

      <div className="ui-section-compact">
        <h2 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">인기 영화 TOP 10</h2>

        {topMovies.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ui-muted)]">
            {rowsError ? "통계를 불러오지 못했습니다." : "아직 집계할 데이터가 없습니다."}
          </p>
        ) : (
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {topMovies.map((m, idx) => (
              <RankedMediaItem
                key={m.movieId}
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
