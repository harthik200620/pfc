"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { istClock, WINDOW_LABELS } from "@/lib/hours";
import { OpenPill } from "@/components/OpenPill";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MAP_QUERY = encodeURIComponent(
  `PAN Loop Fast Food Center, ${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.city} ${SITE.address.postalCode}`,
);
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

export function Visit() {
  const [today, setToday] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Same neutral-first-paint rule as the open/closed pill: the server's day is
  // not necessarily the visitor's day in Asia/Kolkata.
  useEffect(() => setToday(istClock().weekday), []);

  return (
    <section id="visit" className="section" aria-labelledby="visit-heading">
      <div className="shell">
        <div className="text-center">
          <p className="eyebrow mb-5">Find us</p>
          <h2 id="visit-heading" className="h2 mx-auto max-w-[20ch]">
            Oval 3, where the loop begins.
          </h2>
          <div className="metal-rule mx-auto mt-6" aria-hidden="true" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="eyebrow mb-3">Address</h3>
              <address className="not-italic leading-relaxed text-linen-2">
                {SITE.address.line1}
                <br />
                {SITE.address.line2}
                <br />
                {SITE.address.city}, {SITE.address.state} {SITE.address.postalCode}
              </address>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost mt-5"
              >
                Directions
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4 10L10 4M10 4H5M10 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <div className="card p-6">
              <h3 className="eyebrow mb-3">Phone</h3>
              <ul className="space-y-2">
                {SITE.phones.map((phone) => (
                  <li key={phone}>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="data text-champagne underline underline-offset-4 hover:text-linen"
                    >
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-linen-2">
                Delivery runs to the halls of residence, to departments and to the Main Building.
                Say the hall and the room number; they know the rest.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="eyebrow">Hours</h3>
                <OpenPill />
              </div>
              <ul className="divide-y divide-line">
                {DAYS.map((day) => {
                  const isToday = today === day;
                  return (
                    <li
                      key={day}
                      className={`flex items-baseline justify-between gap-4 py-2.5 ${
                        isToday ? "font-bold text-champagne" : "text-linen-2"
                      }`}
                      aria-current={isToday ? "date" : undefined}
                    >
                      <span className="text-sm font-medium">{day}</span>
                      <span className="data text-right">{WINDOW_LABELS.join("  ·  ")}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm text-linen-2">
                The four-to-six gap is the shift change, not a closure by accident.
              </p>
            </div>

            {/* Static panel by default; the third-party frame loads only on
                click, so it isn't charged against first-paint LCP or CLS. */}
            <div className="card overflow-hidden">
              {mapLoaded ? (
                <iframe
                  title="Map to PFC, PAN Loop, IIT Kharagpur"
                  src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`}
                  className="aspect-[4/3] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="relative aspect-[4/3] w-full">
                  <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Schematic of the PAN Loop with PFC at its entrance">
                    <rect width="400" height="300" fill="#1d1712" />
                    <g stroke="#f6f1e7" strokeWidth="1" opacity="0.05">
                      {[60, 120, 180, 240].map((y) => (
                        <line key={y} x1="0" y1={y} x2="400" y2={y} />
                      ))}
                      {[80, 160, 240, 320].map((x) => (
                        <line key={x} x1={x} y1="0" x2={x} y2="300" />
                      ))}
                    </g>
                    <circle cx="200" cy="150" r="88" fill="none" stroke="#f6f1e7" strokeWidth="14" opacity="0.04" />
                    <circle cx="200" cy="150" r="88" fill="none" stroke="#d3b778" strokeWidth="1.25" opacity="0.5" />
                    <text x="200" y="155" textAnchor="middle" style={{ fontFamily: "var(--font-body)", letterSpacing: "0.2em" }} fontSize="11" fontWeight="600" fill="#f6f1e7" fillOpacity="0.4">
                      PAN LOOP
                    </text>
                    <circle cx="140" cy="215" r="7" fill="#d3b778" />
                    <text x="128" y="240" textAnchor="middle" style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }} fontSize="11" fontWeight="700" fill="#d3b778">
                      PFC
                    </text>
                    <circle cx="255" cy="215" r="4" fill="#1d1712" stroke="#f6f1e7" strokeOpacity="0.5" strokeWidth="1.25" />
                    <text x="272" y="219" style={{ fontFamily: "var(--font-body)" }} fontSize="10" fontWeight="600" fill="#f6f1e7" fillOpacity="0.55">PT</text>
                    <circle cx="285" cy="112" r="4" fill="#1d1712" stroke="#f6f1e7" strokeOpacity="0.5" strokeWidth="1.25" />
                    <text x="296" y="116" style={{ fontFamily: "var(--font-body)" }} fontSize="10" fontWeight="600" fill="#f6f1e7" fillOpacity="0.55">AZ</text>
                    <circle cx="163" cy="66" r="4" fill="#1d1712" stroke="#f6f1e7" strokeOpacity="0.5" strokeWidth="1.25" />
                    <text x="150" y="56" style={{ fontFamily: "var(--font-body)" }} fontSize="10" fontWeight="600" fill="#f6f1e7" fillOpacity="0.55">NH</text>
                  </svg>
                  <div className="absolute inset-0 grid place-items-end p-4">
                    <button type="button" className="btn btn-ghost w-full" onClick={() => setMapLoaded(true)}>
                      Load the interactive map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
