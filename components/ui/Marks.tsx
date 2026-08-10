import type { SpiceLevel } from "@/lib/types";

/**
 * The Indian veg / non-veg mark. This is a legal marking under the Food Safety
 * and Standards (Packaging and Labelling) Regulations — a green square with a
 * green filled circle for vegetarian, brown/red with a filled circle for
 * non-vegetarian. It is not a style choice and is not recoloured to taste.
 *
 * --chilli is used here rather than --chilli-lit because this is a graphical
 * object, held to 3:1 (it measures 3.3:1), not text at 4.5:1.
 */
export function VegMark({ veg }: { veg: boolean }) {
  const colour = veg ? "#17a673" : "#c2361f";
  const label = veg ? "Vegetarian" : "Non-vegetarian";
  return (
    <span className="inline-flex shrink-0" title={label}>
      <svg width="14" height="14" viewBox="0 0 14 14" role="img" aria-label={label}>
        <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="1.5" fill="none" stroke={colour} strokeWidth="1.5" />
        <circle cx="7" cy="7" r="3.2" fill={colour} />
      </svg>
    </span>
  );
}

export function SpicePips({ level }: { level: SpiceLevel }) {
  if (level === 0) return null;
  const label = ["", "Mild", "Medium", "Hot"][level];
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Spice: ${label}`} title={`Spice: ${label}`}>
      {[1, 2, 3].map((pip) => (
        <svg key={pip} width="9" height="12" viewBox="0 0 9 12" aria-hidden="true">
          <path
            d="M4.5 11.5C2.3 11.5.8 9.6.8 7.3.8 5 2.6 3.2 4.5.9c1.9 2.3 3.7 4.1 3.7 6.4 0 2.3-1.5 4.2-3.7 4.2Z"
            fill={pip <= level ? "#c2361f" : "none"}
            stroke={pip <= level ? "#c2361f" : "#1c5641"}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

/** Marks the six items added to fill Breads and Beverages. */
export function UnverifiedMark() {
  return (
    <span
      className="data rounded-full border border-brass/40 px-1.5 py-0.5 text-[0.625rem] leading-none text-brass"
      title="Not on the attested menu list — added to populate this category. Verify at the counter."
    >
      ?
    </span>
  );
}
