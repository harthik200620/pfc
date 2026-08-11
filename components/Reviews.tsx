"use client";

import { useState, type FormEvent } from "react";
import { ApiError, submitReview } from "@/lib/api";
import { SEED_REVIEWS } from "@/data/reviews";
import { SITE } from "@/data/site";
import { useToast } from "@/components/providers/ToastProvider";

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 14 14">
          <path
            d="M7 .8 8.9 5l4.5.4-3.4 3 1 4.4L7 10.5 3 12.8l1-4.4-3.4-3L5.1 5Z"
            fill={i <= Math.round(value) ? "#d3b778" : "none"}
            stroke="#d3b778"
            strokeOpacity={i <= Math.round(value) ? 1 : 0.35}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

export function Reviews() {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailure(null);

    if (body.trim().length < 12) {
      setFailure("A few more words — twelve characters minimum.");
      return;
    }

    setPending(true);
    try {
      await submitReview({ rating, name: name.trim() || "Anonymous", body: body.trim() });
      setDone(true);
      toast("Review posted");
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section relative overflow-hidden border-t border-line" aria-labelledby="reviews-heading">
      <div aria-hidden="true" className="glow -bottom-40 -right-40" />
      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-5">Word of mouth</p>
            <h2 id="reviews-heading" className="h2 max-w-[20ch]">
              Two thousand opinions, one verdict.
            </h2>
            <div className="metal-rule mt-6" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-4">
            <span className="brand text-5xl text-champagne">{SITE.rating.value.toFixed(1)}</span>
            <div>
              <Stars value={SITE.rating.value} />
              <p className="data mt-1.5 text-xs text-linen-2">
                {SITE.rating.count.toLocaleString("en-IN")} public reviews · {SITE.rating.source}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_REVIEWS.map((review) => (
            <blockquote key={review.id} className="reveal card relative flex flex-col overflow-hidden p-6">
              <span
                aria-hidden="true"
                className="brand pointer-events-none absolute -top-5 right-2 text-[7rem] leading-none text-champagne/15"
              >
                &rdquo;
              </span>
              <Stars value={review.rating} />
              <p className="serif-italic relative mt-4 flex-1 text-[1.0625rem] leading-relaxed text-linen/85">
                &ldquo;{review.body}&rdquo;
              </p>
              <footer className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-champagne">
                {review.name} · {review.hall}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="card mt-6 p-6 sm:p-8">
          {done ? (
            <div className="anim-pop">
              <p className="h3 text-champagne">Posted.</p>
              <p className="mt-2 text-linen-2">
                It went to a mock endpoint, not to PFC — there is no backend here. Thank you
                all the same.
              </p>
              <button
                type="button"
                className="btn btn-ghost mt-5"
                onClick={() => {
                  setDone(false);
                  setBody("");
                  setName("");
                  setRating(5);
                }}
              >
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-wrap items-center gap-6">
                <fieldset>
                  <legend className="eyebrow mb-3">Your rating</legend>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-pressed={rating === value}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        className={`data h-11 w-11 rounded border transition-colors ${
                          value <= rating
                            ? "border-champagne bg-champagne text-espresso"
                            : "border-line text-linen-2 hover:border-champagne/60"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="min-w-[12rem] flex-1">
                  <label htmlFor="review-name" className="eyebrow mb-3 block">
                    Name <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="review-name"
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="review-body" className="eyebrow mb-3 block">
                  What happened
                </label>
                <textarea
                  id="review-body"
                  rows={3}
                  className="field resize-y"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What you ordered, which hall, whether it arrived hot."
                  aria-invalid={Boolean(failure)}
                />
              </div>

              {failure && (
                <p className="mt-4 rounded border border-oxide/40 bg-oxide/10 p-3 text-sm text-oxide" role="alert">
                  {failure}
                </p>
              )}

              <button type="submit" className="btn btn-primary mt-6" disabled={pending}>
                {pending ? "Posting…" : "Post review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
