import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GET = async () => {
  try {
    const { data, error } = await supabase.rpc("get_stats");

    if (error || !data) {
      console.error("get_stats rpc error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: error?.message ?? "리포트 조회에 실패했습니다.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        printsCount: data.printsCount ?? 0,
        printBooksCount: data.printBooksCount ?? 0,
        topBooks: data.topBooks ?? [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "리포트 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};

