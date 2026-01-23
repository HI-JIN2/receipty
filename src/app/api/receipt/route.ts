import { NextResponse } from "next/server";

import type { BaseReceipt } from "@/features/receipts/core/types";
import type { BookResult } from "@/features/receipts/book/types";
import { saveBookReceipt } from "@/features/receipts/book/server/saveBookReceipt";

// Backward compatibility: older clients POST here.
export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as {
      selected: BookResult[];
      receipt: BaseReceipt;
    };

    const result = await saveBookReceipt({
      selected: body.selected,
      receipt: body.receipt,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    );
  }
};


