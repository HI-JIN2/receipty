"use client";

import Image from "next/image";
import * as React from "react";

type Preview = {
  src: string;
  alt: string;
  label: string;
};

const exampleSrc = (fileName: string) => encodeURI(`/examples/${fileName}`);

const PREVIEWS: Preview[] = [
  {
    src: exampleSrc("book-receipt-Book Receipt-1769317991157.jpg"),
    alt: "도서 영수증 예시",
    label: "도서",
  },
  {
    src: exampleSrc("movie-receipt-주토피아 2-1769317378392.jpg"),
    alt: "영화 영수증 예시",
    label: "영화",
  },
  {
    src: exampleSrc("movie-mini-주토피아 2-1769317385094.jpg"),
    alt: "미니 영수증 예시",
    label: "영화",
  },
  {
    src: exampleSrc("movie-photo-주토피아 2-1769317391917.jpg"),
    alt: "포토티켓 예시",
    label: "영화",
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

  const current = PREVIEWS[idx] ?? PREVIEWS[0];
  const next = () => setIdx((i) => (i + 1) % PREVIEWS.length);

  return (
    <div
      className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px]"
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
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[color-mix(in_srgb,var(--ui-card-solid)_70%,transparent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-muted)] backdrop-blur">
            {current.label}
          </div>

          <div className="relative overflow-hidden rounded-2xl transition-transform duration-200 ease-out group-hover:scale-[1.01]">
            <div key={current.src} className="ui-fade-in-up">
              <Image
                src={current.src}
                alt={current.alt}
                width={720}
                height={960}
                className="h-auto w-full"
                priority
              />
            </div>
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
