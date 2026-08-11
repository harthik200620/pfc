"use client";

import { useEffect, useState, type FormEvent } from "react";
import { reserveTable, ApiError, TEST_FAILURE_PHONE } from "@/lib/api";
import { reservationSlots, WINDOW_LABELS } from "@/lib/hours";
import { isIndianPhone, todayISO } from "@/lib/format";
import { readStore, writeStore, removeStore, STORE_KEYS } from "@/lib/storage";
import type { ReservationResult } from "@/lib/types";

type Field = "date" | "time" | "party" | "name" | "phone";
type Errors = Partial<Record<Field, string>>;

interface Saved extends ReservationResult {
  date: string;
  time: string;
  party: number;
  name: string;
}

const SLOTS = reservationSlots();

export function Reserve() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    party: "2",
    name: "",
    phone: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, date: todayISO() }));
    setSaved(readStore<Saved | null>(STORE_KEYS.reservation, null));
    setHydrated(true);
  }, []);

  function validate(field: Field, value: string): string | undefined {
    switch (field) {
      case "date":
        if (!value) return "Pick a date.";
        if (value < todayISO()) return "That date has passed. Pick today or later.";
        return undefined;
      case "time":
        if (!value) return "Pick a slot.";
        return SLOTS.some((s) => s.value === value)
          ? undefined
          : "The kitchen is shut then. Slots run 12–4 and 6–11.";
      case "party": {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 1) return "At least one person.";
        if (n > 20) return "Over 20 — call the counter and they'll sort it out.";
        return undefined;
      }
      case "name":
        return value.trim().length >= 2 ? undefined : "We need a name for the table.";
      case "phone":
        return isIndianPhone(value) ? undefined : "Ten digits, starting 6 to 9.";
      default:
        return undefined;
    }
  }

  // Validate on blur, never on keystroke.
  function onBlur(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validate(field, form[field]) }));
  }

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear an error the moment the field becomes valid — don't nag.
    if (touched[field as Field] && errors[field as Field]) {
      const next = validate(field as Field, value);
      if (!next) setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailure(null);

    const fields: Field[] = ["date", "time", "party", "name", "phone"];
    const found: Errors = {};
    for (const field of fields) {
      const message = validate(field, form[field]);
      if (message) found[field] = message;
    }
    setErrors(found);
    setTouched(Object.fromEntries(fields.map((f) => [f, true])));
    if (Object.keys(found).length > 0) {
      document.getElementById(`reserve-${fields.find((f) => found[f])}`)?.focus();
      return;
    }

    setPending(true);
    try {
      const result = await reserveTable({
        date: form.date,
        time: form.time,
        party: Number(form.party),
        name: form.name,
        phone: form.phone,
        note: form.note,
      });
      const record: Saved = {
        ...result,
        date: form.date,
        time: form.time,
        party: Number(form.party),
        name: form.name,
      };
      writeStore(STORE_KEYS.reservation, record);
      setSaved(record);
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  const slotLabel = SLOTS.find((s) => s.value === saved?.time)?.label ?? saved?.time;

  return (
    <section id="reserve" className="section lume-rise pool-bl" aria-labelledby="reserve-heading">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div>
            <p className="eyebrow mb-4">Reserve</p>
            <h2 id="reserve-heading" className="h2 rule-under">
              Hold a table in the arena.
            </h2>
            <p className="mt-5 text-jade-mist/70">
              Seating is open-air and shaded, and it fills fast between 8 and 9. Two service
              windows only — the picker won&apos;t offer you five o&apos;clock, because there
              is no five o&apos;clock.
            </p>
            <ul className="data mt-6 space-y-1 text-muted">
              {WINDOW_LABELS.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          {saved ? (
            <div className="card anim-pop p-8">
              <p className="eyebrow mb-3 text-emerald-lit">Table held</p>
              <p className="h2 font-mono text-emerald-lit">{saved.bookingRef}</p>
              <p className="mt-4 text-jade-mist/80">
                {saved.name}, {saved.party} {saved.party === 1 ? "person" : "people"}, {saved.date} at{" "}
                {slotLabel}.
              </p>
              <p className="mt-3 text-sm text-jade-mist/55">
                Show the reference at the counter. Nothing was actually sent anywhere — this is a
                student-built demo with no backend.
              </p>
              <button
                type="button"
                className="btn btn-ghost mt-6"
                onClick={() => {
                  removeStore(STORE_KEYS.reservation);
                  setSaved(null);
                  setErrors({});
                  setTouched({});
                }}
              >
                Book another
              </button>
            </div>
          ) : (
            <form className="card p-6 sm:p-8" onSubmit={onSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldWrap id="reserve-date" label="Date" error={errors.date}>
                  <input
                    id="reserve-date"
                    type="date"
                    className="field"
                    min={hydrated ? todayISO() : undefined}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    onBlur={() => onBlur("date")}
                    aria-invalid={Boolean(errors.date)}
                    aria-describedby={errors.date ? "reserve-date-error" : undefined}
                  />
                </FieldWrap>

                <FieldWrap id="reserve-time" label="Time" error={errors.time}>
                  <select
                    id="reserve-time"
                    className="field"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    onBlur={() => onBlur("time")}
                    aria-invalid={Boolean(errors.time)}
                    aria-describedby={errors.time ? "reserve-time-error" : undefined}
                  >
                    <option value="">Pick a slot</option>
                    {SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </FieldWrap>

                <FieldWrap id="reserve-party" label="People" error={errors.party}>
                  <input
                    id="reserve-party"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={20}
                    className="field"
                    value={form.party}
                    onChange={(e) => update("party", e.target.value)}
                    onBlur={() => onBlur("party")}
                    aria-invalid={Boolean(errors.party)}
                    aria-describedby={errors.party ? "reserve-party-error" : undefined}
                  />
                </FieldWrap>

                <FieldWrap id="reserve-name" label="Name" error={errors.name}>
                  <input
                    id="reserve-name"
                    type="text"
                    autoComplete="name"
                    className="field"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    onBlur={() => onBlur("name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "reserve-name-error" : undefined}
                  />
                </FieldWrap>

                <FieldWrap id="reserve-phone" label="Phone" error={errors.phone} className="sm:col-span-2">
                  <input
                    id="reserve-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className="field"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => onBlur("phone")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "reserve-phone-error" : undefined}
                  />
                </FieldWrap>

                <div className="sm:col-span-2">
                  <label htmlFor="reserve-note" className="eyebrow mb-2 block">
                    Anything else <span className="text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="reserve-note"
                    rows={3}
                    className="field resize-y"
                    value={form.note}
                    onChange={(e) => update("note", e.target.value)}
                    placeholder="Birthday, a chair that doesn't wobble, whatever."
                  />
                </div>
              </div>

              {failure && (
                <p className="mt-5 rounded-lg border border-chilli-lit/40 bg-chilli/10 p-3 text-sm text-chilli-lit" role="alert">
                  {failure}
                </p>
              )}

              <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending}>
                {pending ? "Holding the table…" : "Confirm reservation"}
              </button>

              <p className="mt-4 text-xs text-muted">
                No backend — this resolves against a mock. To see the failure path, book with{" "}
                <span className="data">{TEST_FAILURE_PHONE}</span>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function FieldWrap({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-chilli-lit">
          {error}
        </p>
      )}
    </div>
  );
}
