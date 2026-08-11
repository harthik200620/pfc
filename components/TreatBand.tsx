"use client";

import { useCart } from "@/components/providers/CartProvider";

/**
 * Second of the ritual's three placements — headline, here, then Treat Mode in
 * the cart. It sits ABOVE the menu deliberately: the person who came to browse
 * dishes should meet the idea before they meet the prices, not at checkout
 * after they have already committed.
 */
export function TreatBand() {
  const { openCart } = useCart();

  return (
    <section className="section lume-rise pool-tr pool-brass" aria-labelledby="treat-heading">
      <div className="shell">
        <div className="reveal card relative overflow-hidden p-8 sm:p-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 88% 12%, rgba(200,162,74,0.12) 0%, rgba(200,162,74,0) 65%)",
            }}
          />
          <div className="relative max-w-[62ch]">
            <p className="eyebrow mb-4">The treat</p>
            <h2 id="treat-heading" className="h2 rule-under">
              Nobody comes here alone after good news.
            </h2>
            <p className="mt-5 text-jade-mist/85">
              An offer lands, a paper gets accepted, someone clears a viva — and within the
              hour four juniors have walked them to Oval 3 and ordered without looking at the
              board. The bill is the point. Splitting it is the ceremony.
            </p>
            <p className="mt-3 text-jade-mist/85">
              So the cart does that arithmetic for you. Turn on Treat Mode, say how many
              heads, and every line splits in front of you — then copy the whole breakdown
              into the hall group before anyone starts arguing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-brass px-6" onClick={() => openCart({ treat: true })}>
                Start a treat
              </button>
              <a href="#menu" className="btn btn-ghost px-6">
                Just browsing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
