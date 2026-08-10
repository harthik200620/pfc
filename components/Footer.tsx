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
    <footer className="hairline mt-10">
      <div className="shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-3xl">PFC</p>
            <p className="data mt-1 text-brass">PAN LOOP</p>
            <p className="mt-4 max-w-[28ch] text-sm text-jade-mist/60">{SITE.fullName}, Oval 3, at the entrance to the loop.</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4">Pages</h2>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-jade-mist/70 hover:text-emerald-lit">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/credits" className="text-sm text-jade-mist/70 hover:text-emerald-lit">
                  Image credits
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">Hours &amp; phone</h2>
            <ul className="data space-y-1.5 text-jade-mist/70">
              {WINDOW_LABELS.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <ul className="mt-3 space-y-1.5">
              {SITE.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="data text-emerald-lit hover:underline">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow mb-4">When the board changes</h2>
            {done ? (
              <p className="text-sm text-emerald-lit">
                Done. You&apos;ll hear when something new goes up.
              </p>
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
                  <p id="newsletter-error" className="mt-1.5 text-sm text-chilli-lit">
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

        <div className="hairline mt-12 pt-6">
          <p className="max-w-[70ch] text-xs leading-relaxed text-jade-mist/45">
            Student-built and not officially affiliated with PFC or with IIT Kharagpur. Prices,
            delivery fees and ETAs on this site are placeholders and are not quoted by the
            restaurant. Nothing here places a real order. Photographs are used under CC0 or
            Creative Commons licences — see{" "}
            <Link href="/credits" className="underline hover:text-emerald-lit">
              credits
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
