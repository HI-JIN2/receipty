import Image from "next/image";

type RankedMediaItemProps = {
  rank: number;
  imageSrc?: string | null;
  imageAlt: string;
  primaryText: string;
  secondaryText?: string | null;
  count: number;
  countSuffix?: string;
  secondaryFallback?: string;
};

export default function RankedMediaItem({
  rank,
  imageSrc,
  imageAlt,
  primaryText,
  secondaryText,
  count,
  countSuffix = "회",
  secondaryFallback = "—",
}: RankedMediaItemProps) {
  return (
    <li className="ui-card-solid flex items-start gap-3 p-4">
      <div className="w-8 pt-0.5 text-center">
        <span className="text-lg font-extrabold leading-none text-[var(--ui-primary)]">{rank}</span>
      </div>

      <div className="flex h-16 w-12 flex-none items-center justify-center overflow-hidden bg-white shadow-[var(--retro-inset-shadow)]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={48}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-black/40">no</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{primaryText}</p>
            <p className="mt-1 line-clamp-1 text-xs text-[var(--ui-muted)]">
              {secondaryText ?? secondaryFallback}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--ui-muted)]">
            {count.toLocaleString()}
            {countSuffix}
          </p>
        </div>
      </div>
    </li>
  );
}
