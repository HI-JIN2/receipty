import Link from "next/link";

type NavHref = "/" | "/stats" | "/about" | "/hall-of-fame";

type SiteChromeProps = {
  children: React.ReactNode;
  activeHref?: NavHref;
};

const navItems: Array<{ href: NavHref; label: string }> = [
  { href: "/", label: "홈" },
  { href: "/stats", label: "독서 발자국" },
  { href: "/about", label: "제작자의 말" },
  { href: "/hall-of-fame", label: "명예의 전당" },
];

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
      className={`rounded-[var(--ui-radius-pill)] px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-[var(--ui-card-solid)] text-[var(--foreground)] shadow-sm"
          : "text-[var(--ui-muted)] hover:bg-[var(--ui-card-solid)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteChrome({ children, activeHref }: SiteChromeProps) {
  return (
    <div className="relative min-h-screen text-[var(--foreground)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--ui-border)] bg-[color-mix(in_srgb,var(--ui-card-solid)_65%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-book-cafe), var(--font-ui)" }}
            >
              Receipt Marker
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                activeHref={activeHref}
              />
            ))}
          </nav>
          <nav className="flex items-center gap-1 sm:hidden">
            <Link
              href="/stats"
              className="rounded-[var(--ui-radius-pill)] bg-[var(--ui-card-solid)] px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm"
            >
              통계
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <div className="pb-10" />
    </div>
  );
}
