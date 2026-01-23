import { NextResponse } from "next/server";

import type { BaseReceipt } from "@/features/receipts/core/types";
import type { BookResult } from "@/features/receipts/book/types";
import { saveBookReceipt } from "@/features/receipts/book/server/saveBookReceipt";
import type { MovieReceipt } from "@/features/receipts/movie/types";
import { saveMovieReceipt } from "@/features/receipts/movie/server/saveMovieReceipt";

type ReceiptsPostBody =
  | {
      kind: "book";
      selected: BookResult[];
      receipt: BaseReceipt;
    }
  | {
      kind: "movie";
      receipt: MovieReceipt;
    };

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as ReceiptsPostBody;

    if (!body?.kind) {
      return NextResponse.json({ error: "kind가 필요합니다." }, { status: 400 });
    }

    if (body.kind === "book") {
      const result = await saveBookReceipt({
        selected: body.selected,
        receipt: body.receipt,
      });
      return NextResponse.json(result.body, { status: result.status });
    }

    const result = await saveMovieReceipt({ receipt: body.receipt });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};
