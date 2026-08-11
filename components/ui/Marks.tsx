import type { SpiceLevel } from "@/lib/types";

/**
 * The Indian veg / non-veg mark. This is a legal marking under the Food Safety
 * and Standards (Packaging and Labelling) Regulations — a green square with a
 * green filled circle for vegetarian, brown/red with a filled circle for
 * non-vegetarian. It is not a style choice and is not recoloured to match the
 * palette; the green survives the redesign on purpose.
 */
export function VegMark({ veg }: { veg: boolean }) {
  // Brighter variants of the legal green/red so the mark stays legible on
  // dark surfaces; the square-and-dot semantics are unchanged.
  const colour = veg ? "#2fa05f" : "#d4472e";
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
            fill={pip <= level ? "#d4472e" : "none"}
            stroke={pip <= level ? "#d4472e" : "rgba(246,241,231,0.3)"}
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
      className="data rounded border border-line px-1.5 py-0.5 text-[0.625rem] leading-none text-linen-2"
      title="Not on the attested menu list — added to populate this category. Verify at the counter."
    >
      ?
    </span>
  );
}
