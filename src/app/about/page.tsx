import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";

export default function AboutPage() {
  return (
    <SiteChrome activeHref="/about">
      <section className="flex flex-col gap-6 sm:gap-10">
        <PageHeader eyebrow="Receipty Studio" title="제작자의 말" />

        <div className="ui-card p-6 sm:p-8">
          <div className="space-y-6 text-base leading-relaxed text-[var(--ui-muted)] sm:text-lg">
            <p>안녕하세요. 아날로그를 좋아하는 개발자 HI-JIN2입니다.</p>

            <p>
              전자책을 읽거나 친구에게 책을 빌릴 때, 대출 영수증이 없어서 아쉬웠던 순간이 있었어요.
              작은 영수증 한 장이 있으면 나중에 &quot;언제 이 책을 읽었지?&quot; 하는 순간에 도움이 되고, 책을
              빌려준 친구와의 추억도 남길 수 있을 것 같아서 만들었어요.
            </p>

            <p>
              Receipty Studio는 로그인 없이 가볍게 사용할 수 있어요. 개인정보는 저장하지 않고, 영수증
              이미지를 만들어 저장할 수 있게 하는 데 집중했어요.
            </p>

            <p>
              프린트하거나 라벨지로 뽑아서 다이어리나 스크랩북에 붙여보세요. 작은 기록들이 모여 소중한
              추억이 될 거예요.
            </p>

            <div className="space-y-3 pt-4">
              <p className="text-sm text-[var(--ui-muted)]">궁금한 점이나 제안이 있다면 언제든지 연락주세요.</p>
              <p className="text-sm text-[var(--ui-muted)]">
                활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.
              </p>
              <p className="text-sm text-[var(--ui-muted)]">
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
        </div>

      </section>
    </SiteChrome>
  );
}
