import Link from "next/link";

import SiteChrome from "@/components/SiteChrome";

export default function AboutPage() {
  return (
    <SiteChrome activeHref="/about">
      <header className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-black/20" />
          About
          <span className="h-[1px] w-6 bg-black/20" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          제작자의 말
        </h1>
      </header>

      <div className="ui-card mt-6 p-6 sm:p-8">
        <div className="space-y-6 text-base leading-relaxed text-[var(--ui-muted)] sm:text-lg">
          <p>안녕하세요. 아날로그를 좋아하는 개발자 HI-JIN2입니다.</p>

          <p>
            전자책을 읽거나 친구에게 책을 빌릴 때, 대출 영수증이 없어서 아쉬웠던 경험이 있었어요.
            작은 영수증 한 장이 있으면 나중에 &quot;언제 이 책을 읽었지?&quot; 하는 순간에 도움이 되고, 책을
            빌려준 친구와의 추억도 남길 수 있을 것 같아서 만들게 되었어요.
          </p>

          <p>
            이 서비스는 로그인 없이 가볍게 사용할 수 있도록 만들었어요. 개인정보는 저장하지 않으며,
            단순히 영수증 이미지를 생성하고 인기 있는 책 정보만 공유하는 것이 목적이에요.
          </p>

          <p>
            프린트하거나 라벨지로 뽑아서 다이어리나 스크랩북에 붙여보세요. 작은 기록들이 모여 소중한
            독서 추억이 될 거에요.
          </p>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-[var(--ui-muted)]">궁금한 점이나 제안사항이 있으시면 언제든지 연락주세요.</p>
            <p className="text-sm text-[var(--ui-muted)]">활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.</p>
            <p className="text-sm text-[var(--ui-muted)]">
              이메일: {" "}
              <a
                href="mailto:qldls0307@naver.com"
                className="font-semibold text-[var(--ui-primary)] hover:underline"
              >
                qldls0307@naver.com
              </a>
            </p>
          </div>

          <div className="pt-6">
            <Link
              href="/credits"
              className="inline-flex items-center gap-2 rounded-[var(--ui-radius-control)] border border-[var(--ui-secondary-border)] bg-[var(--ui-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--ui-muted)] hover:bg-[var(--ui-secondary-hover-bg)]"
            >
              폰트/저작권 보기
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6" />
    </SiteChrome>
  );
}
