import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";

export default function CreditsPage() {
  return (
    <SiteChrome activeHref="/credits">
      <section className="flex flex-col gap-6 sm:gap-10">
        <PageHeader
          eyebrow="Credits"
          title="Licenses"
          description="Required attributions and licenses."
        />

        <section className="ui-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Fonts</h2>
          <div className="mt-4 space-y-4 text-sm text-[var(--ui-muted)]">
            <div className="rounded-2xl bg-black/5 p-4">
              <div className="font-semibold text-[var(--foreground)]">Galmuri</div>
              <div className="mt-1">License: SIL Open Font License 1.1</div>
              <div className="mt-1">Source: `galmuri` (npm)</div>
            </div>

            <div className="rounded-2xl bg-black/5 p-4">
              <div className="font-semibold text-[var(--foreground)]">IBM Plex Sans KR</div>
              <div className="mt-1">License: SIL Open Font License 1.1</div>
              <div className="mt-1">Source: Google Fonts</div>
            </div>

            <div className="rounded-2xl bg-black/5 p-4">
              <div className="font-semibold text-[var(--foreground)]">PFStardust</div>
              <div className="mt-1">
                Source:{" "}
                <a
                  className="font-semibold text-[var(--ui-primary)] hover:underline"
                  href="https://noonnu.cc/font_page/393"
                  target="_blank"
                  rel="noreferrer"
                >
                  noonnu.cc/font_page/393
                </a>
              </div>
              <div className="mt-1">License: see source page (restrictions apply)</div>
            </div>
          </div>
        </section>

        <section className="ui-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Data & APIs</h2>
          <div className="mt-4 space-y-4 text-sm text-[var(--ui-muted)]">
            <div className="rounded-2xl bg-black/5 p-4">
              <div className="font-semibold text-[var(--foreground)]">TMDB</div>
              <div className="mt-1">
                Attribution: “This product uses the TMDB API but is not endorsed or certified by TMDB.”
              </div>
            </div>

            <div className="rounded-2xl bg-black/5 p-4">
              <div className="font-semibold text-[var(--foreground)]">Naver Search API</div>
              <div className="mt-1">Attribution: Powered by NAVER Open API.</div>
            </div>
          </div>
        </section>
      </section>
    </SiteChrome>
  );
}
