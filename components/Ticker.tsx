import { TICKER_ITEMS } from "@/data/ticker";

/**
 * Duplicated track, translated -50%, so the loop is seamless. Pauses on hover
 * and focus; under prefers-reduced-motion the animation stops entirely and the
 * strip becomes horizontally scrollable instead (see globals.css).
 */
export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="marquee seam relative overflow-hidden py-3">
      <div className="marquee-track flex w-max items-center gap-8 px-4">
        {items.map((item, i) => (
          <span key={`${item.hall}-${i}`} className="data flex shrink-0 items-center gap-2.5 whitespace-nowrap">
            <span className="text-brass">{item.hall}</span>
            <span className="text-muted" aria-hidden="true">
              →
            </span>
            <span className="text-jade-mist/75">{item.dish}</span>
            <span className="ml-6 h-1 w-1 rounded-full bg-emerald-lit/40" aria-hidden="true" />
          </span>
        ))}
      </div>
      <span className="sr-only">
        What each hall orders most: {TICKER_ITEMS.map((i) => `${i.hall} — ${i.dish}`).join("; ")}
      </span>
    </div>
  );
}
