"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CATEGORIES, DISHES, DISHES_BY_ID, PRICE_BANDS } from "@/data/menu";
import { searchDishes } from "@/lib/search";
import type { CategoryId, SpiceLevel } from "@/lib/types";
import { DishCard } from "@/components/menu/DishCard";
import { DishModal } from "@/components/menu/DishModal";

interface Filters {
  q: string;
  cat: CategoryId | "all";
  veg: boolean;
  spice: SpiceLevel | null;
  band: string | null;
  quick: boolean;
}

const DEFAULTS: Filters = { q: "", cat: "all", veg: false, spice: null, band: null, quick: false };

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/**
 * Run a state update inside a View Transition where one is available, but never
 * let the transition own the update. If the document isn't producing frames the
 * transition callback never fires, so a 250ms watchdog applies the change
 * anyway; whichever path wins first, the other no-ops.
 */
function withTransition(update: () => void, after?: () => void) {
  const doc = document as VTDocument;
  let applied = false;
  const apply = () => {
    if (applied) return;
    applied = true;
    update();
  };

  if (typeof doc.startViewTransition !== "function") {
    apply();
    after?.();
    return;
  }

  try {
    const transition = doc.startViewTransition(() => flushSync(apply));
    transition.finished.then(() => after?.(), () => after?.());
  } catch {
    apply();
    after?.();
    return;
  }

  window.setTimeout(() => {
    if (!applied) {
      apply();
      after?.();
    }
  }, 250);
}

function readFromURL(): Filters {
  if (typeof window === "undefined") return DEFAULTS;
  const p = new URLSearchParams(window.location.search);
  const cat = p.get("cat");
  const spice = p.get("spice");
  const band = p.get("band");
  return {
    q: p.get("q") ?? "",
    cat: cat && CATEGORIES.some((c) => c.id === cat) ? (cat as CategoryId) : "all",
    veg: p.get("veg") === "1",
    spice: spice === "1" || spice === "2" || spice === "3" ? (Number(spice) as SpiceLevel) : null,
    band: band && PRICE_BANDS.some((b) => b.id === band) ? band : null,
    quick: p.get("quick") === "1",
  };
}

/**
 * URL sync via history.replaceState rather than useSearchParams. Same shareable
 * link, but no Suspense boundary requirement — useSearchParams without one
 * fails the production build at prerender.
 */
function writeToURL(f: Filters) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams(window.location.search);
  const set = (key: string, value: string | null) => {
    if (value === null || value === "") p.delete(key);
    else p.set(key, value);
  };
  set("q", f.q);
  set("cat", f.cat === "all" ? null : f.cat);
  set("veg", f.veg ? "1" : null);
  set("spice", f.spice ? String(f.spice) : null);
  set("band", f.band);
  set("quick", f.quick ? "1" : null);
  const query = p.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}

