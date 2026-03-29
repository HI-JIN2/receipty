"use client";

import Image from "next/image";
import * as React from "react";

type Preview = {
  src: string;
  alt: string;
};

const exampleSrc = (fileName: string) => `/examples/${fileName}`;

const PREVIEWS: Preview[] = [
  {
    src: exampleSrc("book-receipt.jpg"),
    alt: "도서 영수증 예시",
  },
  {
    src: exampleSrc("movie-receipt.jpg"),
    alt: "영화 영수증 예시",
  },
  {
    src: exampleSrc("movie-mini.jpg"),
    alt: "미니 영수증 예시",
  },
  {
    src: exampleSrc("movie-photo.jpg"),
    alt: "포토티켓 예시",
  },
];

export default function HomeHeroPreview() {
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % PREVIEWS.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % PREVIEWS.length);

  return (
    <div
      className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[300px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 bg-[var(--ui-primary)]/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 bg-[var(--ui-accent)]/10" />

      <button
        type="button"
        onClick={next}
        className="group relative w-full text-left focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--ui-ring)]"
        aria-label="예시 바꾸기"
      >
        <div className="relative mt-3 shadow-[var(--retro-outset-shadow)] bg-[var(--background)]">
          <div className="flex h-5 items-center justify-between bg-gradient-to-r from-[var(--ui-primary)] to-[#1084d0] px-2 text-[10px] font-bold text-white">
            <span className="flex items-center gap-1 uppercase tracking-tight">preview.exe</span>
            <div className="flex gap-0.5">
              <div className="h-3.5 w-3.5 bg-[var(--background)] shadow-[var(--retro-outset-shadow)]" />
              <div className="h-3.5 w-3.5 bg-[var(--background)] shadow-[var(--retro-outset-shadow)]" />
            </div>
          </div>
          <div className="relative h-[320px] overflow-hidden bg-white sm:h-[380px] lg:h-[420px]">
            {PREVIEWS.map((p, i) => {
              const active = i === idx;
              return (
                <div
                  key={p.src}
                  aria-hidden={!active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out will-change-[opacity,transform] ${
                    active ? "opacity-100 scale-100" : "opacity-0 scale-[1.015]"
                  }`}
                >
                  <div className="absolute inset-0 p-3 sm:p-4">
                    <div className="relative h-full w-full">
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
                        className="object-contain"
                        priority={i === 0}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {PREVIEWS.map((p, i) => {
            const active = i === idx;
            return (
              <span
                key={p.src}
                aria-hidden
                className={`h-2 w-2 transition ${
                  active
                    ? "bg-[var(--ui-primary)] shadow-[var(--retro-inset-shadow)]"
                    : "bg-[var(--background)] shadow-[var(--retro-outset-shadow)] group-hover:bg-white"
                }`}
              />
            );
          })}
        </div>
      </button>
    </div>
  );
}
