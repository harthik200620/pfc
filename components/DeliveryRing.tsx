"use client";

import { useCallback, useMemo, useRef } from "react";
import { HALLS, PFC_BEARING } from "@/data/halls";
import { useCart } from "@/components/providers/CartProvider";
import {
  deliveryFeeFor,
  etaFor,
  nodePoint,
  PACKAGING_FEE,
  pointOn,
  RING,
  ringOrder,
  routePath,
} from "@/lib/delivery";
import { rupees } from "@/lib/format";
import type { Hall } from "@/lib/types";

/**
 * The PAN Loop is a circular road, so the delivery picker is a dial.
 *
 * Halls sit at their approximate real bearings — tier 1 on the loop itself,
 * tier 2 out on a spur. Selecting one sets the hall for the whole cart, draws
 * a route from PFC, and updates the ETA and fee, both derived deterministically
 * from the ring distance table. Nothing here is randomised: an ETA that changes
 * when you re-pick the same hall reads as a bug.
 */
export function DeliveryRing() {
  const { state, setHall } = useCart();
  const selectedId = state.hallId;
  const ordered = useMemo(() => ringOrder(HALLS), []);
  const nodeRefs = useRef(new Map<string, SVGGElement>());

  const selected = selectedId ? HALLS.find((h) => h.id === selectedId) : undefined;
  const pfc = pointOn(PFC_BEARING, RING.radius);

  const focusHall = useCallback((id: string) => {
    nodeRefs.current.get(id)?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, hall: Hall) => {
      const index = ordered.findIndex((h) => h.id === hall.id);
      let next: Hall | undefined;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = ordered[(index + 1) % ordered.length];
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = ordered[(index - 1 + ordered.length) % ordered.length];
          break;
        case "Home":
          next = ordered[0];
          break;
        case "End":
          next = ordered[ordered.length - 1];
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          setHall(hall.id);
          return;
        default:
          return;
      }

      if (!next) return;
      event.preventDefault();
      // Radiogroup convention: arrows move focus AND selection together.
      setHall(next.id);
      focusHall(next.id);
    },
    [ordered, setHall, focusHall],
  );

  // Roving tabindex — exactly one node in the tab order.
  const tabbableId = selectedId ?? ordered[0]?.id;

  return (
    <section id="delivery" className="section lume-sink pool-c" aria-labelledby="delivery-heading">
      <div className="shell">
        <p className="eyebrow mb-4">Delivery</p>
        <h2 id="delivery-heading" className="h2 rule-under max-w-[20ch]">
          The loop is a circle. So is the picker.
        </h2>
        <p className="mt-5 max-w-[58ch] text-jade-mist/70">
          Patel, Azad and Nehru sit on the PAN Loop itself. Everything else is a spur off it.
          Pick your hall and the whole cart follows — fee, ETA and the address on checkout.
        </p>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* ------------------------------------------------------ the dial -- */}
          <div className="mx-auto w-full max-w-[520px]">
            <svg
              viewBox={`0 0 ${RING.size} ${RING.size}`}
              className="h-auto w-full overflow-visible"
              role="radiogroup"
              aria-label="Delivery hall"
            >
              <defs>
                <radialGradient id="ring-glow" cx="50%" cy="50%">
                  <stop offset="55%" stopColor="#0e6e4e" stopOpacity="0" />
                  <stop offset="100%" stopColor="#0e6e4e" stopOpacity="0.18" />
                </radialGradient>
              </defs>

              <circle cx={RING.cx} cy={RING.cy} r={RING.radius + 40} fill="url(#ring-glow)" />

              {/* the loop road */}
              <circle
                cx={RING.cx}
                cy={RING.cy}
                r={RING.radius}
                fill="none"
                stroke="#1c5641"
                strokeWidth="2"
              />
              <circle
                cx={RING.cx}
                cy={RING.cy}
                r={RING.radius}
                fill="none"
                stroke="#0e6e4e"
                strokeWidth="12"
                strokeOpacity="0.16"
              />

              {/* spurs to the off-loop halls */}
              {HALLS.filter((h) => h.tier === 2).map((hall) => {
                const outer = nodePoint(hall);
                const inner = pointOn(hall.bearing, RING.radius);
                return (
                  <line
                    key={`spur-${hall.id}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#1c5641"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                  />
                );
              })}

              {/* travelling route, redrawn on every selection via the key */}
              {selected && (
                <path
                  key={selected.id}
                  d={routePath(selected)}
                  className="route-line"
                  fill="none"
                  stroke="#17a673"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  pathLength={1}
                />
              )}

              {/* PFC, at the ring's entrance */}
              <g>
                <circle cx={pfc.x} cy={pfc.y} r="9" fill="#c8a24a" />
                <circle cx={pfc.x} cy={pfc.y} r="15" fill="none" stroke="#c8a24a" strokeOpacity="0.4" strokeWidth="1.5" />
                <text
                  x={pfc.x - 20}
                  y={pfc.y + 6}
                  textAnchor="end"
                  className="font-mono"
                  fontSize="17"
                  fontWeight="600"
                  fill="#c8a24a"
                >
                  PFC
                </text>
              </g>

              {/* hall nodes */}
              {HALLS.map((hall) => {
                const p = nodePoint(hall);
                const isSelected = hall.id === selectedId;
                const labelRadius =
                  (hall.tier === 1 ? RING.radius : RING.radius + RING.spur) + 24;
                const lp = pointOn(hall.bearing, labelRadius);
                const east = Math.sin((hall.bearing * Math.PI) / 180) >= 0;

                return (
                  <g
                    key={hall.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(hall.id, el);
                      else nodeRefs.current.delete(hall.id);
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${hall.name}, ${etaFor(hall)} minutes, ${rupees(deliveryFeeFor(hall))} delivery`}
                    tabIndex={hall.id === tabbableId ? 0 : -1}
                    onClick={() => setHall(hall.id)}
                    onKeyDown={(e) => onKeyDown(e, hall)}
                    className="cursor-pointer outline-none [&:focus-visible>.node-focus]:opacity-100"
                  >
                    {/* Hit area. 26 viewBox units = 52 CSS px at full size;
                        the ring scales down to ~33px on a 360 viewport, which
                        is why the list control below is visible there. */}
                    <circle cx={p.x} cy={p.y} r="26" fill="transparent" />
                    <circle
                      className="node-focus opacity-0"
                      cx={p.x}
                      cy={p.y}
                      r="18"
                      fill="none"
                      stroke="#17a673"
                      strokeWidth="2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 11 : 7}
                      fill={isSelected ? "#17a673" : "#0a2a20"}
                      stroke={isSelected ? "#17a673" : "#1c5641"}
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    <text
                      x={lp.x}
                      y={lp.y + 5}
                      textAnchor={east ? "start" : "end"}
                      className="font-mono select-none"
                      fontSize="17"
                      fontWeight={isSelected ? 700 : 500}
                      fill={isSelected ? "#17a673" : "#e8f2ec"}
                      fillOpacity={isSelected ? 1 : 0.55}
                    >
                      {hall.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* The same options as a native control, for assistive tech that
                can't make sense of the SVG — and visible below 640px, where the
                ring scales to 328px and its nodes fall under the 44px touch
                target. Above that the dial is the full-size control and this
                collapses back to screen-reader-only. */}
            <div className="mt-6 sm:sr-only">
              <label className="eyebrow mb-2 block" htmlFor="hall-select">
                Or pick from the list
              </label>
              <select
                id="hall-select"
                className="field"
                value={selectedId ?? ""}
                onChange={(e) => setHall(e.target.value)}
              >
                <option value="" disabled>
                  Choose a hall
                </option>
                {ordered.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name} — {etaFor(hall)} min, {rupees(deliveryFeeFor(hall))} delivery
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ---------------------------------------------------- the readout -- */}
          <div className="card p-6" aria-live="polite">
            {selected ? (
              <>
                <p className="eyebrow mb-3">Delivering to</p>
                <p className="h3">{selected.name}</p>
                <p className="data mt-1 text-muted">
                  {selected.code} · {selected.tier === 1 ? "on the loop" : "off the loop"}
                </p>

                <dl className="mt-6 space-y-3 border-t border-hairline pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-jade-mist/65">Estimated</dt>
                    <dd className="data text-emerald-lit">{etaFor(selected)} min</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-jade-mist/65">Delivery</dt>
                    <dd className="data text-brass">{rupees(deliveryFeeFor(selected))}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-jade-mist/65">Packaging</dt>
                    <dd className="data text-brass">{rupees(PACKAGING_FEE)}</dd>
                  </div>
                </dl>

                <p className="mt-5 text-xs leading-relaxed text-muted">
                  Fees are placeholders — the two public sources disagree (₹30 vs ~₹15). ETA is
                  derived from ring distance, not measured.
                </p>

                <a href="#menu" className="btn btn-primary mt-6 w-full">
                  Add something to the cart
                </a>
              </>
            ) : (
              <>
                <p className="eyebrow mb-3">No hall picked</p>
                <p className="h3">Choose where this is going.</p>
                <p className="mt-3 text-jade-mist/65">
                  Tap a node, or use the arrow keys to walk the ring. Patel, Azad and Nehru are the
                  three closest — they sit on the loop itself.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost mt-6 w-full"
                  onClick={() => setHall("patel")}
                >
                  Start with Patel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
