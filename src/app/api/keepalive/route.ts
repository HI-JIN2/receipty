import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const keepaliveToken = process.env.KEEPALIVE_TOKEN ?? null;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function isAuthorized(req: Request) {
  if (!keepaliveToken) return true;

  const authorization = req.headers.get("authorization");
  const tokenFromHeader = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;

  if (tokenFromHeader === keepaliveToken) return true;

  const url = new URL(req.url);
  const tokenFromQuery = url.searchParams.get("token");

  return tokenFromQuery === keepaliveToken;
}

export const GET = async (req: Request) => {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const startedAt = Date.now();

    // A tiny read to keep Supabase active (no user data returned).
    const { error } = await supabase.from("prints").select("id").limit(1);

    const latencyMs = Date.now() - startedAt;

    if (error) {
      console.error("keepalive supabase error:", error);
    }

    return NextResponse.json(
      {
        ok: !error,
        ts: new Date().toISOString(),
        latencyMs,
        error: error?.message,
      },
      {
        status: error ? 500 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error("keepalive error:", err);
    return NextResponse.json(
      { ok: false, error: "예상치 못한 오류가 발생했습니다." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
};
