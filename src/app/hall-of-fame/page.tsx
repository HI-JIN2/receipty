import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";

export default function HallOfFamePage() {
  return (
    <SiteChrome activeHref="/hall-of-fame">
      <section className="flex flex-col gap-6 sm:gap-10">
        <PageHeader
          eyebrow="Receipty Studio"
          title="명예의 전당"
          description="여러분이 만든 영수증 사진을 모아둘게요."
        />

        <div className="ui-card flex flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">준비 중</h2>
            <p className="text-base text-[var(--ui-muted)] sm:text-lg">
              활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.
            </p>
            <p className="text-sm text-[var(--ui-muted)] sm:text-base">
              이메일:{" "}
              <a
                href="mailto:qldls0307@naver.com"
                className="font-semibold text-[var(--ui-primary)] hover:underline"
              >
                qldls0307@naver.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
