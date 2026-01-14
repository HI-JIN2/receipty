"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            <span className="h-[1px] w-6 bg-amber-900/40" />
            About
            <span className="h-[1px] w-6 bg-amber-900/40" />
          </p>
          <h1 className="text-xl font-semibold leading-tight text-stone-900 sm:text-3xl lg:text-4xl">
            제작자의 말
          </h1>
        </header>

        <div className="prose prose-stone max-w-none">
          <div className="space-y-6 text-base leading-relaxed text-stone-700 sm:text-lg">
            <p>
              안녕하세요. Book Receipt를 만든 HI-JIN2입니다.
            </p>
            
            <p>
              전자책을 읽거나 친구에게 책을 빌릴 때, 대출 영수증이 없어서 아쉬웠던 경험이 있었어요.
              작은 영수증 한 장이 있으면 나중에 "언제 이 책을 읽었지?" 하는 순간에 도움이 되고, 
              책을 빌려준 친구와의 추억도 남길 수 있을 것 같아서 만들게 되었어요.
            </p>

            <p>
              이 서비스는 로그인 없이 가볍게 사용할 수 있도록 만들었어요. 
              개인정보는 저장하지 않으며, 단순히 영수증 이미지를 생성하고 
              인기 있는 책 정보만 공유하는 것이 목적이에요.
            </p>

            <p>
              프린트하거나 라벨지로 뽑아서 다이어리나 스크랩북에 붙여보세요. 
              작은 기록들이 모여 소중한 독서 추억이 될 거에요.
            </p>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-stone-500">
                궁금한 점이나 제안사항이 있으시면 언제든지 연락주세요.
              </p>
              <p className="text-sm text-stone-700">
                이메일:{" "}
                <a
                  href="mailto:qldls0307@naver.com"
                  className="font-medium text-amber-900 hover:text-amber-950 hover:underline"
                >
                  qldls0307@naver.com
                </a>
              </p>
              <p className="text-sm italic text-stone-600">
                활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-8 border-t border-[#e2d2bd] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                홈
              </Link>
              <span className="text-sm font-medium text-stone-400">제작자의 말</span>
            </div>
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} HI-JIN2. All rights reserved.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}

