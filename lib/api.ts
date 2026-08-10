// ---------------------------------------------------------------------------
// The mock API seam.
//
// Every would-be network call lives here. Each returns a typed promise and
// resolves after 400–900ms. Swapping in fetch() later touches this file and
// nothing else.
//
// FAILURE IS DETERMINISTIC, NOT RANDOM. A uniform failure rate means roughly
// one visitor in twelve who clicks "Place order" gets an error and never
// reaches the success screen — including whoever you are demoing to — and it
// cannot be reproduced on demand. Instead every error path is reachable two
// ways, both documented in the README:
//
//   1. Use the reserved test phone number +91 00000 00000.
//   2. Call forceNextFailure() — wired to a dev-only toggle in the cart.
//
// Coverage is better this way, not worse.
// ---------------------------------------------------------------------------

import { nationalDigits, TEST_FAILURE_DIGITS } from "@/lib/format";
import type {
  OrderPayload,
  OrderResult,
  ReservationPayload,
  ReservationResult,
  ReviewPayload,
} from "@/lib/types";

export const TEST_FAILURE_PHONE = "+91 00000 00000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

let forcedFailure = false;

/** Arms the next call to fail, once. */
export function forceNextFailure(): void {
  forcedFailure = true;
}

export function failureArmed(): boolean {
  return forcedFailure;
}

function isTestFailurePhone(phone: string | undefined): boolean {
  if (!phone) return false;
  return nationalDigits(phone) === TEST_FAILURE_DIGITS;
}

function shouldFail(phone?: string): boolean {
  if (forcedFailure) {
    forcedFailure = false;
    return true;
  }
  return isTestFailurePhone(phone);
}

function latency(): number {
  return 400 + Math.floor(Math.random() * 500);
}

function settle<T>(value: T, opts: { phone?: string; error: string }): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const fail = shouldFail(opts.phone);
    setTimeout(() => {
      if (fail) reject(new ApiError(opts.error));
      else resolve(value);
    }, latency());
  });
}

/** Short, readable, mono-friendly. Not a security token. */
function reference(prefix: string): string {
  // No 0/O/1/I/S/5 — these get read aloud at a counter.
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY3467";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${out}`;
}

export function placeOrder(payload: OrderPayload & { etaMinutes: number }): Promise<OrderResult> {
  return settle(
    { orderId: reference("PFC"), etaMinutes: payload.etaMinutes },
    {
      phone: payload.phone,
      error: "The counter didn't pick up. Your cart is intact — try placing the order again.",
    },
  );
}

export function reserveTable(payload: ReservationPayload): Promise<ReservationResult> {
  return settle(
    { bookingRef: reference("TBL"), confirmedAt: new Date().toISOString() },
    {
      phone: payload.phone,
      error: "That slot didn't go through. Pick another time, or call the counter on +91 90938 88281.",
    },
  );
}

export function subscribe(email: string): Promise<{ ok: true }> {
  return settle({ ok: true } as const, {
    error: "That didn't send. Check the address and try once more.",
  });
}

export function submitReview(payload: ReviewPayload): Promise<{ ok: true }> {
  return settle({ ok: true } as const, {
    error: "The review didn't post. Your text is still here — send it again.",
  });
}
