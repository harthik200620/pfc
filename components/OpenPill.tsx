"use client";

import { useEffect, useState } from "react";
import { getServiceStatus, WINDOW_LABELS, type ServiceStatus } from "@/lib/hours";

/**
 * Live open/closed state in Asia/Kolkata.
 *
 * First paint is deliberately NEUTRAL — the two service windows, no status.
 * Computing the live value during render would use the server's clock, not the
 * visitor's, and the value changes between render and hydrate, which is a
 * guaranteed mismatch. The pill is still correct; it becomes correct one frame
 * after mount.
 */
export function OpenPill({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<ServiceStatus | null>(null);

  useEffect(() => {
    const read = () => setStatus(getServiceStatus());
    read();
    const timer = window.setInterval(read, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!status) {
    return (
      <span
        className={`data inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-jade-mist/70 ${className}`}
      >
        <span className="h-2 w-2 rounded-full bg-hairline" />
        {WINDOW_LABELS.join(" · ")}
      </span>
    );
  }

  return (
    <span
      className={`data inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
        status.open ? "border-emerald-lit/40 text-emerald-lit" : "border-brass/40 text-brass"
      } ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status.open ? "live-dot bg-emerald-lit" : "bg-brass"}`}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}
