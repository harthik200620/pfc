"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { NAV_LINKS, SITE } from "@/data/site";
import { WINDOW_LABELS } from "@/lib/hours";
import { ApiError, subscribe } from "@/lib/api";
import { isEmail } from "@/lib/format";
import { useToast } from "@/components/providers/ToastProvider";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("That address is missing something — check the @ and the dot.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await subscribe(email);
      setDone(true);
      setEmail("");
      toast("You're on the list");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <footer className="mt-12 border-t border-line bg-espresso-2">
      <div className="shell py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="brand foil w-fit text-3xl">PFC</p>
            <div className="metal-rule mt-3" aria-hidden="true" />
            <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-champagne">
              Pan Loop Fast Food Center
            </p>
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-linen-2">
              Oval 3, at the entrance to the loop.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-5">Pages</h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-linen-2 transition-colors hover:text-champagne">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/credits" className="text-sm text-linen-2 transition-colors hover:text-champagne">
                  Image credits
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-5">Hours &amp; phone</h2>
            <ul className="data space-y-2 text-sm text-linen-2">
              {WINDOW_LABELS.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2">
              {SITE.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="data text-sm text-champagne underline underline-offset-4 hover:text-linen"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow mb-5">When the board changes</h2>
            {done ? (
              <p className="text-sm text-linen-2">Noted. You&apos;ll hear when something new goes up.</p>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <label htmlFor="newsletter" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter"
                  type="email"
                  className="field"
                  placeholder="you@kgpian.iitkgp.ac.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "newsletter-error" : undefined}
                />
                {error && (
                  <p id="newsletter-error" className="mt-1.5 text-sm text-oxide">
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-ghost mt-3 w-full" disabled={pending}>
                  {pending ? "Adding…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <p className="max-w-[72ch] text-xs leading-relaxed text-linen-2">
            Student-built and not officially affiliated with PFC or with IIT Kharagpur. Prices,
            delivery fees and arrival times on this site are placeholders and are not quoted by
            the restaurant. Nothing here places a real order. Photographs are used under CC0 or
            Creative Commons licences, except the storefront photo, which is credited to its
            source — see{" "}
            <Link href="/credits" className="underline hover:text-champagne">
              credits
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
