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

    // 1) 모든 책을 books 테이블에 upsert/insert
    const bookIds: string[] = [];
    
    for (const book of selected) {
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
          console.error("Book upsert error:", error);
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
          console.error("Book insert error:", error);
          continue;
        }
        bookId = data?.id ?? null;
      }

      if (bookId) {
        bookIds.push(bookId);
      }
    }

    if (bookIds.length === 0) {
      return NextResponse.json(
        { error: "도서 정보 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    // 2) prints 테이블에 영수증 정보 저장 (한 번만)
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

    const { data: printData, error: printError } = await supabase
      .from("prints")
      .insert({
        format: receipt.format,
        payload,
      })
      .select("id")
      .single();

    if (printError || !printData) {
      return NextResponse.json(
        { error: "영수증 저장에 실패했습니다.", details: printError?.message },
        { status: 500 },
      );
    }

    const printId = printData.id;

    // 3) print_books 테이블에 영수증과 도서 관계 저장
    const printBooksData = bookIds.map((bookId) => ({
      print_id: printId,
      book_id: bookId,
    }));

    const { error: printBooksError } = await supabase
      .from("print_books")
      .insert(printBooksData);

    if (printBooksError) {
      console.error("Print books insert error:", printBooksError);
      // prints는 저장되었지만 print_books 저장 실패는 경고만
    }

    // 저장된 print의 id가 발급번호
    const receiptNumber = printData.id as number;

    return NextResponse.json({
      ok: true,
      saved: bookIds.length,
      receiptNumber, // 발급번호 (print id)
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};



