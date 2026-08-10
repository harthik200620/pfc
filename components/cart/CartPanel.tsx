"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, failureArmed, forceNextFailure, placeOrder, TEST_FAILURE_PHONE } from "@/lib/api";
import { HALLS } from "@/data/halls";
import { ringOrder } from "@/lib/delivery";
import { isIndianPhone, perHead, rupees } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Stepper } from "@/components/ui/Stepper";
import { DishMedia } from "@/components/ui/DishMedia";
import type { OrderResult } from "@/lib/types";

type View = "cart" | "checkout" | "done";

const ORDERED_HALLS = ringOrder(HALLS);

export function CartPanel() {
  const cart = useCart();
  const { toast } = useToast();
  const [view, setView] = useState<View>("cart");
  const [result, setResult] = useState<OrderResult | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cart.isOpen) {
      setView("cart");
      setResult(null);
      return;
    }
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cart.closeCart();
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cart.isOpen, cart]);

  if (!cart.isOpen) return null;

  const { lines, subtotal, deliveryFee, packagingFee, total, state, etaMinutes } = cart;
  const heads = state.heads;
  const split = state.treatMode && heads > 1;

  async function copyBreakdown() {
    const rows = lines.map(
      (l) =>
        `${l.qty}× ${l.dish.name}  ${rupees(l.lineTotal)}${split ? `  (${rupees(perHead(l.lineTotal, heads))}/head)` : ""}`,
    );
    const text = [
      `PFC — ${cart.hallName ?? "no hall picked"}`,
      "",
      ...rows,
      "",
      `Subtotal   ${rupees(subtotal)}`,
      `Delivery   ${rupees(deliveryFee)}`,
      `Packaging  ${rupees(packagingFee)}`,
      `TOTAL      ${rupees(total)}`,
      split ? `\n${heads} heads → ${rupees(perHead(total, heads))} each` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      toast("Bill copied — paste it in the group");
    } catch {
      toast("Couldn't reach the clipboard. Select the total and copy it by hand.", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-end sm:items-stretch">
      <button
        type="button"
        className="anim-fade absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={cart.closeCart}
        aria-label="Close cart"
        tabIndex={-1}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="anim-sheet relative flex max-h-[92svh] w-full flex-col border-t border-hairline bg-ink sm:anim-panel sm:max-h-none sm:w-[26rem] sm:border-l sm:border-t-0"
      >
        <header className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <h2 className="h3">
            {view === "cart" && "Your cart"}
            {view === "checkout" && "Checkout"}
            {view === "done" && "Order placed"}
          </h2>
          <button
            ref={closeButton}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-jade-mist transition-colors hover:text-emerald-lit"
            onClick={cart.closeCart}
          >
            <span className="sr-only">Close cart</span>
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {view === "done" && result ? (
          <SuccessView result={result} onClose={cart.closeCart} />
        ) : view === "checkout" ? (
          <CheckoutView
            onBack={() => setView("cart")}
            onDone={(r) => {
              setResult(r);
              setView("done");
              cart.clear();
            }}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="h3">Nothing in here yet.</p>
                  <p className="mx-auto mt-3 max-w-[32ch] text-sm text-jade-mist/60">
                    Start with the Mughlai Biryani — it&apos;s what the rest of the loop is having.
                  </p>
                  <button type="button" className="btn btn-ghost mt-6" onClick={cart.closeCart}>
                    Go to the menu
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-hairline">
                  {lines.map((line) => (
                    <li key={line.dish.id} className="flex gap-3 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <DishMedia id={line.dish.id} alt={line.dish.name} sizes="64px" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-snug">{line.dish.name}</p>
                        <p className="data mt-1 text-brass">
                          {rupees(line.lineTotal)}
                          {split && (
                            <span className="ml-2 text-jade-mist/45">
                              {rupees(perHead(line.lineTotal, heads))}/head
                            </span>
                          )}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <Stepper
                            size="sm"
                            value={line.qty}
                            min={0}
                            label={line.dish.name}
                            onChange={(next) => cart.setQty(line.dish.id, next)}
                          />
                          <button
                            type="button"
                            className="-my-3.5 py-3.5 text-xs text-jade-mist/45 underline underline-offset-4 hover:text-chilli-lit"
                            onClick={() => cart.remove(line.dish.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {lines.length > 0 && (
                <div className="mt-5 rounded-xl border border-brass/25 bg-brass/[0.04] p-4">
                  <label className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold text-brass">Treat mode</span>
                      <span className="block text-xs text-jade-mist/55">Split it before anyone argues.</span>
                    </span>
                    <input
                      type="checkbox"
                      className="h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-hairline bg-surface-1 transition-colors checked:border-brass checked:bg-brass after:block after:h-4 after:w-4 after:translate-x-1 after:rounded-full after:bg-jade-mist after:transition-transform after:content-[''] checked:after:translate-x-6 checked:after:bg-ink"
                      checked={state.treatMode}
                      onChange={(e) => cart.setTreat(e.target.checked)}
                    />
                  </label>

                  {state.treatMode && (
                    <div className="anim-fade mt-4 border-t border-brass/20 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-jade-mist/75">How many heads?</span>
                        <Stepper
                          size="sm"
                          value={heads}
                          min={1}
                          max={40}
                          label="heads"
                          onChange={cart.setHeads}
                        />
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <span className="text-sm text-jade-mist/75">Your share</span>
                        <span className="data text-xl text-brass">{rupees(perHead(total, heads))}</span>
                      </div>
                      <button type="button" className="btn btn-ghost mt-4 w-full" onClick={copyBreakdown}>
                        Share the damage
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-hairline px-5 py-4">
                <dl className="space-y-1.5 text-sm" aria-live="polite">
                  <Row label="Subtotal" value={rupees(subtotal)} />
                  <Row
                    label={cart.hallName ? `Delivery — ${cart.hallName}` : "Delivery — pick a hall"}
                    value={rupees(deliveryFee)}
                  />
                  <Row label="Packaging" value={rupees(packagingFee)} />
                  <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-2.5">
                    <dt className="font-semibold">Total</dt>
                    <dd className="data text-lg text-emerald-lit">{rupees(total)}</dd>
                  </div>
                  {split && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-jade-mist/55">{heads} heads</dt>
                      <dd className="data text-brass">{rupees(perHead(total, heads))} each</dd>
                    </div>
                  )}
                </dl>

                {!state.hallId && (
                  <p className="mt-3 text-xs text-brass">
                    No hall picked yet — the delivery fee lands once you choose one on the ring.
                  </p>
                )}

                <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setView("checkout")}>
                  Checkout
                  {etaMinutes !== null && <span className="data opacity-70">{etaMinutes} min</span>}
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-jade-mist/65">{label}</dt>
      <dd className="data text-jade-mist/85">{value}</dd>
    </div>
  );
}

// ---------------------------------------------------------------- checkout --

function CheckoutView({ onBack, onDone }: { onBack: () => void; onDone: (r: OrderResult) => void }) {
  const cart = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    hallId: cart.state.hallId ?? "",
    room: "",
    payment: "cash" as "cash" | "upi",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  function validate(field: string, value: string): string | undefined {
    if (field === "name") return value.trim().length >= 2 ? undefined : "We need a name for the bag.";
    if (field === "phone") return isIndianPhone(value) ? undefined : "Ten digits, starting 6 to 9.";
    if (field === "hallId") return value ? undefined : "Pick a hall — it sets the fee and the ETA.";
    if (field === "room") return value.trim().length >= 1 ? undefined : "Room number, so they don't have to call.";
    return undefined;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailure(null);

    const found: Record<string, string | undefined> = {};
    for (const field of ["name", "phone", "hallId", "room"]) {
      const message = validate(field, form[field as keyof typeof form] as string);
      if (message) found[field] = message;
    }
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      document.getElementById(`co-${Object.keys(found).find((k) => found[k])}`)?.focus();
      return;
    }

    setPending(true);
    try {
      const result = await placeOrder({
        name: form.name,
        phone: form.phone,
        hallId: form.hallId,
        room: form.room,
        payment: form.payment,
        notes: form.notes,
        lines: cart.state.lines,
        total: cart.total,
        etaMinutes: cart.etaMinutes ?? 20,
      });
      onDone(result);
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setArmed(failureArmed());
    } finally {
      setPending(false);
    }
  }

  const label = "eyebrow mb-2 block";

  return (
    <form className="flex flex-1 flex-col overflow-y-auto" onSubmit={onSubmit} noValidate>
      <div className="flex-1 space-y-4 px-5 py-4">
        <div>
          <label htmlFor="co-name" className={label}>
            Name
          </label>
          <input
            id="co-name"
            className="field"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onBlur={(e) => setErrors((x) => ({ ...x, name: validate("name", e.target.value) }))}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="mt-1.5 text-sm text-chilli-lit">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="co-phone" className={label}>
            Phone
          </label>
          <input
            id="co-phone"
            type="tel"
            className="field"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            onBlur={(e) => setErrors((x) => ({ ...x, phone: validate("phone", e.target.value) }))}
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <p className="mt-1.5 text-sm text-chilli-lit">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
          <div>
            <label htmlFor="co-hallId" className={label}>
              Hall
            </label>
            <select
              id="co-hallId"
              className="field"
              value={form.hallId}
              onChange={(e) => {
                setForm((f) => ({ ...f, hallId: e.target.value }));
                cart.setHall(e.target.value);
              }}
              onBlur={(e) => setErrors((x) => ({ ...x, hallId: validate("hallId", e.target.value) }))}
              aria-invalid={Boolean(errors.hallId)}
            >
              <option value="">Choose</option>
              {ORDERED_HALLS.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>
            {errors.hallId && <p className="mt-1.5 text-sm text-chilli-lit">{errors.hallId}</p>}
          </div>
          <div>
            <label htmlFor="co-room" className={label}>
              Room
            </label>
            <input
              id="co-room"
              className="field"
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
              onBlur={(e) => setErrors((x) => ({ ...x, room: validate("room", e.target.value) }))}
              aria-invalid={Boolean(errors.room)}
            />
            {errors.room && <p className="mt-1.5 text-sm text-chilli-lit">{errors.room}</p>}
          </div>
        </div>

        <fieldset>
          <legend className={label}>Payment</legend>
          <div className="flex gap-2">
            {(["cash", "upi"] as const).map((method) => (
              <label
                key={method}
                className={`data flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                  form.payment === method
                    ? "border-emerald-lit bg-emerald-lit text-ink"
                    : "border-hairline text-jade-mist/70 hover:border-emerald-lit/60"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  className="sr-only"
                  checked={form.payment === method}
                  onChange={() => setForm((f) => ({ ...f, payment: method }))}
                />
                {method === "cash" ? "Cash" : "UPI"}
              </label>
            ))}
          </div>
          {/* Display-only, and that is deliberate — no backend can take a
              payment. It is not a dead control: the choice is carried into the
              summary below and onto the success screen. */}
          <p className="mt-2 text-xs text-jade-mist/45">
            {form.payment === "cash"
              ? `Pay ${rupees(cart.total)} in cash when it arrives.`
              : `Pay ${rupees(cart.total)} by UPI at the door — they'll show a QR.`}
          </p>
        </fieldset>

        <div>
          <label htmlFor="co-notes" className={label}>
            Notes <span className="text-jade-mist/35">(optional)</span>
          </label>
          <textarea
            id="co-notes"
            rows={2}
            className="field resize-y"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Extra green chutney, call on arrival, gate is locked after 11."
          />
        </div>

        {failure && (
          <p className="rounded-lg border border-chilli-lit/40 bg-chilli/10 p-3 text-sm text-chilli-lit" role="alert">
            {failure}
          </p>
        )}

        <div className="rounded-lg border border-hairline p-3">
          <p className="text-xs text-jade-mist/45">
            Mock API — nothing is sent anywhere. Failure is deterministic, not random: order with{" "}
            <span className="data">{TEST_FAILURE_PHONE}</span>, or arm it here.
          </p>
          <button
            type="button"
            className="data mt-2 text-xs text-brass underline underline-offset-4"
            onClick={() => {
              forceNextFailure();
              setArmed(true);
            }}
          >
            {armed ? "Next call will fail ✓" : "Make the next call fail"}
          </button>
        </div>
      </div>

      <footer className="border-t border-hairline px-5 py-4">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <span className="text-sm text-jade-mist/65">Total</span>
          <span className="data text-lg text-emerald-lit">{rupees(cart.total)}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost px-5" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={pending}>
            {pending ? "Sending to the counter…" : "Place order"}
          </button>
        </div>
      </footer>
    </form>
  );
}

// ----------------------------------------------------------------- success --

function SuccessView({ result, onClose }: { result: OrderResult; onClose: () => void }) {
  return (
    <div className="anim-pop flex flex-1 flex-col justify-center px-6 py-12 text-center">
      <p className="eyebrow mb-4 text-emerald-lit">In the queue</p>
      <p className="font-mono text-4xl font-semibold tracking-tight text-emerald-lit">
        {result.orderId}
      </p>
      <p className="mt-6 text-jade-mist/80">
        Roughly <span className="data text-brass">{result.etaMinutes} minutes</span> to your hall.
        Quote the reference if you call.
      </p>
      <p className="mt-4 text-sm text-jade-mist/50">
        Nothing was actually sent — this is a student-built demo with no backend.
      </p>
      <button type="button" className="btn btn-primary mt-8" onClick={onClose}>
        Done
      </button>
    </div>
  );
}
