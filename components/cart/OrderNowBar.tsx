"use client";

import { useCart } from "@/components/providers/CartProvider";
import { rupees } from "@/lib/format";

/**
 * The standing invitation. The moment anything is added, this appears and
 * stays — live item count and value (the number visibly grows with every
 * add), one press away from checkout. Hidden while the cart panel itself is
 * open, and gone entirely when the order is empty.
 */
export function OrderNowBar() {
  const { count, total, isOpen, openCart } = useCart();

  if (count === 0 || isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0 sm:pb-0">
      <button
        type="button"
        onClick={() => openCart()}
        className="anim-pop mx-auto flex w-full max-w-md items-center justify-between gap-6 rounded-sm border border-champagne/60 bg-espresso/95 py-3.5 pl-6 pr-4 shadow-[0_2px_8px_rgba(0,0,0,0.5),0_24px_48px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors hover:border-champagne sm:w-auto sm:min-w-[19rem]"
        aria-label={`Order now — ${count} item${count === 1 ? "" : "s"}, ${rupees(total)}`}
      >
        <span className="flex flex-col items-start">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-champagne">
            Order now
          </span>
          <span className="data mt-0.5 text-xs text-linen-2" aria-live="polite">
            {count} item{count === 1 ? "" : "s"} in your order
          </span>
        </span>
        <span className="flex items-center gap-3">
          {/* key={total} remounts the figure so the beat replays on every change */}
          <span key={total} className="price anim-beat inline-block text-2xl text-champagne">
            {rupees(total)}
          </span>
          <span
            className="grid h-9 w-9 place-items-center rounded-sm bg-champagne text-espresso"
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}
