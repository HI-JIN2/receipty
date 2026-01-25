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

export default async function BookStatsPage() {
  type PrintRow = { id: number; payload: unknown };
  type PayloadBook = {
    isbn: string | null;
    title: string;
    author: string | null;
    publisher: string | null;
    cover_url: string | null;
    published_at: string | null;
  };

  const [{ count: printsCount }, { data: printRows, error: printsError }] = await Promise.all([
    // Older rows may not have `payload.kind` (before movie mode existed).
    // In this app, the `prints` table represents book receipts, so we treat missing kind as book.
    supabase
      .from("prints")
      .select("id", { count: "exact", head: true })
      .or("payload->>kind.eq.book,payload->>kind.is.null"),
    supabase
      .from("prints")
      .select("id, payload")
      .or("payload->>kind.eq.book,payload->>kind.is.null")
      .order("printed_at", { ascending: false })
      .range(0, 4999),
  ]);

  if (printsError) {
    console.error("book stats query error:", printsError);
  }

  const countsByBookKey = new Map<
    string,
    {
      title: string;
      author: string | null;
      coverUrl: string | null;
      count: number;
    }
  >();

  const printIdsNeedingFallback: number[] = [];
  const printBookCountedIds = new Set<number>();
  let printBooksCount = 0;

  const normalizeKeyFromPayloadBook = (b: PayloadBook) => {
    const isbn = (b.isbn ?? "").trim();
    if (isbn) return `isbn:${isbn}`;

    const title = (b.title ?? "").trim().toLowerCase();
    const publisher = (b.publisher ?? "").trim().toLowerCase();
    return `title:${title}|${publisher}`;
  };

  const addBookHit = (key: string, book: { title: string; author: string | null; coverUrl: string | null }) => {
    const existing = countsByBookKey.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.coverUrl && book.coverUrl) existing.coverUrl = book.coverUrl;
      if (!existing.author && book.author) existing.author = book.author;
      return;
    }

    countsByBookKey.set(key, {
      title: book.title || "(제목 없음)",
      author: book.author ?? null,
      coverUrl: book.coverUrl ?? null,
      count: 1,
    });
  };

  for (const r of (printRows ?? []) as unknown as PrintRow[]) {
    const payload = r?.payload;
    if (!payload || typeof payload !== "object") continue;

    const kind = "kind" in payload ? (payload as { kind?: unknown }).kind : null;
    if (kind !== null && kind !== undefined && kind !== "book") continue;

    const totalCountRaw = "totalCount" in payload ? (payload as { totalCount?: unknown }).totalCount : null;
    if (typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)) {
      printBooksCount += totalCountRaw;
      printBookCountedIds.add(r.id);
    }

    const rawBooks = "books" in payload ? (payload as { books?: unknown }).books : null;
    if (!Array.isArray(rawBooks)) {
      printIdsNeedingFallback.push(r.id);
      continue;
    }

    const books = rawBooks as unknown as PayloadBook[];
    if (!printBookCountedIds.has(r.id)) {
      printBooksCount += books.length;
      printBookCountedIds.add(r.id);
    }

    for (const b of books) {
      if (!b || typeof b !== "object") continue;
      const title = typeof b.title === "string" ? b.title : "(제목 없음)";
      const author = typeof b.author === "string" ? b.author : null;
      const coverUrl = typeof b.cover_url === "string" ? b.cover_url : null;
      const publisher = typeof b.publisher === "string" ? b.publisher : null;

      const key = normalizeKeyFromPayloadBook({
        isbn: typeof b.isbn === "string" ? b.isbn : null,
        title,
        author,
        publisher,
        cover_url: coverUrl,
        published_at: null,
      });

      addBookHit(key, { title, author, coverUrl });
    }
  }

  if (printIdsNeedingFallback.length > 0) {
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("print_books")
      .select("print_id, books(isbn, title, author, cover_url, publisher)")
      .in("print_id", printIdsNeedingFallback)
      .range(0, 9999);

    if (fallbackError) {
      console.error("book stats fallback join error:", fallbackError);
    }

    for (const r of (fallbackRows ?? []) as unknown as Array<{ print_id: unknown; books: unknown }>) {
      const printId = typeof r.print_id === "number" ? r.print_id : Number(r.print_id);
      const rawBook = r.books;
      const book = Array.isArray(rawBook) ? rawBook[0] : rawBook;
      if (!book || typeof book !== "object") continue;

      const title =
        "title" in book && typeof (book as { title?: unknown }).title === "string"
          ? (book as { title: string }).title
          : "(제목 없음)";

      const author =
        "author" in book && typeof (book as { author?: unknown }).author === "string"
          ? (book as { author: string }).author
          : null;

      const coverUrl =
        "cover_url" in book && typeof (book as { cover_url?: unknown }).cover_url === "string"
          ? (book as { cover_url: string }).cover_url
          : null;

      const isbn =
        "isbn" in book && typeof (book as { isbn?: unknown }).isbn === "string"
          ? (book as { isbn: string }).isbn
          : null;

      const publisher =
        "publisher" in book && typeof (book as { publisher?: unknown }).publisher === "string"
          ? (book as { publisher: string }).publisher
          : null;

      const key = normalizeKeyFromPayloadBook({
        isbn,
        title,
        author,
        publisher,
        cover_url: coverUrl,
        published_at: null,
      });

      addBookHit(key, { title, author, coverUrl });

      if (!printBookCountedIds.has(printId) && Number.isFinite(printId)) {
        printBooksCount += 1;
      }
    }
  }

  const topBooks = Array.from(countsByBookKey.entries())
    .map(([bookKey, info]) => ({
      bookId: bookKey,
      title: info.title,
      author: info.author,
      cover_url: info.coverUrl,
      count: info.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const data = {
    ok: !printsError,
    printsCount: printsCount ?? 0,
    printBooksCount,
    topBooks,
    error: printsError?.message,
  };

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
