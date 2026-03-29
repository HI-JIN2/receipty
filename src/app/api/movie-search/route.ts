import { NextResponse } from "next/server";

type TmdbSearchResponse = {
  results: Array<{
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    poster_path: string | null;
  }>;
};

type TmdbReleaseDatesResponse = {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      type: number;
    }>;
  }>;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function toPosterUrl(path: string | null) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function normalizeKoreanAgeRating(certification: string) {
  const c = certification.trim();
  if (!c) return "";

  if (c === "ALL" || c === "0") return "전체관람가";
  if (c === "12") return "12세관람가";
  if (c === "15") return "15세관람가";
  if (c === "18" || c === "19" || c.toLowerCase() === "r") return "청소년관람불가";

  if (/\d+\s*세/.test(c)) return c;
  return c;
}

async function getKoreanCertification(apiKey: string, movieId: number) {
  const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}/release_dates`);
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return "";
  const data = (await res.json()) as TmdbReleaseDatesResponse;

  const kr = data.results.find((r) => r.iso_3166_1 === "KR");
  const candidates = kr?.release_dates ?? [];

  for (const item of candidates) {
    const normalized = normalizeKoreanAgeRating(item.certification);
    if (normalized) return normalized;
  }

  return "";
}

export const GET = async (req: Request) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "TMDB_API_KEY가 필요합니다." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    if (!q) {
      return NextResponse.json(
        { ok: false, error: "q가 필요합니다." },
        { status: 400 },
      );
    }

    const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
    searchUrl.searchParams.set("api_key", apiKey);
    searchUrl.searchParams.set("query", q);
    searchUrl.searchParams.set("language", "ko-KR");
    searchUrl.searchParams.set("include_adult", "false");

    const searchRes = await fetch(searchUrl, { cache: "no-store" });
    if (!searchRes.ok) {
      return NextResponse.json(
        { ok: false, error: "TMDB 검색에 실패했습니다." },
        { status: 500 },
      );
    }

    const searchData = (await searchRes.json()) as TmdbSearchResponse;
    const sliced = (searchData.results ?? []).slice(0, 8);

    const ratings = await Promise.all(
      sliced.map(async (r) => {
        try {
          return await getKoreanCertification(apiKey, r.id);
        } catch (err) {
          console.error(`Certification fetch failed for ${r.id}:`, err);
          return "";
        }
      }),
    );

    const items = sliced.map((r, idx) => ({
      id: r.id,
      titleKo: r.title,
      titleEn: r.original_title,
      releaseDate: r.release_date || null,
      posterUrl: toPosterUrl(r.poster_path),
      ageRating: ratings[idx] || null,
    }));

    return NextResponse.json(
      { ok: true, items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("movie-search error:", err);
    return NextResponse.json(
      { ok: false, error: "검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};
