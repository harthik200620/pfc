"use client";

interface Props {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function Stepper({ value, onChange, label, min = 0, max = 99, size = "md" }: Props) {
  // Both sizes clear 44px; "sm" only narrows the count column, so dense
  // contexts stay compact without dropping under the touch-target floor.
  const dim = "h-11 w-11";
  const gap = size === "sm" ? "w-7" : "w-8";
  return (
    <div className="inline-flex items-center rounded border border-line bg-espresso-3">
      <button
        type="button"
        className={`${dim} grid place-items-center rounded text-linen transition-colors hover:text-champagne disabled:opacity-35`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Remove one ${label}`}
      >
        <svg width="14" height="2" viewBox="0 0 14 2" aria-hidden="true">
          <rect width="14" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      <span className={`data ${gap} text-center tabular-nums`} aria-live="polite" aria-label={`${value} ${label}`}>
        {value}
      </span>
      <button
        type="button"
        className={`${dim} grid place-items-center rounded text-linen transition-colors hover:text-champagne disabled:opacity-35`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Add one ${label}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <rect y="6" width="14" height="2" rx="1" fill="currentColor" />
          <rect x="6" width="2" height="14" rx="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