export function MenuSection() {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Two-step View Transition handoff. pendingId paints the shared name onto the
  // card; openId is flipped inside startViewTransition one frame later, so the
  // card and the modal never hold `dish-media` in the same frame — which would
  // make the browser abort the transition outright.
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const lastTrigger = useRef<string | null>(null);

  useEffect(() => {
    setFilters(readFromURL());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeToURL(filters);
  }, [filters, hydrated]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(filters.q), 180);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const results = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === filters.band);
    let list = DISHES.filter((d) => {
      if (filters.cat !== "all" && d.category !== filters.cat) return false;
      if (filters.veg && !d.veg) return false;
      if (filters.spice !== null && d.spice !== filters.spice) return false;
      if (band && (d.price < band.min || d.price > band.max)) return false;
      if (filters.quick && d.prepMinutes >= 15) return false;
      return true;
    });
    list = searchDishes(list, debouncedQ);
    return list;
  }, [filters, debouncedQ]);

  const closing = useRef(false);

  // Step 2 of the handoff runs in an effect, not requestAnimationFrame: rAF
  // does not fire in a tab that isn't producing frames (backgrounded, hidden),
  // which would strand the modal permanently. Effects always run.
  useEffect(() => {
    if (!pendingId || openId !== null || closing.current) return;
    withTransition(() => setOpenId(pendingId));
  }, [pendingId, openId]);

  const openDish = useCallback((id: string) => {
    lastTrigger.current = id;
    setPendingId(id); // paints `dish-media` onto this card and nothing else
  }, []);

  const closeDish = useCallback(() => {
    closing.current = true;
    const id = lastTrigger.current;
    withTransition(
      () => setOpenId(null),
      () => {
        setPendingId(null);
        closing.current = false;
        // Look the trigger up by id rather than holding a node reference —
        // React may have replaced that DOM node while the modal was open.
        if (id) {
          document.querySelector<HTMLElement>(`[data-dish-trigger="${id}"]`)?.focus();
        }
      },
    );
  }, []);

  const activeCount = [
    filters.cat !== "all",
    filters.veg,
    filters.spice !== null,
    filters.band !== null,
    filters.quick,
    filters.q !== "",
  ].filter(Boolean).length;

  const openDishData = openId ? DISHES_BY_ID.get(openId) : undefined;

  // min-h-11 is 44px — the touch-target floor, enforced here rather than
  // remembered at each of the fifteen call sites.
  const chip = (active: boolean) =>
    `data inline-flex min-h-11 items-center rounded-full border px-3.5 text-[0.8125rem] transition-colors ${
      active
        ? "border-emerald-lit bg-emerald-lit text-ink"
        : "border-hairline text-jade-mist/70 hover:border-emerald-lit/60 hover:text-jade-mist"
    }`;

  return (
    <section id="menu" className="section lume-sink pool-tl" aria-labelledby="menu-heading">
      <div className="shell">
        <p className="eyebrow mb-4">The board</p>
        <h2 id="menu-heading" className="h2 rule-under max-w-[18ch]">
          Twenty-six things, and everyone has an opinion about four of them.
        </h2>

        {/* Category rail — DERIVED from the data, so a category with no dishes
            cannot render. This is what stops an empty Beverages tab shipping. */}
        {/* A gradient rather than a second full-width backdrop-filter: this sits
            directly under the nav's, live in the scroll path, and at 85% ink the
            blur contributed almost nothing visually while costing a full-width
            resample every frame on the mid-range Android this targets. */}
        <div className="no-scrollbar sticky top-16 z-30 -mx-4 mt-8 overflow-x-auto bg-gradient-to-b from-ink via-ink/95 to-ink/70 px-4 py-3">
          <div className="flex w-max gap-2">
            <button
              type="button"
              className={chip(filters.cat === "all")}
              onClick={() => setFilters((f) => ({ ...f, cat: "all" }))}
              aria-pressed={filters.cat === "all"}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={chip(filters.cat === c.id)}
                onClick={() => setFilters((f) => ({ ...f, cat: c.id }))}
                aria-pressed={filters.cat === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="relative">
            <label htmlFor="dish-search" className="sr-only">
              Search the menu
            </label>
            <input
              id="dish-search"
              type="search"
              className="field pl-10"
              placeholder="Search — try “btr msla”"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={chip(filters.veg)}
              onClick={() => setFilters((f) => ({ ...f, veg: !f.veg }))}
              aria-pressed={filters.veg}
            >
              Veg only
            </button>

            {([1, 2, 3] as SpiceLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                className={chip(filters.spice === level)}
                onClick={() => setFilters((f) => ({ ...f, spice: f.spice === level ? null : level }))}
                aria-pressed={filters.spice === level}
              >
                {"▲".repeat(level)} {["", "Mild", "Medium", "Hot"][level]}
              </button>
            ))}

            {PRICE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={chip(filters.band === b.id)}
                onClick={() => setFilters((f) => ({ ...f, band: f.band === b.id ? null : b.id }))}
                aria-pressed={filters.band === b.id}
              >
                {b.label}
              </button>
            ))}

            <button
              type="button"
              className={chip(filters.quick)}
              onClick={() => setFilters((f) => ({ ...f, quick: !f.quick }))}
              aria-pressed={filters.quick}
            >
              Under 15 min
            </button>

            {activeCount > 0 && (
              <button
                type="button"
                className="data px-2 py-2 text-[0.8125rem] text-brass underline underline-offset-4 hover:text-emerald-lit"
                onClick={() => setFilters(DEFAULTS)}
              >
                Clear {activeCount}
              </button>
            )}
          </div>

          <p className="data text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "dish" : "dishes"}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onOpen={openDish}
                sharedName={pendingId === dish.id && openId === null ? "dish-media" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="card mt-6 p-10 text-center">
            <p className="h3">Nothing matches all of that at once.</p>
            <p className="mx-auto mt-3 max-w-[46ch] text-jade-mist/65">
              {filters.veg && filters.spice === 3
                ? "There's no vegetarian dish at the top spice level — drop the heat to medium and Honey Chilli Potato comes back."
                : filters.quick
                  ? "Under 15 minutes rules out everything from the tandoor. Try clearing that one first."
                  : "Clear the price band, or search for the dish by name instead."}
            </p>
            <button type="button" className="btn btn-ghost mt-6 px-6" onClick={() => setFilters(DEFAULTS)}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {openDishData && <DishModal dish={openDishData} onClose={closeDish} />}
    </section>
  );
}
