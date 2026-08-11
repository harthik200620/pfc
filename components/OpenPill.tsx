"use client";

import { useEffect, useState } from "react";
import { getServiceStatus, WINDOW_LABELS, type ServiceStatus } from "@/lib/hours";

/**
 * Live open/closed state in Asia/Kolkata.
 *
 * First paint is deliberately NEUTRAL — the two service windows, no status.
 * Computing the live value during render would use the server's clock, not the
 * visitor's, and the value changes between render and hydrate, which is a
 * guaranteed mismatch. The pill becomes correct one frame after mount.
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
        className={`data inline-flex min-h-11 items-center gap-2.5 rounded border border-line bg-espresso/60 px-3.5 text-[0.8125rem] text-linen-2 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        {WINDOW_LABELS.join(" · ")}
      </span>
    );
  }

  return (
    <span
      className={`data inline-flex min-h-11 items-center gap-2.5 rounded border border-line bg-espresso/60 px-3.5 text-[0.8125rem] ${
        status.open ? "text-linen" : "text-linen-2"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status.open ? "live-dot bg-champagne" : "bg-linen-2"}`}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}
