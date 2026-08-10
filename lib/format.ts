/** ₹ with no decimals — nothing on this menu has paise. */
export function rupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Per-head split, rounded up so the total is never short. */
export function perHead(amount: number, heads: number): number {
  if (heads <= 0) return amount;
  return Math.ceil(amount / heads);
}

export function minutes(n: number): string {
  return `${n} min`;
}

/** The reserved number that forces the mock API to fail. See lib/api.ts. */
export const TEST_FAILURE_DIGITS = "0000000000";

/**
 * Reduce the shapes people actually type — 98765 43210, +91 98765 43210,
 * 091-98765-43210 — to the bare ten-digit national number.
 */
export function nationalDigits(value: string): string {
  let digits = value.replace(/[^\d]/g, "");
  if (digits.length === 13 && digits.startsWith("091")) digits = digits.slice(3);
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isIndianPhone(value: string): boolean {
  const n = nationalDigits(value);
  // The reserved test number is deliberately not a real one, but has to pass
  // validation or the failure path it exists to demonstrate is unreachable.
  if (n === TEST_FAILURE_DIGITS) return true;
  return /^[6-9]\d{9}$/.test(n);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
