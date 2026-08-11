import Image from "next/image";
import { IMAGES } from "@/data/images.generated";

/** Deterministic per-id, so a dish's drawn plate never changes between renders. */
function seedOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  id: string;
  alt: string;
  /** Rendered at this width by next/image's sizes attribute. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Set on the media element for the card → modal View Transition. */
  viewTransitionName?: string;
}

/**
 * Photograph when the fetcher found one under a usable licence, otherwise a
 * drawn plate in the same palette. The fallback is not a grey box: a missing
 * image should still look like part of the design system.
 */
export function DishMedia({
  id,
  alt,
  sizes,
  className = "",
  priority = false,
  viewTransitionName,
}: Props) {
  const record = IMAGES[id];
  const style = viewTransitionName ? { viewTransitionName } : undefined;

  if (record) {
    return (
      <Image
        src={record.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={record.blurDataURL ? "blur" : "empty"}
        blurDataURL={record.blurDataURL}
        className={`object-cover ${className}`}
        style={style}
      />
    );
  }

  const seed = seedOf(id);
  const rotate = seed % 360;
  const ring1 = 26 + (seed % 7);
  const ring2 = 38 + ((seed >> 3) % 9);

  return (
    <div
      className={`grid h-full w-full place-items-center bg-espresso-3 ${className}`}
      style={style}
      role="img"
      aria-label={`${alt} — no photograph available`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`p-${id}`} cx="42%" cy="38%">
            <stop offset="0%" stopColor="#2b2318" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#221b13" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#130f0a" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#p-${id})`} />
        <g transform={`rotate(${rotate} 50 50)`} fill="none" strokeLinecap="round">
          <circle cx="50" cy="50" r={ring2} stroke="#f6f1e7" strokeOpacity="0.1" strokeWidth="0.6" />
          <circle cx="50" cy="50" r={ring1} stroke="#f6f1e7" strokeOpacity="0.16" strokeWidth="0.8" />
          <circle
            cx="50"
            cy="50"
            r={ring1 - 7}
            stroke="#d3b778"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            strokeDasharray={`${6 + (seed % 5)} ${4 + ((seed >> 2) % 6)}`}
          />
        </g>
      </svg>
    </div>
  );
}
