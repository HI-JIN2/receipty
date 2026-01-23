import { createClient } from "@supabase/supabase-js";

import type { BaseReceipt } from "@/features/receipts/core/types";
import type { BookResult } from "@/features/receipts/book/types";

type SaveBookReceiptInput = {
  selected: BookResult[];
  receipt: BaseReceipt;
};

export async function saveBookReceipt(input: SaveBookReceiptInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { selected, receipt } = input;

  if (!selected || selected.length === 0) {
    return {
      ok: false as const,
      status: 400,
      body: { error: "선택된 도서가 없습니다." },
    };
  }

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

    if (bookId) bookIds.push(bookId);
  }

  if (bookIds.length === 0) {
    return {
      ok: false as const,
      status: 500,
      body: { error: "도서 정보 저장에 실패했습니다." },
    };
  }

  const payload = {
    kind: "book" as const,
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
    return {
      ok: false as const,
      status: 500,
      body: { error: "영수증 저장에 실패했습니다.", details: printError?.message },
    };
  }

  const printId = printData.id;

  const printBooksData = bookIds.map((bookId) => ({
    print_id: printId,
    book_id: bookId,
  }));

  const { error: printBooksError } = await supabase
    .from("print_books")
    .insert(printBooksData);

  if (printBooksError) {
    console.error("Print books insert error:", printBooksError);
  }

  return {
    ok: true as const,
    status: 200,
    body: {
      ok: true,
      saved: bookIds.length,
      receiptNumber: printData.id as number,
    },
  };
}
