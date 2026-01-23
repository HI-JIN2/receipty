import { createClient } from "@supabase/supabase-js";

import type { MovieReceipt } from "@/features/receipts/movie/types";

type SaveMovieReceiptInput = {
  receipt: MovieReceipt;
};

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
    title: receipt.title,
    viewer: receipt.viewer,
    watchedAt: receipt.watchedAt,
    place: receipt.place,
    medium: receipt.medium,
    note: receipt.note,
    format: receipt.format,
    backgroundColor: receipt.backgroundColor,
  };

  const { data: printData, error: printError } = await supabase
    .from("prints")
    .insert({
      format: receipt.format,
      payload,
    })
    .select("id")
    .single();

  if (printError || !printData) {
    return {
      ok: false as const,
      status: 500,
      body: { error: "영수증 저장에 실패했습니다.", details: printError?.message },
    };
  }

  return {
    ok: true as const,
    status: 200,
    body: {
      ok: true,
      receiptNumber: printData.id as number,
    },
  };
}
