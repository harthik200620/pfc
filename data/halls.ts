// ---------------------------------------------------------------------------
// PLACEHOLDER GEOMETRY.
//
// The PAN Loop is a real circuit road joining Patel, Azad and Nehru Halls, and
// PFC sits at its entrance. The bearings below are eyeballed from the campus
// layout, not surveyed, and `distance` is a modelling choice — ring hops, not
// metres. Both are honest enough to draw a dial with and are not presented as
// precise anywhere in the UI.
//
// tier 1 = on the loop itself. tier 2 = off it, reached by a spur.
// ---------------------------------------------------------------------------

import type { Hall } from "@/lib/types";

/** Degrees clockwise from north. PFC sits at the ring's entrance point. */
export const PFC_BEARING = 200;

export const HALLS: Hall[] = [
  // On the loop.
  { id: "patel", code: "PT", name: "Patel Hall", bearing: 228, tier: 1, distance: 1 },
  { id: "azad", code: "AZ", name: "Azad Hall", bearing: 280, tier: 1, distance: 1 },
  { id: "nehru", code: "NH", name: "Nehru Hall", bearing: 332, tier: 1, distance: 1 },

  // Off the loop.
  { id: "gokhale", code: "GKH", name: "Gokhale Hall", bearing: 256, tier: 2, distance: 2 },
  { id: "snvh", code: "SNVH", name: "Sister Nivedita Hall", bearing: 304, tier: 2, distance: 3 },
  { id: "lbs", code: "LBS", name: "Lal Bahadur Shastri Hall", bearing: 12, tier: 2, distance: 2 },
  { id: "rk", code: "RK", name: "Radhakrishnan Hall", bearing: 44, tier: 2, distance: 2 },
  { id: "main", code: "MB", name: "Main Building & Departments", bearing: 76, tier: 2, distance: 4 },
  { id: "rp", code: "RP", name: "Rajendra Prasad Hall", bearing: 104, tier: 2, distance: 3 },
  { id: "mmm", code: "MMM", name: "Madan Mohan Malaviya Hall", bearing: 132, tier: 2, distance: 3 },
  { id: "ms", code: "MS", name: "Meghnad Saha Hall", bearing: 160, tier: 2, distance: 3 },
  { id: "llr", code: "LLR", name: "Lala Lajpat Rai Hall", bearing: 176, tier: 2, distance: 2 },
];

export const HALLS_BY_ID: ReadonlyMap<string, Hall> = new Map(
  HALLS.map((h) => [h.id, h]),
);
