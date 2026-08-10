/**
 * Guarded, versioned localStorage.
 *
 * try/catch on every access because Safari private mode throws on write, and
 * a schema version so a future shape change reads as "no saved data" instead
 * of crashing on stale JSON.
 *
 * The interface is deliberately narrow — read/write/remove of a whole value —
 * so swapping to root React state (claude.ai artifacts, where localStorage is
 * unavailable) is a one-file change.
 */

const VERSION = 1;
const PREFIX = `pfc.v${VERSION}.`;

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode. Losing a cart is survivable; throwing here is not.
  }
}

export function removeStore(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
}

export const STORE_KEYS = {
  cart: "cart",
  reservation: "reservation",
} as const;
