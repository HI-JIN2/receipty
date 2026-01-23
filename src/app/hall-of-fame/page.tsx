import SiteChrome from "@/components/SiteChrome";

export default function HallOfFamePage() {
  return (
    <SiteChrome activeHref="/hall-of-fame">
      <header className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-black/20" />
          Hall of Fame
          <span className="h-[1px] w-6 bg-black/20" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          명예의 전당
        </h1>
      </header>

      <div className="ui-card mt-8 flex flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">Coming Soon!</h2>
          <p className="text-base text-[var(--ui-muted)] sm:text-lg">
            활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.
          </p>
          <p className="text-sm text-[var(--ui-muted)] sm:text-base">
            이메일: {" "}
            <a
              href="mailto:qldls0307@naver.com"
              className="font-semibold text-[var(--ui-primary)] hover:underline"
            >
              qldls0307@naver.com
            </a>
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
