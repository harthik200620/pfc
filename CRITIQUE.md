# Critique — PFC build prompt (Part B)

Findings against the document you pasted, ordered by severity. Each one quotes the line it
lands on, says what a model will actually do with it, and gives the repair. All repairs are
already applied in [PROMPT.md](PROMPT.md).

The prompt is good. The subject research is real, the palette is derived from a photograph
rather than picked from a mood board, and the PAN Loop ring is a genuinely original idea
that no restaurant template will have. Everything below is about the places where the
prompt argues with itself, or asserts something that isn't true.

---

## A. Contradictions that produce broken output

### A1 — Two "one memorable things"

> "This is the one memorable thing on the page. Spend your boldness here. Everything
> else — cards, buttons, forms — stays disciplined and quiet."

The next heading is **`## SECOND SIGNATURE — Treat Mode`**.

A model reading this either under-builds Treat Mode to honour "everything else stays
quiet," or over-builds both and loses the contrast the instruction was protecting.

**Repair.** Rank them by *kind* rather than by count: the ring is the **visual** signature,
Treat Mode is the **functional** signature. "Quiet" then governs everything that is neither
— which is what you meant, and is now unambiguous.

### A2 — The category rail doesn't match the dish list

The rail names ten categories:

> Biryani · Tandoor · Chinese · North Indian · Rolls & Burgers · Pasta & Pizza ·
> Rice & Noodles · Breads · Desserts · Beverages

The twenty named dishes populate eight of them. Sorted honestly:

| Category | Dishes from your list |
|---|---|
| Biryani | 2 |
| Tandoor | 1 |
| Chinese | 3 |
| North Indian | 3 |
| Rolls & Burgers | 2 |
| Pasta & Pizza | 3 |
| Rice & Noodles | 2 |
| **Breads** | **1** — and it's Chicken Keema *with* Lachha Paratha, which is a North Indian main |
| Desserts | 1 |
| **Beverages** | **0** |

Meanwhile the prompt says, in the same section:

> "Real dishes, from PFC's actual public menu and reviews — **use these**"

So the model is told to render a Beverages tab and forbidden from inventing anything to put
in it. It will resolve that by inventing dishes anyway, or by shipping a tab that opens onto
nothing.

**Repair.** Three changes: derive the rail from the data so a category with no items cannot
render; move Chicken Keema to North Indian where it belongs; and name the six filler items
explicitly in the prompt (three breads, three beverages) carrying an `unverified: true`
flag, so the model isn't inventing — it's transcribing.

### A3 — `submitReview` has nowhere to live

The mock API seam defines four endpoints:

> `submitReview(payload) → { ok }`

The page structure lists sections 1 through 10. None of them is a review. The subject
section cites *"Rated ~3.8/5 across ~2,200 public reviews"* and nothing consumes it.

Dead endpoint, and a "every button works" brief that ships an unreachable one.

**Repair.** Give it a home — a compact reviews band that shows the 3.8/2,200 figure and
takes a submission. It's four lines of page structure and it makes the fourth endpoint real.

### A4 — The payment radio is a dead control by the brief's own rule

> "No `href="#"`, no dead handlers, no `alert()`, no 'coming soon'."

Eleven lines later:

> "payment method radio (Cash / UPI — **display only**)"

**Repair.** Keep it display-only — you can't take payments without a backend — but say so
deliberately, and write the selection into the order summary and the success screen so the
control has an observable effect. A control that changes what you see is not a dead control.

### A5 — The treat ritual is named as the point, then buried

> "The cultural fact that matters most: at KGP, PFC is where **the treat** happens...
> The site should be built around that ritual, not around a generic 'Order Now' funnel."

The only place the ritual appears in the structure is Treat Mode — a toggle **inside the
cart**. You reach the cart after you have already decided to order, chosen dishes, and
picked a hall. The ritual is therefore expressed exclusively to people who no longer need
persuading, and is invisible to everyone at the top of the funnel.

"Built around" and "one toggle in the cart" are not the same instruction.

