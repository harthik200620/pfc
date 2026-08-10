/**
 * Gallery frames. `query` feeds scripts/fetch-images.mjs; the caption is ours.
 * These are ambience, not the storefront — no CC-licensed photograph of the
 * PFC building exists, so the hero is handled separately. See FACTS.md.
 */
export interface GalleryItem {
  id: string;
  query: string;
  caption: string;
}

export const GALLERY: GalleryItem[] = [
  { id: "g-biryani", query: "biryani plate", caption: "The plate the whole loop is ordering" },
  { id: "g-tandoor", query: "tandoor oven restaurant", caption: "Tandoor, going since 11:30" },
  { id: "g-street", query: "indian street food stall night", caption: "Counter light after dark" },
  { id: "g-chai", query: "masala chai glass", caption: "The 4pm gap, filled" },
  { id: "g-thali", query: "indian food table sharing", caption: "Treat, in its natural state" },
  { id: "g-kolkata", query: "kathi roll street food", caption: "Between the loop and a 2pm lecture" },
];
