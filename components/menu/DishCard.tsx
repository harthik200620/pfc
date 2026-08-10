"use client";

import { DishMedia } from "@/components/ui/DishMedia";
import { SpicePips, UnverifiedMark, VegMark } from "@/components/ui/Marks";
import { Stepper } from "@/components/ui/Stepper";
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
    <article className="reveal card group flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onOpen(dish.id)}
        data-dish-trigger={dish.id}
        className="relative aspect-[4/3] w-full overflow-hidden text-left"
        aria-label={`${dish.name} — see details`}
      >
        <DishMedia
          id={dish.id}
          alt={dish.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="transition-transform duration-620 ease-entrance group-hover:scale-105"
          viewTransitionName={sharedName}
        />
        <span className="data absolute bottom-2 right-2 rounded-full bg-ink/85 px-2 py-1 text-[0.6875rem] text-jade-mist/80 backdrop-blur">
          {dish.prepMinutes} min
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <VegMark veg={dish.veg} />
          <h3 className="flex-1 text-[0.9375rem] font-semibold leading-snug">
            {/* py/-my expands the hit box past 44px without moving the layout —
                a 21px text link would be under the touch-target floor. */}
            <button
              type="button"
              onClick={() => onOpen(dish.id)}
              className="-my-3 block py-3 text-left hover:text-emerald-lit"
            >
              {dish.name}
            </button>
          </h3>
          {dish.unverified && <UnverifiedMark />}
        </div>

        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-jade-mist/60">{dish.blurb}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="data text-brass">{rupees(dish.price)}</span>
            <SpicePips level={dish.spice} />
          </div>

          {qty === 0 ? (
            <button
              type="button"
              className="btn btn-ghost px-4 text-[0.8125rem]"
              onClick={() => {
                add(dish.id);
                toast("Added");
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
  );
}
