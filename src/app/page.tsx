import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";
import HomeHeroPreview from "@/components/HomeHeroPreview";

export default function HomePage() {
  return (
    <SiteChrome activeHref="/">
      <section className="flex flex-col gap-6 sm:gap-10">
        <PageHeader
          eyebrow="Receipty Studio"
          title="기록을 영수증처럼"
          description={[
            "도서, 영화 같은 취향 기록을 작은 영수증으로 만들고 저장해요.",
            "로그인 없이 바로 만들고, JPEG로 간직할 수 있어요.",
          ]}
          visual={<HomeHeroPreview />}
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
            <h2
              className="text-lg font-medium text-[var(--foreground)]"
              style={{ fontFamily: "Galmuri11, var(--font-ui)" }}
            >
              영화 영수증
            </h2>
          </div>
          <p className="mt-2 text-sm text-[var(--ui-muted)]">
            영수증/포토티켓/미니 영수증으로 티켓 기록을 남겨요.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ui-primary)]">시작하기 →</p>
        </Link>
      </div>
      </section>
    </SiteChrome>
  );
}
