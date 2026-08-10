import { SERVICE_WINDOWS, TIMEZONE } from "@/data/site";

export interface ServiceStatus {
  open: boolean;
  /** "Open · closes 4:00 PM" / "Closed · opens 6:00 PM" */
  label: string;
  /** Minutes from midnight, Asia/Kolkata, at the time of the reading. */
  minutes: number;
  weekday: string;
}

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  weekday: "long",
});

/** Wall-clock reading in Asia/Kolkata, regardless of where this runs. */
export function istClock(date: Date = new Date()): { minutes: number; weekday: string } {
  const parts = partsFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { minutes: hour * 60 + minute, weekday: get("weekday") };
}

export function formatClock(minutesFromMidnight: number): string {
  const m = ((minutesFromMidnight % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export function getServiceStatus(date: Date = new Date()): ServiceStatus {
  const { minutes, weekday } = istClock(date);

  for (const w of SERVICE_WINDOWS) {
    if (minutes >= w.open && minutes < w.close) {
      return {
        open: true,
        label: `Open · closes ${formatClock(w.close)}`,
        minutes,
        weekday,
      };
    }
  }

  const next = SERVICE_WINDOWS.find((w) => minutes < w.open);
  const opensAt = next ? next.open : SERVICE_WINDOWS[0]!.open;
  return {
    open: false,
    label: `Closed · opens ${formatClock(opensAt)}`,
    minutes,
    weekday,
  };
}

/** 30-minute reservation slots inside the two windows. Never offers 5 PM. */
export function reservationSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  for (const w of SERVICE_WINDOWS) {
    // Last seating is 30 minutes before close.
    for (let m = w.open; m <= w.close - 30; m += 30) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push({ value: `${h}:${mm}`, label: formatClock(m) });
    }
  }
  return slots;
}

export function isSlotValid(value: string): boolean {
  return reservationSlots().some((s) => s.value === value);
}

export const WINDOW_LABELS = SERVICE_WINDOWS.map(
  (w) => `${formatClock(w.open)} – ${formatClock(w.close)}`,
);
