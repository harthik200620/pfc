import Image from "next/image";
import { OpenPill } from "@/components/OpenPill";
import { IMAGES } from "@/data/images.generated";

/**
 * Full-bleed hero: the real storefront behind, the type written on it.
 * Layer order — photo (parallax) → cinematic scrim → vignette → grain →
 * content. The scrim guarantees AA contrast for every line of text at every
 * viewport height; the grade also disguises the source photo's resolution
 * (834px is the largest that exists of this building).
 *
 * HERO_IMAGE_ID is the one-line swap: point it at any record in
 * data/images.generated.ts and the plate, blur placeholder and credit line
 * all follow.
 */
const HERO_IMAGE_ID = "hero-pfc";

export function Hero() {
  const photo = IMAGES[HERO_IMAGE_ID];

  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* z-0 — the plate */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            priority
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            className="hero-plate object-cover"
          />
        ) : (
          // Committed fallback — the drawn storefront — if the pinned fetch
          // ever fails on a fresh clone.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/hero-storefront.svg"
            alt=""
            aria-hidden="true"
            className="hero-plate absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* z-10 — warm cinematic scrim + vignette (espresso, never neutral black) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(20,16,11,0.95) 0%, rgba(20,16,11,0.5) 52%, rgba(20,16,11,0.68) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 52%, rgba(16,12,8,0.6) 100%)",
        }}
      />
      <div className="grain -z-10" />

      {/* The menu-cover frame — a thin metal rule inset from the viewport. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-10 border border-champagne/25 sm:inset-4"
      />

      {/* content — centered, formal, entering in sequence */}
      <div className="hero-enter shell relative flex min-h-[100svh] flex-col items-center justify-center pb-24 pt-24 text-center">
        <p className="eyebrow" style={{ ["--i" as string]: 0 }}>
          Pan Loop · IIT Kharagpur
        </p>

        <h1 className="mt-7" style={{ ["--i" as string]: 1 }}>
          <span className="brand foil mx-auto block w-fit text-[clamp(4.5rem,17vw,11rem)] leading-[0.95]">
            PFC
          </span>
          <span className="mt-6 flex items-center justify-center gap-5">
            <span className="metal-rule" aria-hidden="true" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.34em] text-champagne">
              Pan Loop Fast Food Center
            </span>
            <span className="metal-rule" aria-hidden="true" />
          </span>
        </h1>

        <p
          className="serif-italic mx-auto mt-8 max-w-[44ch] text-xl leading-relaxed text-linen/90 sm:text-2xl"
          style={{ ["--i" as string]: 2 }}
        >
          Where good news comes to eat — at the mouth of the loop, noon to four and six to
          eleven, delivering to every hall on the circuit.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ ["--i" as string]: 3 }}
        >
          <a href="#delivery" className="btn btn-primary">
            Order for your hall
          </a>
          <a href="#menu" className="btn btn-ghost">
            View the menu
          </a>
        </div>

        <div className="mt-6" style={{ ["--i" as string]: 4 }}>
          <OpenPill />
        </div>
      </div>

      <a
        href="#menu"
        aria-label="Scroll to the menu"
        className="absolute inset-x-0 bottom-5 z-10 mx-auto hidden w-fit text-champagne/70 transition-colors hover:text-champagne sm:block"
      >
        <span className="anim-bob block">
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" aria-hidden="true">
            <path d="M7 1v18M1.5 14.5 7 20l5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </a>

      {photo?.attributionRequired && (
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-6 right-7 z-10 text-[0.6875rem] text-linen/50 underline-offset-4 transition-colors hover:text-champagne hover:underline"
        >
          Photo {photo.creator}
        </a>
      )}
    </section>
  );
}
