"use client";

import Link from "next/link";

export default function HallOfFamePage() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            <span className="h-[1px] w-6 bg-amber-900/40" />
            Hall of Fame
            <span className="h-[1px] w-6 bg-amber-900/40" />
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl lg:text-4xl">
            명예의 전당
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-900 sm:text-4xl">
              Coming Soon!
            </h2>
            <p className="text-base text-stone-700 sm:text-lg">
              활용한 사진을 이메일로 보내주시면 사이트에 함께 공유할게요.
            </p>
            <p className="text-sm text-stone-600 sm:text-base">
              이메일:{" "}
              <a
                href="mailto:qldls0307@naver.com"
                className="font-medium text-amber-900 hover:text-amber-950 hover:underline"
              >
                qldls0307@naver.com
              </a>
            </p>
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
              <Link
                href="/stats"
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                독서 발자국
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-stone-600 transition hover:text-amber-900"
              >
                제작자의 말
              </Link>
              <span className="text-sm font-medium text-stone-400">명예의 전당</span>
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

