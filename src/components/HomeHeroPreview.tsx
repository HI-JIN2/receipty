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
      <div className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--ui-primary)_10%,transparent)] blur-2xl sm:-right-10 sm:-top-10" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--ui-accent)_10%,transparent)] blur-2xl" />

      <button
        type="button"
        onClick={next}
        className="group relative w-full text-left focus-visible:outline-none focus-visible:rounded-2xl focus-visible:shadow-[0_0_0_4px_var(--ui-ring)]"
        aria-label="예시 바꾸기"
      >
        <div className="relative mt-3">
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--ui-card-solid)_55%,transparent)] transition-transform duration-200 ease-out group-hover:scale-[1.01] sm:h-[380px] lg:h-[420px]">
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
                className={`h-1.5 w-1.5 rounded-full transition ${
                  active
                    ? "bg-[var(--ui-primary)]"
                    : "bg-black/15 group-hover:bg-black/25"
                }`}
              />
            );
          })}
        </div>
      </button>
    </div>
  );
}
