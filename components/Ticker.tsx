import { TICKER_ITEMS } from "@/data/ticker";

/**
 * Duplicated track, translated -50%, so the loop is seamless. Pauses on hover
 * and focus; under prefers-reduced-motion the animation stops and the strip
 * becomes horizontally scrollable instead (see globals.css).
 */
export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="marquee relative overflow-hidden border-b border-line bg-espresso-2 py-3">
      <div className="marquee-track flex w-max items-center gap-10 px-4">
        {items.map((item, i) => (
          <span
            key={`${item.hall}-${i}`}
            className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[0.8125rem]"
          >
            <span className="font-semibold uppercase tracking-[0.14em] text-champagne">{item.hall}</span>
            <span className="text-linen-2" aria-hidden="true">
              —
            </span>
            <span className="text-linen-2">{item.dish}</span>
            <span className="ml-7 h-1 w-1 rotate-45 bg-champagne/60" aria-hidden="true" />
          </span>
        ))}
      </div>
      <span className="sr-only">
        What each hall orders most: {TICKER_ITEMS.map((i) => `${i.hall} — ${i.dish}`).join("; ")}
      </span>
    </div>
  );
}
