import { DELIVERY_BASE_FEE, PACKAGING_FEE } from "@/data/menu";
import { HALLS_BY_ID, PFC_BEARING } from "@/data/halls";
import type { Hall } from "@/lib/types";

/**
 * Deterministic, from the ring distance table. Explicitly not randomised —
 * an ETA that changes when you re-select the same hall reads as a bug.
 * Range lands 15–33 min across the four distance tiers.
 */
export function etaFor(hall: Hall): number {
  return 15 + (hall.distance - 1) * 6;
}

/** PLACEHOLDER — see the header of data/menu.ts. */
export function deliveryFeeFor(hall: Hall): number {
  return DELIVERY_BASE_FEE + (hall.distance - 1) * 5;
}

export function deliveryFeeForId(hallId: string | null): number {
  const hall = hallId ? HALLS_BY_ID.get(hallId) : undefined;
  return hall ? deliveryFeeFor(hall) : 0;
}

export function etaForId(hallId: string | null): number | null {
  const hall = hallId ? HALLS_BY_ID.get(hallId) : undefined;
  return hall ? etaFor(hall) : null;
}

export { PACKAGING_FEE };

// ------------------------------------------------------------- geometry ----

export const RING = {
  size: 520,
  cx: 260,
  cy: 260,
  radius: 180,
  spur: 54,
} as const;

/**
 * Rounded to 2dp deliberately. Math.cos/Math.sin are not required to be
 * correctly rounded, and Node and Chrome can differ in the last ULP — which
 * shows up as a hydration mismatch on every SVG coordinate. Rounding makes the
 * geometry identical on both sides, and 0.01 of a viewBox unit is invisible.
 */
export function pointOn(bearing: number, radius: number) {
  const rad = ((bearing - 90) * Math.PI) / 180;
  return {
    x: Math.round((RING.cx + radius * Math.cos(rad)) * 100) / 100,
    y: Math.round((RING.cy + radius * Math.sin(rad)) * 100) / 100,
  };
}

export function nodePoint(hall: Hall) {
  return pointOn(hall.bearing, hall.tier === 1 ? RING.radius : RING.radius + RING.spur);
}

/**
 * Arc from PFC to the hall's bearing along the shorter way round the ring,
 * plus the spur out to an off-loop hall. Fed to a stroke-dashoffset draw.
 */
export function routePath(hall: Hall): string {
  const start = pointOn(PFC_BEARING, RING.radius);
  const ringEnd = pointOn(hall.bearing, RING.radius);

  const delta = (((hall.bearing - PFC_BEARING) % 360) + 360) % 360;
  // Take the short way: sweep 1 goes clockwise, 0 anticlockwise.
  const sweep = delta <= 180 ? 1 : 0;

  let d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RING.radius} ${RING.radius} 0 0 ${sweep} ${ringEnd.x.toFixed(2)} ${ringEnd.y.toFixed(2)}`;

  if (hall.tier === 2) {
    const node = nodePoint(hall);
    d += ` L ${node.x.toFixed(2)} ${node.y.toFixed(2)}`;
  }
  return d;
}

/** Halls sorted clockwise from PFC — the order arrow keys walk. */
export function ringOrder(halls: Hall[]): Hall[] {
  return [...halls].sort((a, b) => {
    const da = (((a.bearing - PFC_BEARING) % 360) + 360) % 360;
    const db = (((b.bearing - PFC_BEARING) % 360) + 360) % 360;
    return da - db;
  });
}
