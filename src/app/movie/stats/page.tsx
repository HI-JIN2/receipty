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
      <header className="ui-page-header">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
          Movie Stats
          <span className="h-[1px] w-6 bg-[color-mix(in_srgb,var(--ui-primary)_25%,transparent)]" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          영화 통계
        </h1>
        <p className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
          영화 영수증 생성 현황과 인기 영화를 보여줘요.
        </p>
      </header>

      <div className="ui-stats-grid">
        <div className="ui-card p-6">
          <p className="text-sm font-medium text-[var(--ui-muted)]">영화 영수증 수</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {(printsCount ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="ui-card p-6">
          <p className="text-sm font-medium text-[var(--ui-muted)]">영화의 수</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {movieIdSet.size.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-[var(--ui-muted)]">(영수증에 1회 이상 등장한 영화 기준)</p>
        </div>
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
              <li key={m.movieId} className="ui-card-solid flex gap-3 p-4">
                <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white">
                  {m.posterUrl ? (
                    <Image
                      src={m.posterUrl}
                      alt={m.titleKo}
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
                        {m.titleKo}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--ui-muted)]">{m.titleEn ?? "—"}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--ui-muted)]">{m.count.toLocaleString()}회</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </SiteChrome>
  );
}
