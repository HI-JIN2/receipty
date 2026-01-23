import Link from "next/link";
import Image from "next/image";
import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";

export default function HomePage() {
  return (
    <SiteChrome activeHref="/">
      <section className="flex flex-col gap-6 sm:gap-10">
        <PageHeader
          eyebrow="Receipt Marker"
          title="기록을 영수증처럼."
          description={[
            "도서, 영화 같은 취향 기록을 작은 영수증으로 만들고 저장해요.",
            "로그인 없이 바로 만들고, JPEG로 간직할 수 있어요.",
          ]}
        />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/book"
          className="ui-card p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-lg font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-book-cafe), var(--font-ui)" }}
            >
              도서 영수증
            </h2>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">
            전자책/대여/북카페 기록을 영수증처럼 남겨요.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ui-primary)]">시작하기 →</p>
        </Link>

        <Link
          href="/movie"
          className="ui-card p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">영화 영수증</h2>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">
            영수증/포토티켓/미니 영수증으로 티켓 기록을 남겨요.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ui-primary)]">시작하기 →</p>
        </Link>
      </div>

      <section className="ui-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">예시 미리보기</h2>
        <p className="mt-2 text-sm text-[var(--ui-muted)]">
          도서/영화 영수증은 이런 느낌이에요. (샘플)
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--ui-radius-card)] border border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ui-muted)]">
              Book
            </div>
            <Image
              src="/examples/book-receipt.svg"
              alt="Sample book receipt preview"
              width={720}
              height={960}
              className="mt-3 h-auto w-full rounded-2xl border border-black/10 bg-white"
            />
          </div>

          <div className="rounded-[var(--ui-radius-card)] border border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ui-muted)]">
              Movie
            </div>
            <Image
              src="/examples/movie-receipt.svg"
              alt="Sample movie receipt preview"
              width={720}
              height={960}
              className="mt-3 h-auto w-full rounded-2xl border border-black/10 bg-white"
            />
          </div>
        </div>
      </section>
      </section>
    </SiteChrome>
  );
}
