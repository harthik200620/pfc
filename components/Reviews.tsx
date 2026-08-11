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
            fill={i <= Math.round(value) ? "#c8a24a" : "none"}
            stroke="#c8a24a"
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
    <section className="section lume-sink pool-tr" aria-labelledby="reviews-heading">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">What people say</p>
            <h2 id="reviews-heading" className="h2 rule-under max-w-[16ch]">
              Three-point-eight, across two thousand opinions.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="data text-3xl text-brass">{SITE.rating.value.toFixed(1)}</span>
            <div>
              <Stars value={SITE.rating.value} />
              <p className="data mt-1 text-xs text-muted">
                {SITE.rating.count.toLocaleString("en-IN")} public reviews · {SITE.rating.source}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_REVIEWS.map((review) => (
            <blockquote key={review.id} className="reveal card flex flex-col p-5">
              <Stars value={review.rating} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-jade-mist/75">
                &ldquo;{review.body}&rdquo;
              </p>
              <footer className="data mt-4 text-xs text-muted">
                {review.name} · {review.hall}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="card mt-6 p-6 sm:p-8">
          {done ? (
            <div className="anim-pop">
              <p className="h3 text-emerald-lit">Posted.</p>
              <p className="mt-2 text-jade-mist/70">
                It went to a mock endpoint, not to PFC — there is no backend here. Thanks anyway.
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
              <div className="flex flex-wrap items-center gap-5">
                <fieldset>
                  <legend className="eyebrow mb-2">Your rating</legend>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-pressed={rating === value}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        className={`data h-11 w-11 rounded-full border transition-colors ${
                          value <= rating
                            ? "border-brass bg-brass/15 text-brass"
                            : "border-hairline text-muted hover:border-brass/50"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="min-w-[12rem] flex-1">
                  <label htmlFor="review-name" className="eyebrow mb-2 block">
                    Name <span className="text-muted">(optional)</span>
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

              <div className="mt-5">
                <label htmlFor="review-body" className="eyebrow mb-2 block">
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
                <p className="mt-4 rounded-lg border border-chilli-lit/40 bg-chilli/10 p-3 text-sm text-chilli-lit" role="alert">
                  {failure}
                </p>
              )}

              <button type="submit" className="btn btn-primary mt-5" disabled={pending}>
                {pending ? "Posting…" : "Post review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
