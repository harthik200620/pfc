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
    <section id="delivery" className="section" aria-labelledby="delivery-heading">
      <div className="shell">
        <p className="eyebrow mb-5">Delivery</p>
        <h2 id="delivery-heading" className="h2 max-w-[22ch]">
          The loop is a circle. So is the dial.
        </h2>
        <div className="metal-rule mt-6" aria-hidden="true" />
        <p className="mt-7 max-w-[58ch] text-linen-2">
          Patel, Azad and Nehru sit on the PAN Loop itself; the rest reach it by a spur.
          Select your hall and the whole order follows — fee, arrival time, and the address
          at checkout.
        </p>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* ------------------------------------------------------ the dial -- */}
          {/* .ring-stand: the dial lies at 26° and stands upright as it
              scrolls into view (CSS-only, guarded on animation-range support
              — Firefox gets a flat ring rather than a wrong-windowed tilt).
              The ground shadow fades as it stands. */}
          <div className="mx-auto w-full max-w-[520px]">
            <div className="ring-stand">
              <svg
                viewBox={`0 0 ${RING.size} ${RING.size}`}
                className="h-auto w-full overflow-visible"
                role="radiogroup"
                aria-label="Delivery hall"
              >
              {/* the loop road, set like a watch face: champagne chapter ring,
                  faint road bed, minute-track ticks */}
              <circle
                cx={RING.cx}
                cy={RING.cy}
                r={RING.radius}
                fill="none"
                stroke="#d3b778"
                strokeWidth="1.25"
                strokeOpacity="0.55"
              />
              <circle
                cx={RING.cx}
                cy={RING.cy}
                r={RING.radius}
                fill="none"
                stroke="#f6f1e7"
                strokeWidth="14"
                strokeOpacity="0.04"
              />
              <circle
                cx={RING.cx}
                cy={RING.cy}
                r={RING.radius - 13}
                fill="none"
                stroke="#d3b778"
                strokeWidth="5"
                strokeOpacity="0.28"
                strokeDasharray="1 11.2"
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
                    stroke="#f6f1e7"
                    strokeOpacity="0.22"
                    strokeWidth="1.25"
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
                  stroke="#d3b778"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                />
              )}

              {/* The complication: live readout in the dial centre. Decorative —
                  the readout card is the accessible surface. */}
              <g aria-hidden="true" className="select-none">
                {selected ? (
                  <>
                    <text
                      x={RING.cx}
                      y={RING.cy - 34}
                      textAnchor="middle"
                      style={{ fontFamily: "var(--font-body)", letterSpacing: "0.3em" }}
                      fontSize="13"
                      fontWeight="600"
                      fill="#f6f1e7"
                      fillOpacity="0.55"
                    >
                      {selected.code}
                    </text>
                    <text
                      x={RING.cx}
                      y={RING.cy + 22}
                      textAnchor="middle"
                      style={{ fontFamily: "var(--font-display)" }}
                      fontSize="64"
                      fontWeight="600"
                      fill="#d3b778"
                    >
                      {etaFor(selected)}
                    </text>
                    <text
                      x={RING.cx}
                      y={RING.cy + 48}
                      textAnchor="middle"
                      style={{ fontFamily: "var(--font-body)", letterSpacing: "0.28em" }}
                      fontSize="11"
                      fontWeight="600"
                      fill="#d3b778"
                      fillOpacity="0.8"
                    >
                      MINUTES
                    </text>
                  </>
                ) : (
                  <text
                    x={RING.cx}
                    y={RING.cy + 5}
                    textAnchor="middle"
                    style={{ fontFamily: "var(--font-body)", letterSpacing: "0.34em" }}
                    fontSize="14"
                    fontWeight="600"
                    fill="#f6f1e7"
                    fillOpacity="0.28"
                  >
                    PAN LOOP
                  </text>
                )}
              </g>

              {/* PFC, at the ring's entrance — the crown of the dial */}
              <g>
                <circle cx={pfc.x} cy={pfc.y} r="9" fill="#d3b778" />
                <circle cx={pfc.x} cy={pfc.y} r="15" fill="none" stroke="#d3b778" strokeOpacity="0.4" strokeWidth="1.25" />
                <text
                  x={pfc.x - 22}
                  y={pfc.y + 5}
                  textAnchor="end"
                  style={{ fontFamily: "var(--font-body)", letterSpacing: "0.18em" }}
                  fontSize="13"
                  fontWeight="700"
                  fill="#d3b778"
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
                      stroke="#d3b778"
                      strokeWidth="2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 11 : 7}
                      fill={isSelected ? "#d3b778" : "#1d1712"}
                      stroke={isSelected ? "#d3b778" : "#f6f1e7"}
                      strokeOpacity={isSelected ? 1 : 0.45}
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />
                    <text
                      x={lp.x}
                      y={lp.y + 5}
                      textAnchor={east ? "start" : "end"}
                      className="select-none"
                      style={{ fontFamily: "var(--font-body)", letterSpacing: "0.12em" }}
                      fontSize="13"
                      fontWeight={isSelected ? 700 : 600}
                      fill={isSelected ? "#d3b778" : "#f6f1e7"}
                      fillOpacity={isSelected ? 1 : 0.65}
                    >
                      {hall.code}
                    </text>
                  </g>
                );
              })}
              </svg>
            </div>

            {/* Ground shadow for the 3D entrance — invisible at rest (the
                keyframes own its opacity); invisible everywhere the entrance
                doesn't run. */}
            <div
              aria-hidden="true"
              className="ring-ground mx-auto -mt-4 h-6 w-2/3 rounded-[100%] bg-black opacity-0 blur-xl"
            />

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
                <p className="data mt-1.5 text-sm text-linen-2">
                  {selected.code} · {selected.tier === 1 ? "on the loop" : "off the loop"}
                </p>

                <dl className="mt-6 space-y-3 border-t border-line pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-linen-2">Estimated</dt>
                    <dd className="data text-champagne">{etaFor(selected)} min</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-linen-2">Delivery</dt>
                    <dd className="price text-[1.0625rem]">{rupees(deliveryFeeFor(selected))}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-linen-2">Packaging</dt>
                    <dd className="price text-[1.0625rem]">{rupees(PACKAGING_FEE)}</dd>
                  </div>
                </dl>

                <p className="mt-5 text-xs leading-relaxed text-linen-2">
                  Fees are placeholders — the two public sources disagree (₹30 vs ~₹15). Arrival
                  time is derived from ring distance, not measured.
                </p>

                <a href="#menu" className="btn btn-primary mt-6 w-full">
                  Add to the order
                </a>
              </>
            ) : (
              <>
                <p className="eyebrow mb-3">No hall selected</p>
                <p className="h3">Choose where this is going.</p>
                <p className="mt-3 text-linen-2">
                  Tap a point on the dial, or walk it with the arrow keys. Patel, Azad and Nehru
                  sit on the loop itself — they are the three closest.
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
