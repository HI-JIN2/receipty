import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export default function HomePage() {
  return (
    <SiteChrome activeHref="/">
      <header className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-black/20" />
          Receipt Marker
          <span className="h-[1px] w-6 bg-black/20" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          기록을 영수증처럼.
        </h1>
        <p className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
          도서, 영화 같은 취향 기록을 작은 영수증으로 만들고 저장해요.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/book"
          className="ui-card group p-6 transition hover:shadow-[var(--ui-shadow-hover)]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-lg font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-book-cafe), var(--font-ui)" }}
            >
              도서 영수증
            </h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--ui-muted)]">
              만들기
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">
            전자책/대여/북카페 기록을 영수증처럼 남겨요.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ui-primary)]">시작하기 →</p>
        </Link>

        <Link
          href="/movie"
          className="ui-card group p-6 transition hover:shadow-[var(--ui-shadow-hover)]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">영화 영수증</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--ui-muted)]">
              만들기
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">
            영수증/포토티켓/미니 영수증으로 티켓 기록을 남겨요.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ui-primary)]">시작하기 →</p>
        </Link>
      </div>
    </SiteChrome>
  );
}
