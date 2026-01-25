import Link from "next/link";

type NavHref =
  | "/"
  | "/book"
  | "/book/stats"
  | "/movie"
  | "/movie/stats"
  | "/about"
  | "/hall-of-fame"
  | "/credits";

type Mode = "book" | "movie";

type SiteChromeProps = {
  children: React.ReactNode;
  activeHref?: NavHref;
};

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4.5h10.5a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V6.5a2 2 0 0 1 2-2Z" />
      <path d="M6 18h10.5" />
      <path d="M8 7.5h7" />
      <path d="M8 10.5h7" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M4 18h16" />
      <path d="M6 6v12" />
      <path d="M18 6v12" />
      <path d="M4 9h2" />
      <path d="M4 12h2" />
      <path d="M4 15h2" />
      <path d="M18 9h2" />
      <path d="M18 12h2" />
      <path d="M18 15h2" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  activeHref,
}: {
  href: NavHref;
  label: string;
  activeHref?: NavHref;
}) {
  const isActive = href === activeHref;
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-[var(--ui-radius-pill)] px-3 py-2 text-sm font-semibold transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
        isActive
          ? "bg-[var(--ui-card-solid)] text-[var(--foreground)] shadow-sm"
          : "text-[var(--ui-muted)] hover:bg-[var(--ui-card-solid)] hover:text-[var(--foreground)] hover:shadow-[var(--ui-shadow-hover)]"
      }`}
    >
      {label}
    </Link>
  );
}

function ModePill({
  mode,
  href,
  label,
  active,
  icon,
}: {
  mode: Mode;
  href: "/book" | "/movie" | "/book/stats" | "/movie/stats";
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-mode={mode}
      className={`group inline-flex items-center gap-2 rounded-[var(--ui-radius-pill)] px-3 py-2 text-sm font-semibold transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
        active
          ? "bg-[var(--ui-card-solid)] text-[var(--foreground)] shadow-sm"
          : "text-[var(--ui-muted)] hover:bg-[var(--ui-card-solid)] hover:text-[var(--foreground)] hover:shadow-[var(--ui-shadow-hover)]"
      }`}
    >
      <span className="h-4 w-4 opacity-80 transition group-hover:opacity-100">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function SiteChrome({ children, activeHref }: SiteChromeProps) {
  const mode: Mode = activeHref?.startsWith("/movie") ? "movie" : "book";
  const isStatsPage = activeHref === "/book/stats" || activeHref === "/movie/stats";
  const makerHref: NavHref = mode === "movie" ? "/movie" : "/book";
  const statsHref: NavHref = mode === "movie" ? "/movie/stats" : "/book/stats";
  const bookModeHref: "/book" | "/book/stats" = isStatsPage ? "/book/stats" : "/book";
  const movieModeHref: "/movie" | "/movie/stats" = isStatsPage ? "/movie/stats" : "/movie";

  return (
    <div className="relative min-h-screen text-[var(--foreground)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--ui-border)] bg-[color-mix(in_srgb,var(--ui-card-solid)_65%,transparent)] backdrop-blur">
        <input id="site-drawer" type="checkbox" className="peer sr-only" />

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-[var(--ui-page-pad-x)] py-[var(--ui-header-pad-y)] sm:px-[var(--ui-page-pad-x-sm)]">
          <Link href="/" className="flex items-baseline gap-2">
            <span
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-book-cafe), var(--font-ui)" }}
            >
              receipty
            </span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex items-center gap-1 rounded-[var(--ui-radius-pill)] border border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] p-1">
              <ModePill
                mode="book"
                href={bookModeHref}
                label="도서"
                active={mode === "book"}
                icon={<BookIcon className="h-4 w-4" />}
              />
              <ModePill
                mode="movie"
                href={movieModeHref}
                label="영화"
                active={mode === "movie"}
                icon={<FilmIcon className="h-4 w-4" />}
              />
            </div>

            <div aria-hidden className="h-5 w-px bg-black/10" />

            <NavLink href={makerHref} label="영수증 만들기" activeHref={activeHref} />
            <NavLink href={statsHref} label="리포트" activeHref={activeHref} />
          </nav>

          <nav className="flex items-center sm:hidden">
            <label
              htmlFor="site-drawer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--ui-radius-pill)] border border-[var(--ui-border)] bg-[var(--ui-card-solid)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--ui-shadow-hover)] active:translate-y-0"
            >
              <span className="text-xs font-bold tracking-[0.16em] text-[var(--ui-muted)]">메뉴</span>
              <span aria-hidden className="grid h-4 w-4 place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 7h14" />
                  <path d="M5 12h14" />
                  <path d="M5 17h14" />
                </svg>
              </span>
            </label>
          </nav>
        </div>

        <label
          htmlFor="site-drawer"
          className="pointer-events-none fixed inset-0 z-50 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 peer-checked:pointer-events-auto peer-checked:opacity-100 sm:hidden"
        />

        <aside className="fixed right-0 top-0 z-50 h-dvh w-[min(288px,84vw)] translate-x-full border-l border-[var(--ui-border)] bg-[var(--ui-card-solid)] p-4 shadow-2xl transition-transform duration-200 ease-out peer-checked:translate-x-0 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[var(--foreground)]">메뉴</div>
            <label
              htmlFor="site-drawer"
              className="inline-flex cursor-pointer items-center justify-center rounded-[var(--ui-radius-pill)] border border-[var(--ui-border)] bg-white/60 px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--ui-shadow-hover)] active:translate-y-0"
            >
              닫기
            </label>
          </div>

          <div className="mt-4 rounded-[var(--ui-radius-control)] border border-[var(--ui-border)] bg-[var(--ui-secondary-bg)] p-2">
            <div className="grid grid-cols-2 gap-2">
              <ModePill
                mode="book"
                href={bookModeHref}
                label="도서"
                active={mode === "book"}
                icon={<BookIcon className="h-4 w-4" />}
              />
              <ModePill
                mode="movie"
                href={movieModeHref}
                label="영화"
                active={mode === "movie"}
                icon={<FilmIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <NavLink href={makerHref} label="영수증 만들기" activeHref={activeHref} />
            <NavLink href={statsHref} label="리포트" activeHref={activeHref} />
          </div>

          <div className="mt-6 border-t border-[var(--ui-border)] pt-4">
            <div className="text-xs font-bold tracking-[0.16em] text-[var(--ui-muted)]">정보</div>
            <div className="mt-2 grid gap-2">
              <NavLink href="/about" label="제작자의 말" activeHref={activeHref} />
              <NavLink href="/hall-of-fame" label="명예의 전당" activeHref={activeHref} />
              <NavLink href="/credits" label="라이선스" activeHref={activeHref} />
            </div>
          </div>
        </aside>
      </header>

      <main className="mx-auto max-w-5xl overflow-x-hidden px-[var(--ui-page-pad-x)] py-[var(--ui-page-pad-y)] sm:px-[var(--ui-page-pad-x-sm)] sm:py-[var(--ui-page-pad-y-sm)]">
        {children}
      </main>

      <footer className="mx-auto max-w-5xl px-[var(--ui-page-pad-x)] pb-10 sm:px-[var(--ui-page-pad-x-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ui-border)] pt-6 text-sm text-[var(--ui-muted)]">
          <div
            className="font-semibold tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-book-cafe), var(--font-ui)" }}
          >
            receipty
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/about" className="rounded-md px-3 py-1 transition hover:bg-black/5 hover:text-[var(--foreground)]">
              제작자의 말
            </Link>
            <Link
              href="/hall-of-fame"
              className="rounded-md px-3 py-1 transition hover:bg-black/5 hover:text-[var(--foreground)]"
            >
              명예의 전당
            </Link>
            <Link
              href="/credits"
              className="rounded-md px-3 py-1 transition hover:bg-black/5 hover:text-[var(--foreground)]"
            >
              라이선스
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
