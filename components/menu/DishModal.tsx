"use client";

import { useEffect, useRef, useState } from "react";
import { DishMedia } from "@/components/ui/DishMedia";
import { SpicePips, UnverifiedMark, VegMark } from "@/components/ui/Marks";
import { Stepper } from "@/components/ui/Stepper";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { IMAGES } from "@/data/images.generated";
import { categoryLabel } from "@/data/menu";
import { rupees } from "@/lib/format";
import type { Dish } from "@/lib/types";

interface Props {
  dish: Dish;
  onClose: () => void;
}

export function DishModal({ dish, onClose }: Props) {
  const { add } = useCart();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const credit = IMAGES[dish.id];

  useEffect(() => {
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="anim-fade absolute inset-0 bg-ink/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-modal-title"
        className="anim-sheet card relative max-h-[92svh] w-full overflow-y-auto rounded-b-none sm:anim-pop sm:max-w-lg sm:rounded-2xl"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-2xl">
          <DishMedia
            id={dish.id}
            alt={dish.name}
            sizes="(max-width: 640px) 100vw, 512px"
            viewTransitionName="dish-media"
          />
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-jade-mist backdrop-blur transition-colors hover:text-emerald-lit"
          >
            <span className="sr-only">Close</span>
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <p className="eyebrow mb-3">{categoryLabel(dish.category)}</p>

          <div className="flex items-start gap-2.5">
            <span className="mt-1.5">
              <VegMark veg={dish.veg} />
            </span>
            <h2 id="dish-modal-title" className="h3 flex-1">
              {dish.name}
            </h2>
            {dish.unverified && <UnverifiedMark />}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="data text-brass">{rupees(dish.price)}</span>
            <SpicePips level={dish.spice} />
            <span className="data text-muted">{dish.prepMinutes} min</span>
          </div>

          <p className="mt-4 text-jade-mist/80">{dish.description}</p>

          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-hairline pt-5 sm:grid-cols-2">
            <div>
              <dt className="eyebrow mb-1">Portion</dt>
              <dd className="text-sm text-jade-mist/75">{dish.portion}</dd>
            </div>
            <div>
              <dt className="eyebrow mb-1">Allergens</dt>
              <dd className="text-sm text-jade-mist/75">
                {dish.allergens.length > 0 ? dish.allergens.join(", ") : "None declared"}
              </dd>
            </div>
          </dl>

          {dish.unverified && (
            <p className="mt-4 rounded-lg border border-brass/30 bg-brass/5 p-3 text-sm text-brass">
              Not on the attested menu list — added so this category isn&apos;t empty. Check at the
              counter before you count on it.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <Stepper value={qty} min={1} label={dish.name} onChange={setQty} />
            <button
              type="button"
              className="btn btn-primary flex-1 px-5"
              onClick={() => {
                add(dish.id, qty);
                toast(qty === 1 ? "Added" : `Added ${qty}`);
                onClose();
              }}
            >
              Add to cart · {rupees(dish.price * qty)}
            </button>
          </div>

          {credit?.attributionRequired && (
            <p className="mt-5 border-t border-hairline pt-4 text-xs text-muted">
              Photo: {credit.creator} ·{" "}
              <a href={credit.licenseUrl} className="underline hover:text-emerald-lit" target="_blank" rel="noreferrer">
                {credit.license}
              </a>{" "}
              ·{" "}
              <a href={credit.sourceUrl} className="underline hover:text-emerald-lit" target="_blank" rel="noreferrer">
                source
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
