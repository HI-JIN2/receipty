import { NextResponse } from "next/server";

const NAVER_ID = process.env.NAVER_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;

const NAVER_BOOK_ENDPOINT = "https://openapi.naver.com/v1/search/book.json";

type NaverBookItem = {
  title?: string;
  author?: string;
  publisher?: string;
  pubdate?: string;
  isbn?: string;
  image?: string;
  link?: string;
};

const stripHtml = (text?: string) =>
  (text ?? "").replace(/<[^>]+>/g, "").trim();

const extractIsbn13 = (isbn?: string) => {
  const raw = (isbn ?? "").replace(/\s+/g, "");
  return raw.length > 13 ? raw.slice(-13) : raw || null;
};

export const GET = async (req: Request) => {
  if (!NAVER_ID || !NAVER_SECRET) {
    return NextResponse.json(
      { error: "Missing Naver API credentials" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const url = new URL(NAVER_BOOK_ENDPOINT);
  url.searchParams.set("query", q);
  url.searchParams.set("display", "20");
  url.searchParams.set("sort", "sim");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": NAVER_ID,
      "X-Naver-Client-Secret": NAVER_SECRET,
    },
    // 결과 캐시는 하지 않고 매 요청마다 최신 검색
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { error: errorText || "Naver API error" },
      { status: res.status },
    );
  }

  const data = (await res.json()) as { items?: NaverBookItem[] };
  const items =
    data.items?.map((item) => {
      const isbn = extractIsbn13(item.isbn);
      return {
        title: stripHtml(item.title),
        author: stripHtml(item.author),
        publisher: stripHtml(item.publisher),
        published_at: item.pubdate ?? null,
        isbn,
        cover_url: item.image ?? "",
        link: item.link ?? "",
        source: "naver",
      };
    }) ?? [];

  return NextResponse.json({ items });
};


