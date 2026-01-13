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

type IncomingBook = {
  title: string;
  author: string;
  publisher: string;
  published_at: string | null;
  isbn: string | null;
  cover_url: string;
  link?: string;
  source?: string;
};

type IncomingReceipt = {
  title: string;
  renter: string;
  rentalDate: string;
  returnDate: string;
  note: string;
  format: string;
  backgroundColor: string;
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as {
      selected: IncomingBook[];
      receipt: IncomingReceipt;
    };

    const { selected, receipt } = body;

    if (!selected || selected.length === 0) {
      return NextResponse.json(
        { error: "선택된 도서가 없습니다." },
        { status: 400 },
      );
    }

    // books upsert + prints insert를 단순 순차 처리
    const results: { bookId: string | null; error?: string }[] = [];

    for (const book of selected) {
      // 1) books upsert
      let bookId: string | null = null;

      if (book.isbn) {
        const { data, error } = await supabase
          .from("books")
          .upsert(
            {
              isbn: book.isbn,
              title: book.title,
              author: book.author,
              publisher: book.publisher,
              cover_url: book.cover_url,
              published_at: book.published_at,
            },
            { onConflict: "isbn" },
          )
          .select("id")
          .single();

        if (error) {
          results.push({ bookId: null, error: error.message });
          continue;
        }
        bookId = data?.id ?? null;
      } else {
        const { data, error } = await supabase
          .from("books")
          .insert({
            isbn: null,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            cover_url: book.cover_url,
            published_at: book.published_at,
          })
          .select("id")
          .single();

        if (error) {
          results.push({ bookId: null, error: error.message });
          continue;
        }
        bookId = data?.id ?? null;
      }

      if (!bookId) {
        results.push({ bookId: null, error: "book id를 가져오지 못했습니다." });
        continue;
      }

      // 2) prints insert (한 권당 한 행)
      const payload = {
        renter: receipt.renter,
        rentalDate: receipt.rentalDate,
        returnDate: receipt.returnDate,
        note: receipt.note,
        title: receipt.title,
        format: receipt.format,
        backgroundColor: receipt.backgroundColor,
        totalCount: selected.length,
      };

      const { error: printError } = await supabase.from("prints").insert({
        book_id: bookId,
        format: receipt.format,
        payload,
      });

      if (printError) {
        results.push({ bookId, error: printError.message });
      } else {
        results.push({ bookId });
      }
    }

    const failed = results.filter((r) => r.error);
    if (failed.length > 0 && failed.length === results.length) {
      // 전부 실패
      return NextResponse.json(
        { error: "모든 기록 저장에 실패했습니다.", details: failed },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      saved: results.filter((r) => !r.error).length,
      failed: failed.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};