**Repair.** Three placements instead of one: the headline carries it, a short band above the
menu names it plainly, and Treat Mode completes it in the cart. Same idea, present at
entry, consideration and checkout.

---

## B. Footguns that break the build or runtime, and aren't mentioned

### B1 — `next/font/local` hard-errors on missing files

> "Self-host all three as woff2 with `font-display: swap`" / "`next/font/local` for the
> Fontshare faces."

Gambarino and Switzer sit behind Fontshare's download flow; they can't be fetched
programmatically. `next/font/local` pointed at a file that isn't there is a **build
failure**, not a fallback — which breaks this, from the same prompt:

> "`npm install && npm run dev` works with no further edits."

**Repair.** Plain `@font-face` with a real fallback stack. A missing woff2 then degrades
silently to the fallback instead of killing the build, and dropping the real files in later
needs no code change. JetBrains Mono can come from `next/font/google` because it actually is
fetchable — but that makes the build require network, so it gets the same treatment.

### B2 — Filters in the URL query string

> "all reflected in the URL query string so a filtered menu is shareable"

The obvious implementation is `useSearchParams()`, which in the App Router must sit inside a
Suspense boundary or the **production build fails at prerender**. Nothing in the prompt
warns about it, so the model hits it during `next build`, not during `next dev`.

**Repair.** Specify `history.replaceState` plus a mount-time read of `window.location.search`.
Same shareable URL, no Suspense requirement, no prerender failure.

### B3 — The live open/closed pill guarantees a hydration mismatch

> "computed from real time in Asia/Kolkata... Recompute every 30 seconds. This must be
> correct, not decorative."

Correct, and therefore server-rendered by default — where the clock is the server's, not the
visitor's, and where the value changes between render and hydrate. React logs a mismatch and
swaps the DOM.

**Repair.** Mandate a neutral first paint (hours shown, no status) and compute the live
state in `useEffect`. The pill is still correct; it just becomes correct one frame later.

### B4 — The View Transition will abort

> "Use the View Transitions API for the menu-card → dish-modal transition, with the dish
> image as the shared element."

If the card and the modal both carry `view-transition-name: dish-media` in the same frame,
the browser throws a duplicate-name error and drops the transition entirely. Because the
card stays mounted behind the modal, that is the default outcome of the naive
implementation.

**Repair.** Specify the two-step handoff — set a `pendingId` that paints the name onto the
card, let that frame commit, then flip the open state inside `startViewTransition` with
`flushSync`, at which point the card releases the name and the modal claims it.

### B5 — `animation-range` is the weak spot, not `animation-timeline`

Your Part A note reads:

> "Browser support is roughly 84–90% as of mid-2026 (Chrome/Edge 115+, Firefox 132+,
> Safari 18+)"

**The Firefox 132+ figure is correct** — I checked, and scroll-driven animations did ship
enabled by default there. But MDN still lists `animation-range-start` and
`animation-range-end` as not fully supported in Firefox, and the reveal pattern the prompt
implies (`animation-range: entry 10% cover 35%`) depends on exactly those.

So the fallback isn't "static hero in old browsers." It's "Firefox runs the animation over
the wrong range," which looks broken rather than absent.

**Repair.** Keep ranges at or near default, and treat a coarser Firefox reveal as the
expected result rather than a bug.

---

## C. Claims that are measurably wrong, or targets that can't be met

### C1 — The one colour that fails contrast is the one you don't ask anyone to check

> "4.5:1 on all body text — check `--emerald-lit` on `--ink` and `--brass` on `--ink`
> specifically."

Computed against `--ink #051C15`:

| Token | Value | Ratio | AA body (4.5:1) |
|---|---|---|---|
| `--jade-mist` | `#E8F2EC` | 15.6:1 | pass |
| `--brass` | `#C8A24A` | 7.5:1 | pass |
| `--emerald-lit` | `#17A673` | 5.7:1 | pass |
| **`--chilli`** | **`#C2361F`** | **3.3:1** | **fail** |

