"use client";

import { useCart } from "@/components/providers/CartProvider";

/**
 * The ritual, told straight. Second of its three placements — the hero
 * carries it, this names it, Treat Mode in the cart completes it. It sits
 * above the menu so the idea lands before the prices do.
 */
export function TreatBand() {
  const { openCart } = useCart();

  return (
    <section className="relative overflow-hidden border-b border-line bg-espresso-2" aria-labelledby="treat-heading">
      <div aria-hidden="true" className="glow -left-40 -top-40" />
      <div className="shell section relative">
        <div className="max-w-[64ch]">
          <p className="eyebrow mb-5">The ritual</p>
          <h2 id="treat-heading" className="h2">
            Good news is settled at this table.
          </h2>
          <div className="metal-rule mt-6" aria-hidden="true" />

          <p className="serif-italic mt-7 text-xl leading-relaxed text-linen/90 sm:text-2xl">
            An offer letter, an accepted paper, a cleared viva — at Kharagpur, the news is
            only official once the table at Oval 3 has been paid for.
          </p>

          <p className="mt-6 text-linen-2">
            The cart understands the custom. Turn on Treat Mode, set the number of guests,
            and every line divides itself — then copy the full breakdown to the hall group
            before the debate begins.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={() => openCart({ treat: true })}>
              Begin a treat
            </button>
            <a href="#menu" className="btn btn-ghost">
              Browse the menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
