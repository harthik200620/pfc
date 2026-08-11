import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { OpenPill } from "@/components/OpenPill";

/**
 * Four stacked layers, not a background-image:
 *   z-0  the plate, fixed + scaled, parallaxing on a scroll timeline
 *   z-1  gradient scrim — guarantees AA contrast at every viewport height
 *   z-2  grain — what makes a flat plate read as printed rather than stock
 *   z-3  emerald light-leak from the top right
 *   z-10 content
 *
 * The photograph wins when it is there, and the drawn plate covers for it when
 * it is not — checked once at module load rather than hard-coded, so dropping
 * hero-storefront.jpg into public/images/ is the entire operation and removing
 * it again does not leave a broken image across the first viewport. This is a
 * server component, so the check never reaches the browser.
 */
const HERO_PHOTO = "/images/hero-storefront.jpg";
const HERO_DRAWN = "/images/hero-storefront.svg";

const HERO_PLATE = existsSync(path.join(process.cwd(), "public", "images", "hero-storefront.jpg"))
  ? HERO_PHOTO
  : HERO_DRAWN;

export function Hero() {
  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={HERO_PLATE}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          quality={90}
          /* Next 16 deprecated `priority` in favour of `preload`. */
          preload
          className="hero-plate scale-[1.12] object-cover"
        />
      </div>

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(5,28,21,0.92) 0%, rgba(5,28,21,0.30) 55%, rgba(5,28,21,0.55) 100%)",
        }}
      />
      <div className="grain -z-10" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 85% 8%, rgba(23,166,115,0.12) 0%, rgba(23,166,115,0) 70%)",
        }}
      />

      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24">
        <p className="eyebrow mb-5">PAN Loop · IIT Kharagpur · Since the loop had a name</p>

        <h1 className="display max-w-[16ch]">
          Somebody got the offer.
          <br />
          <span className="text-emerald-lit">You&apos;re eating at PFC.</span>
        </h1>

        <p className="mt-6 max-w-[52ch] text-jade-mist/85">
          Oval 3, at the mouth of the PAN Loop. Open noon to four, then six to eleven — the
          gap in the middle is not a mistake, it&apos;s the shift change. Delivery runs to
          every hall on the loop and most of the ones off it.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href="#delivery" className="btn btn-primary px-6">
            Order for your hall
          </a>
          <a href="#menu" className="btn btn-ghost px-6">
            See the menu
          </a>
          <OpenPill className="ml-1" />
        </div>
      </div>

      <a
        href="#menu"
        className="absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-2 text-muted transition-colors hover:text-emerald-lit sm:flex"
      >
        <span className="data text-[0.625rem] uppercase tracking-[0.18em]">Scroll</span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true">
          <path d="M6 0v18M1 13l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </a>
    </section>
  );
}