Both tokens singled out for checking pass comfortably. The one that fails isn't mentioned.

`--chilli` is fine where it's used as a graphical object — the non-veg square, the spice
pips — because those are held to 3:1, not 4.5:1. The risk is that a model reading "single
hot accent" reaches for it as a text colour for prices, error messages or the spice label.

**Repair.** Add `--chilli-lit #E4573B` (**4.9:1**) as the text-safe variant, and state the
rule: `--chilli` marks, `--chilli-lit` speaks.

### C2 — 8% random failure on `placeOrder` is hostile in a portfolio piece

> "resolves after 400–900ms, and fails ~8% of the time so the error paths are real and
> testable"

The intent is right — untested error paths are fiction. But applied uniformly, roughly one
person in twelve who clicks "Place order" gets an error and never reaches the success
screen. That population includes recruiters, and it is not reproducible when you try to
show someone the bug.

**Repair.** Keep every error path. Make the trigger deterministic and documented — a
reserved test phone number and an in-page dev toggle — so failure is demonstrable on demand
and absent otherwise. Better error coverage, not worse.

### C3 — "Route JS under 120KB gzipped" is probably unmeetable

Next 16 + React 19 baseline consumes most of that budget before the cart, filters, ring,
modal, lightbox and scroll-snap gallery exist. A model given an unreachable number either
thrashes against it or reports hitting it without measuring.

**Repair.** Reword to "report the real figure from the build output." You get a true number
instead of a confident one, and dropping framer-motion/GSAP — which the prompt already
does — was where the real saving was anyway.

### C4 — The map embed fights the performance budget set four lines away

> "an embedded map or a static map image"  ...  "LCP < 2.0s and CLS < 0.05"

The keyless Google Maps iframe works without an API key, but it's a third-party frame billed
against your own LCP and CLS targets.

**Repair.** Static map image plus a Directions deep link by default; the iframe loads only
on click. Same capability, off the critical path.

### C5 — The delivery fee is treated as known when your own Part D says it isn't

> "updates a mono readout with an ETA... and recalculates the delivery fee"

Part D flags the conflict — ₹30 per MetaKGP, ~₹15 per Restaurant Guru — but Part B spends
the number as though it were settled.

**Repair.** Same `PLACEHOLDER` treatment as prices, in the same file, so both get fixed in
one pass at the menu board.

---

## D. The gap — images

Part B says "dish image" once, on the menu card spec, and never returns to it. No source, no
count, no aspect ratio, no licence rule — for a build that needs roughly 26 dish cards, 3
spotlight frames, 6 gallery images and a hero.

That silence is why the imagery question came up at all, and it's the single largest
unspecified surface in the document. [PROMPT.md](PROMPT.md) adds an `IMAGES` section;
[FACTS.md](FACTS.md) records the two APIs that were tested and what they actually return.

---

## E. Prompt-craft notes on Part C

**E1 — The remaining imperatives are fine, and are a different thing.** Part C's argument
for stripping "verify your work" is sound. Note that these survivors are not that:

> "get this right, it is a legal marking in India, not a style choice"
> "This must be correct, not decorative."
> "Test the ring and the cart sheet at 360 specifically."

Those are **acceptance criteria** — they say what "done" means. Verification instructions
say "do the work twice." Keep the first kind.

**E2 — The output constraint slightly collides with the design-process instruction.**
"one paragraph... no essay" versus "say what you changed and why" plus "state it in one
line rather than asking."

**Repair.** Cap the shape explicitly: one paragraph, then a bulleted deviations list, then
code. Costs about forty words and removes the ambiguity.

---

## What I did not change

- The palette, the type pairing, and the Indian Type Foundry rationale. All sound.
- The ring as the signature. It's the best idea in the document.
- The mock API seam. Correct answer to the "every button works / no backend" tension, and
  the one-file-swap property is real.
- The banned-phrases list.
- The refusal to install framer-motion, GSAP or AOS. Right call, right reasoning.
