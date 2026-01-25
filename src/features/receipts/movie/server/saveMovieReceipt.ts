import { createClient } from "@supabase/supabase-js";

import type { MovieReceipt } from "@/features/receipts/movie/types";

type SaveMovieReceiptInput = {
  receipt: MovieReceipt;
};

function toDateOrNull(input: string | null | undefined) {
  if (!input) return null;
  const v = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return v;
}

export async function saveMovieReceipt(input: SaveMovieReceiptInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { receipt } = input;

  if (!receipt?.title?.trim()) {
    return {
      ok: false as const,
      status: 400,
      body: { error: "영화 제목이 필요합니다." },
    };
  }

  const payload = {
    kind: "movie" as const,
    mode: receipt.mode,
    tmdbId: receipt.tmdbId,
    posterUrl: receipt.posterUrl,
    releaseDate: receipt.releaseDate,
    title: receipt.title,
    watchedAt: receipt.watchedAt,
    issuedAt: receipt.issuedAt,
    theater: receipt.theater,
    medium: receipt.medium,
    note: receipt.note,

    photoFormat: receipt.photoFormat,
    ageRating: receipt.ageRating,
    subtitle: receipt.subtitle,
    showtime: receipt.showtime,
    session: receipt.session,
    hall: receipt.hall,
    seat: receipt.seat,
    ticketType: receipt.ticketType,

    format: receipt.format,
    backgroundColor: receipt.backgroundColor,
  };

  // 1) Resolve movie id (tmdb-linked preferred, fallback to title-based)
  let movieId: number | null = null;
  const titleKo = receipt.title.trim();
  const releaseDate = toDateOrNull(receipt.releaseDate);

  if (receipt.tmdbId) {
    const { data, error } = await supabase
      .from("movies")
      .upsert(
        {
          tmdb_id: receipt.tmdbId,
          title_ko: titleKo,
          title_en: receipt.subtitle || null,
          release_date: releaseDate,
          age_rating: receipt.ageRating || null,
          poster_url: receipt.posterUrl || null,
        },
        { onConflict: "tmdb_id" },
      )
      .select("id")
      .single();

    if (error) {
      console.error("Movie upsert error:", error);
    } else {
      movieId = (data?.id as number | undefined) ?? null;
    }
  } else {
    try {
      const query = supabase.from("movies").select("id").eq("title_ko", titleKo).limit(1);

      const { data: existing, error: existingError } = releaseDate
        ? await query.eq("release_date", releaseDate).maybeSingle()
        : await query.is("release_date", null).maybeSingle();

      if (existingError) {
        console.error("Movie lookup error:", existingError);
      }

      if (existing?.id) {
        movieId = existing.id as number;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("movies")
          .insert({
            tmdb_id: null,
            title_ko: titleKo,
            title_en: receipt.subtitle || null,
            release_date: releaseDate,
            age_rating: receipt.ageRating || null,
            poster_url: receipt.posterUrl || null,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Movie insert error:", insertError);
        } else {
          movieId = (inserted?.id as number | undefined) ?? null;
        }
      }
    } catch (err) {
      console.error("Movie resolve error:", err);
    }
  }

  // 2) Save movie receipt to movie_prints
  const { data: moviePrintData, error: moviePrintError } = await supabase
    .from("movie_prints")
    .insert({
      mode: receipt.mode,
      payload,
    })
    .select("id")
    .single();

  if (moviePrintError || !moviePrintData) {
    return {
      ok: false as const,
      status: 500,
      body: {
        error: "영수증 저장에 실패했습니다.",
        details: moviePrintError?.message,
      },
    };
  }

  // 3) Link movie_prints -> movies
  if (movieId !== null) {
    const { error } = await supabase.from("movie_print_movies").insert({
      movie_print_id: moviePrintData.id,
      movie_id: movieId,
    });
    if (error) {
      console.error("movie_print_movies insert error:", error);
    }
  }

  return {
    ok: true as const,
    status: 200,
    body: {
      ok: true,
      receiptNumber: moviePrintData.id as number,
    },
  };
}
