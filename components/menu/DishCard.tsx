"use client";

import { DishMedia } from "@/components/ui/DishMedia";
import { SpicePips, UnverifiedMark, VegMark } from "@/components/ui/Marks";
import { Stepper } from "@/components/ui/Stepper";
import { Tilt } from "@/components/ui/Tilt";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { rupees } from "@/lib/format";
import type { Dish } from "@/lib/types";

interface Props {
  dish: Dish;
  onOpen: (id: string) => void;
  /** Set only while this card is the View Transition's outgoing element. */
  sharedName?: string;
}

export function DishCard({ dish, onOpen, sharedName }: Props) {
  const { add, setQty, qtyOf } = useCart();
  const { toast } = useToast();
  const qty = qtyOf(dish.id);

  return (
    <Tilt className="reveal h-full rounded-xl" max={5}>
      <article className="card group flex h-full flex-col overflow-hidden transition-colors hover:border-champagne/40">
        <button
          type="button"
          onClick={() => onOpen(dish.id)}
          data-dish-trigger={dish.id}
          className="relative aspect-[4/3] w-full overflow-hidden border-b border-line text-left"
          aria-label={`${dish.name} — see details`}
        >
          <DishMedia
            id={dish.id}
            alt={dish.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="transition-transform duration-620 ease-entrance group-hover:scale-[1.05]"
            viewTransitionName={sharedName}
          />
          <span className="data absolute bottom-2.5 right-2.5 rounded bg-espresso/80 px-2 py-1 text-[0.6875rem] text-linen/90 backdrop-blur-sm">
            {dish.prepMinutes} min
          </span>
        </button>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-2.5">
            <span className="mt-1">
              <VegMark veg={dish.veg} />
            </span>
            <h3 className="flex-1 font-serif text-[1.125rem] font-semibold leading-snug">
              {/* py/-my expands the hit box past 44px without moving layout. */}
              <button
                type="button"
                onClick={() => onOpen(dish.id)}
                className="-my-3 block py-3 text-left transition-colors hover:text-champagne"
              >
                {dish.name}
              </button>
            </h3>
            {dish.unverified && <UnverifiedMark />}
          </div>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-linen-2">{dish.blurb}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="price text-[1.1875rem] text-champagne">{rupees(dish.price)}</span>
              <SpicePips level={dish.spice} />
            </div>

            {qty === 0 ? (
              <button
                type="button"
                className="btn btn-ghost px-4 text-[0.75rem]"
                onClick={() => {
                  add(dish.id);
                  toast("Added to your order");
                }}
              >
                Add
              </button>
            ) : (
              <Stepper
                size="sm"
                value={qty}
                min={0}
                label={dish.name}
                onChange={(next) => setQty(dish.id, next)}
              />
            )}
          </div>
        </div>
      </article>
    </Tilt>
  );
}
