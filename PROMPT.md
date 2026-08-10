<!-- Repaired Part B. Copy this whole file. Attach your PFC storefront photo. Run at effort xhigh.
     Changes from the original are catalogued in CRITIQUE.md; verified facts in FACTS.md. -->

# BRIEF

Build the marketing and ordering website for PFC — PAN Loop Fast Food Center — a
restaurant inside the IIT Kharagpur campus. Frontend only. No backend, no database,
no auth provider. Ship a complete, running, deployable project.

Deliver what is asked, at the scope intended. Make routine design and architecture
calls yourself and state them in one line rather than asking. Check in only where two
readings of this brief would produce materially different work. If something here is
wrong or a better approach exists, say so in a sentence and continue with the task as
specified rather than quietly substituting your own version. Finish the whole thing.

## SUBJECT — read this before you design anything

PFC is not a generic restaurant. It is a campus institution, and the design has to
know that.

- Full name: PAN Loop Fast Food Center. Universally called PFC.
- "PAN Loop" is the circuit road joining Patel, Azad and Nehru Halls of Residence.
  PFC sits at its entrance. The name is an acronym of an acronym — use that.
- Address: Shop No. Oval 3, PAN Loop, inside IIT Kharagpur campus, near Patel Hall
  of Residence, Kharagpur, West Bengal 721302.
- Phone: +91 90938 88281 and +91 90468 59505.
- Hours: 12:00–16:00 and again 18:00–23:00, daily. The split shift is a real
  constraint and the site must reflect it live.
- Seating is a shaded open-air arena, not an indoor dining room.
- Delivery runs to the halls of residence and to departments and the Main Building.
- Cuisines: North Indian, Chinese, Mughlai, Continental, fast food, desserts.
- Roughly ₹200–400 per person. Rated ~3.8/5 across ~2,200 public reviews.

The cultural fact that matters most: at KGP, PFC is where **the treat** happens. A
senior gets an internship, an offer, a paper accepted, and the juniors extract a treat
at PFC. The site is built around that ritual rather than around a generic "Order Now"
funnel — and "built around" means it appears at all three stages, not once at the end:
the **headline** carries it, a short **band above the menu** names it plainly, and
**Treat Mode** in the cart completes it.

## AUDIENCE AND JOB

Audience: IIT KGP students and staff, plus visiting parents on convocation and
fest weekends. Almost all of them are on a mid-range Android phone on campus wifi
or 4G.

The page's single job: **get an order or a table booked in under 90 seconds, on a
phone, without the person having to think.**

Mobile is the primary artefact. Design mobile first and let desktop be the
adaptation, not the reverse.

## VISUAL DIRECTION — non-negotiable

Emerald green, treated as a jewel tone against near-black, with brass as the metal
and a single hot red accent carried over from PFC's real signage. The reference
photograph — the black gabled roof, the brass trim, the terracotta brick, the red
letters, the green canopy — is where all of this comes from. Every colour below is
pulled from that photo.

### Tokens

```
--ink:          #051C15   page ground, deepest forest-black
--emerald:      #0E6E4E   primary brand green, surfaces and fills
--emerald-lit:  #17A673   interactive, hover, focus rings, live indicators
--jade-mist:    #E8F2EC   light surface and body text on dark
--brass:        #C8A24A   metallic accent — rules, numerals, the luxury signal
--chilli:       #C2361F   marking only: non-veg dot, spice pips, the ♥ in I♥PFC
--chilli-lit:   #E4573B   the same accent when it has to carry text
```

`--chilli` **marks**; `--chilli-lit` **speaks**. This is a contrast requirement, not a
preference: measured against `--ink`, `--chilli` is 3.3:1 — fine for a graphical
object at the 3:1 threshold, failing for body text at 4.5:1. `--chilli-lit` is 4.9:1
and passes. Never set text in `--chilli`.

For reference, the rest of the palette against `--ink`: `--jade-mist` 15.6:1,
`--brass` 7.5:1, `--emerald-lit` 5.7:1. All pass.

Surface elevation is built from emerald at low alpha over `--ink`, never from grey.
Greys are banned. Every neutral is a desaturated emerald.

### Type

```
Display:  Gambarino          (Fontshare)
Body:     Switzer            (Fontshare)
Data:     JetBrains Mono     (Google Fonts)
```

Gambarino and Switzer are from the Indian Type Foundry. That is deliberate: an
Indian foundry for an Indian institution, and neither is the Playfair-on-cream
pairing that every restaurant template reaches for.

Load all three with plain CSS `@font-face` and `font-display: swap`, pointing at
`public/fonts/*.woff2`, each with a real fallback stack. **Do not use
`next/font/local`** — it fails the build outright when a file is absent, and these
faces sit behind Fontshare's download flow so they cannot be fetched
programmatically. With `@font-face`, a missing file degrades to the fallback and the
project still runs, which is what "works with no further edits" requires. Put the
download instructions in the README. Same treatment for JetBrains Mono: `@font-face`,
not `next/font/google`, so the build never needs the network.

The mono is load-bearing, not decoration. Every price, every hall code, every
timestamp, every quantity, every table number is set in JetBrains Mono with
tabular figures. It reads as instrumentation, which is the correct register for an
IIT campus, and it makes numbers scannable at a glance on a phone.

Type scale, fluid, `clamp()` throughout:

```
display   clamp(2.75rem, 7vw, 6.5rem)   Gambarino, 400, -0.03em
h2        clamp(2rem, 4vw, 3.5rem)      Gambarino, 400, -0.02em
h3        clamp(1.25rem, 2vw, 1.75rem)  Switzer, 600
body      1.0625rem / 1.65              Switzer, 400
small     0.875rem                      Switzer, 500
data      0.9375rem, tnum               JetBrains Mono, 500, +0.02em
eyebrow   0.75rem, uppercase, +0.18em   JetBrains Mono, 600
```

### Motion contract

Durations 120 / 200 / 320 / 620ms. Easing `cubic-bezier(0.16, 1, 0.3, 1)` for
entrances, `cubic-bezier(0.4, 0, 1, 1)` for exits.

Use native CSS scroll-driven animations (`animation-timeline: view()` and
`scroll()`) for every reveal and every parallax, wrapped in
`@supports (animation-timeline: scroll())`. Do not install framer-motion, GSAP, or
AOS. These effects belong on the compositor thread; a JS scroll listener will jank
on the mid-range Android that most of this audience is holding, and the library
costs 30–40KB you do not need to spend.

Keep `animation-range` at or very near its default. Firefox ships
`animation-timeline` enabled (132+) but still does not fully support
`animation-range-start` / `animation-range-end`, so a custom range there produces an
animation running over the wrong window — which reads as broken, where an absent
animation reads as fine. A coarser Firefox reveal is the expected result, not a bug.

Use the View Transitions API for the menu-card → dish-modal transition, with the
dish image as the shared element. **Implement it as a two-step handoff**, because the
card stays mounted behind the modal and two elements carrying the same
`view-transition-name` in one frame make the browser abort the transition:

1. On tap, set `pendingId` — this paints `view-transition-name: dish-media` onto that
   card and nothing else. Let the frame commit.
2. Then call `document.startViewTransition(() => flushSync(() => setOpenId(id)))`.
   The card's name condition goes false in the same commit as the modal's goes true,
   so exactly one element holds the name at any moment.

Reverse it on close. Progressive enhancement — no polyfill.

Every motion rule collapses to opacity-only under `prefers-reduced-motion: reduce`.
No exceptions, including the hero.

## THE SIGNATURES

There are two, and they are different kinds. The ring is the **visual** signature —
it is what people remember seeing. Treat Mode is the **functional** signature — it is
what people remember using. Spend boldness on both. "Disciplined and quiet" governs
everything that is neither.

### Visual signature — the PAN Loop Delivery Ring

The PAN Loop is literally a circular road. So the delivery section is a circular
dial, not a dropdown.

An SVG ring, roughly 520px at desktop and 320px on mobile. Halls sit as nodes around
the circumference at their real relative bearings: Patel, Azad and Nehru closest to
PFC's position on the ring; LLR, LBS, RK, RP, MMM, MS, Gokhale and the rest placed
further out with a spur line to each. PFC sits at the ring's entrance point, marked
with a small brass dot.

Tapping a hall does four things at once: sets the delivery hall for the whole cart,
animates a `stroke-dashoffset` line travelling from PFC to that node in
`--emerald-lit`, updates a mono readout with an ETA derived from ring distance
(15–35 min, deterministic from a distance table — do not randomise it), and
recalculates the delivery fee.

Full keyboard support: arrow keys walk the nodes around the ring, Enter selects,
`role="radiogroup"` with `aria-checked`, and a visually-hidden `<select>` carrying
the same options for assistive tech that can't parse the SVG.

### Functional signature — Treat Mode

A toggle in the cart. When on, the cart asks "how many heads?" and switches every
line item and the total to a per-head split in mono, with the payer's share
highlighted in `--brass`. A "share the damage" button copies a plain-text bill
breakdown to the clipboard, formatted for pasting into a hall WhatsApp group.

This exists because it is what actually happens at PFC. It is also the single
feature no restaurant template will ever have.

## PAGE STRUCTURE

**1 — Nav.** Sticky. Transparent over the hero, then transitions to a blurred
emerald glass bar past 80px — drive that from an IntersectionObserver on a 1px
sentinel, not a scroll listener. Wordmark left; Menu / Delivery / Reserve / Visit
centre; a live open-closed pill and cart button right. Mobile: full-screen overlay
menu, staggered item entrance, focus trapped, Esc closes, body scroll locked.

**2 — Hero.** Full-bleed PFC storefront photograph, fixed behind, parallaxing at
14% of scroll. Layer order: photo → gradient scrim → grain → emerald light-leak →
content. Content is an eyebrow ("PAN Loop · IIT Kharagpur · Since the loop had a
name"), the display headline, one sub-line, two CTAs (primary "Order for your hall",
ghost "See the menu"), and the live open/closed pill.

The pill is computed from real time in Asia/Kolkata against the 12–16 / 18–23
windows. Open → pulsing `--emerald-lit` dot and "Open · closes 4:00 PM". Closed →
`--brass` dot and "Closed · opens 6:00 PM". Recompute every 30 seconds.

**Render a neutral first paint** — the two service windows, no live status — and
compute the live state in `useEffect` after mount. Server time is not the visitor's
time, and a value that changes between render and hydrate is a hydration mismatch.
The pill is still correct; it becomes correct one frame later.

Headline: write it yourself. It must not be "Delicious Food Delivered Fast" or any
neighbour of that. Ground it in the loop, the treat, or the split shift — and given
that the treat is the ritual this whole site is built on, the headline is the first
of its three placements.

**3 — Ticker.** A single-line marquee in mono, hall names and the dishes each hall
orders most, scrolling slowly. Pauses on hover and under reduced-motion. It is the
one place the campus vernacular gets to speak in its own voice.

**4 — The treat band.** Short. Three or four lines and a single CTA that opens the
cart with Treat Mode already on. This is the second of the ritual's three placements
and it sits above the menu deliberately: the person who came to browse dishes should
meet the idea before they meet the prices, not after they have already committed at
checkout.

**5 — The menu.** The core of the site.

- Sticky category rail — **derived from the data, not hard-coded**. A category with
  no dishes must not be able to render. Order the rail: Biryani · Tandoor · Chinese ·
  North Indian · Rolls & Burgers · Pasta & Pizza · Rice & Noodles · Breads ·
  Desserts · Beverages
- Filters, all combinable, all reflected in the URL query string so a filtered
  menu is shareable: veg-only, spice level (1–3 chillies), price band, "under
  15 min". **Sync the URL with `history.replaceState` and read
  `window.location.search` once on mount.** Do not use `useSearchParams` — in the App
  Router it requires a Suspense boundary and fails the production build at prerender
  without one. Same shareable URL, no prerender failure.
- Debounced fuzzy search across dish name and description
- Cards: dish image, name, one line of description, spice pips, veg/non-veg dot
  in the correct Indian convention (green square with green dot / `--chilli` square
  with `--chilli` dot — get this right, it is a legal marking in India, not a
  style choice), price in mono, quantity stepper
- Tapping a card opens a dish modal via View Transition: larger image,
  description, allergens, a portion note, quantity, add-to-cart, and the image credit
- Empty filter state names what to change, not "No results found"

Real dishes, from PFC's actual public menu and reviews. These twenty are attested:

Chicken Mughlai Biryani, Tandoor Chicken Biryani, Chilli Chicken, Chicken Butter
Masala, Chicken Kolhapuri, Chicken Rashmi Masala, Chicken Tikka Kebab Roll, Crunchy
Chicken Burger, Boneless Garlic Chicken (6 pc), Chicken Lollipop (6 pc), Chicken
Keema with Lachha Paratha, Chicken Tikka Pizza, Chicken Mixed Sauce Pasta, Veg Pesto
Pasta, Honey Chilli Potato, Cheese Corn Nugget, Dal Khichdi with Veggies, Paneer
Lamba, Triple Rice, Brownie with Ice Cream.

Those twenty leave **Beverages empty and Breads holding only Chicken Keema with
Lachha Paratha, which is a North Indian main, not a bread.** So: file Chicken Keema
under North Indian, and add exactly these six, each carrying `unverified: true` in
the data so they are visibly distinguishable from the attested list —

- Breads: Butter Naan, Lachha Paratha, Tandoori Roti
- Beverages: Masala Chai, Cold Coffee, Fresh Lime Soda

Twenty-six dishes, every category populated, nothing invented beyond those six. Do
not add a twenty-seventh. Desserts legitimately holds one item; a category with one
dish is honest, a category with none is broken.

ALL PRICES ARE PLACEHOLDERS, and so is the delivery fee — the two public sources
disagree (₹30 per MetaKGP, ~₹15 per Restaurant Guru). Put every price, the packaging
fee and the per-hall delivery fee in `data/menu.ts` with a
`// PLACEHOLDER — verify against the physical menu board` comment at the top of the
file. Do not scatter them through components. Keep them plausible for the ₹200–400
per head band.

**6 — Signature dish spotlight.** Three dishes with the strongest public reputation
— Chicken Biryani, Chilli Chicken, Chicken Butter Masala — in a horizontal
scroll-snap gallery with a scroll-driven progress rule in `--brass`. Larger imagery,
a sentence of real description each.

**7 — The PAN Loop Delivery Ring.** As specified above.

**8 — Reserve a table.** Date, time (constrained to the two service windows — the
picker must not offer 5 PM), party size, name, phone (Indian format validated),
optional note. Inline validation on blur, never on keystroke. Submits through the
mock API with a loading state and a success screen showing a mono booking reference.
Persists to storage so a reload doesn't lose it.

**9 — What people say.** A compact band: the aggregate figure (~3.8/5 from ~2,200
public reviews, cited as public data rather than presented as the site's own), three
or four short quotes, and a form — rating, name, one paragraph — that submits through
`submitReview`. This section exists so that endpoint is reachable; without it the
mock API ships a function no button can call, which the "every button works" rule
below forbids.

**10 — Gallery.** Masonry, lightbox on click, keyboard arrows, Esc to close, focus
returned to the trigger, image credit visible in the lightbox. Lazy-loaded below the
fold.

**11 — Visit.** Address, both phone numbers as `tel:` links, the split-shift hours
with today's row highlighted, and a "Directions" link that deep-links to Google Maps.

Use a **static map image plus the deep link** by default. If you want the interactive
embed, load the iframe only after a click on the static image — a third-party frame
on first paint is charged against the LCP and CLS budgets set below, and the map is
not what anyone came for. Plus a plain note about delivery to halls and departments.

**12 — Footer.** Wordmark, nav repeat, hours, phone, a newsletter field wired to the
mock API, a link to the image credits page, and an honest line stating this is a
student-built site and not officially affiliated with PFC.

## IMAGES

The build needs roughly 26 dish images, 3 spotlight frames, 6 gallery images and a
hero. Source them as follows.

**Licence rule, and it is a hard rule.** Photos on Zomato, magicpin, Google Maps and
Restaurant Guru belong to the reviewers or the platform. Do not use them. Use only
images whose licence actually grants the right, and record the grant.

**Primary source — Openverse**, CC0 and public-domain only, no API key, no
attribution owed:

```
https://api.openverse.org/v1/images/?q=<dish>&license=cc0,pdm&page_size=10
```

Anonymous rate limit is 20/min and 200/day, which is ample. Results are drawn largely
from Wikimedia Commons and the WordPress Photo Directory.

**Fallback — Wikimedia Commons**, only where CC0 returns nothing usable. Deeper
catalogue, but mostly CC BY-SA 3.0/4.0, so attribution and share-alike apply:

```
https://commons.wikimedia.org/w/api.php?action=query&generator=search
  &gsrsearch=<dish>&gsrnamespace=6&gsrlimit=6
  &prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json&formatversion=2
```

**Every image record carries `sourceUrl`, `license`, `licenseUrl` and `creator` in
`data/`.** Provenance ships with the data, not in someone's memory. Generate
`CREDITS.md` and a `/credits` route from those records, and show the credit line in
the dish modal and the gallery lightbox wherever the licence requires attribution.

**Pipeline.** Write `scripts/fetch-images.mjs` — re-runnable, idempotent, reads the
dish list, queries Openverse first and Commons second, downloads to
`public/images/`, emits AVIF + WebP at 1920/1280/828/640, generates a 20px base64
LQIP per image, and writes provenance into `data/images.generated.ts`. Gitignore the
downloaded originals. Aspect ratios: 4:3 dish cards, 3:2 spotlight, native gallery,
21:9 hero desktop and 4:5 hero mobile as separate crops.

**The hero is the exception.** No CC-licensed photograph of the PFC storefront
exists, so it comes from one of two places: the attached photo, or — if none is
attached — an SVG storefront illustration you author in-repo from the description in
the brief (asymmetric black gable, brass trim, white medallion, red PFC letters,
terracotta brick wall, planters, tree canopy, blue-hour emerald grade). Build the
swap as a single constant so replacing it later is a one-line change.

Treat the hero plate per the treatment table: duotone `#051C15` → `#17A673`
composited at 78%, gradient scrim `#051C15` at 92% bottom → 30% at 55% height → 55%
at top, 18% corner vignette, AVIF primary with WebP fallback, quality 62.

## FUNCTIONAL REQUIREMENTS — "every button works"

Every interactive element must do its real job. No `href="#"`, no dead handlers, no
`alert()`, no "coming soon".

- Cart: add, remove, change quantity, live subtotal, delivery fee derived from the
  selected hall, packaging fee, grand total. Persists across reload. Slide-over
  panel on desktop, bottom sheet on mobile.
- Checkout: name, phone, hall (pre-filled from the ring), room number, payment
  method radio, order notes. Full validation. Submits through the mock API. Success
  screen with a mono order ID and the ETA from the ring.
- The payment radio is **display-only and that is deliberate** — you cannot take
  payments without a backend. It is not a dead control, because the selection is
  written into the order summary and carried onto the success screen ("Pay ₹340 cash
  on delivery"). A control whose choice changes what you see is doing its job.
- Every filter, every search, every tab, every modal, every stepper: functional.
- Nav links smooth-scroll to real sections with correct focus management.

### The mock API seam

Put every would-be network call in `lib/api.ts`. Each function returns a typed
promise and resolves after 400–900ms:

```
placeOrder(payload)      → { orderId, etaMinutes }
reserveTable(payload)    → { bookingRef, confirmedAt }
subscribe(email)         → { ok }
submitReview(payload)    → { ok }
```

Every caller handles loading, success, and failure with a visible state.

**Make failure deterministic, not random.** Untested error paths are fiction, so
build all of them — but a uniform 8% failure rate means roughly one person in twelve
who clicks "Place order" gets an error and never reaches the success screen,
including whoever you are showing this to, and the failure cannot be reproduced on
demand when you want to demonstrate it. Instead: a reserved test phone number
(`+91 00000 00000`) and a small dev-only toggle that forces the next call to fail.
Document both in the README. Better error coverage, not worse.

The point of this seam is that swapping in `fetch()` later touches exactly one file.

### Storage

`localStorage`, wrapped in a try/catch-guarded module so Safari private mode doesn't
throw, and versioned with a schema key so a future shape change doesn't crash on
stale data. Keep the module interface narrow enough that swapping to root React state
is a one-file change.

## STACK

Next.js 16.3 (App Router) · TypeScript strict, pinned to `^5.9` — do not take
TypeScript `latest`, which is now the 7.x native port · Tailwind CSS v4.3 with tokens
declared through `@theme` in CSS, not a JS config file · React 19.2 · React Server
Components by default, `"use client"` only where interactivity actually requires it ·
`next/image` with AVIF and WebP.

No animation library. No component library. No state library — React context plus
`useReducer` is sufficient for a cart of this size and costs zero bundle.

## QUALITY FLOOR

**Performance.** LCP < 2.0s and CLS < 0.05 on a simulated 4G Moto G. Hero image
priority-loaded with an LQIP. Everything below the fold lazy. For route JS, **report
the actual gzipped figure from the build output** rather than asserting a budget —
Next 16 and React 19 consume most of a 120KB budget before this site's own code
exists, and a measured number is worth more than a claimed one.

**Accessibility.** WCAG 2.2 AA. 4.5:1 on all body text — the palette table above
gives you the measured ratios, and `--chilli` is the one that fails, so it never
carries text. Visible focus rings, 2px `--emerald-lit` at 2px offset, on every
focusable element. Full keyboard operation including the ring and the lightbox.
Correct landmarks and heading order. `aria-live` on cart total and filter result
count. 44×44px minimum touch targets.

**Responsive.** 360 / 390 / 768 / 1024 / 1440 / 1920. Test the ring and the cart
sheet at 360 specifically — they are the two things that break.

**SEO.** Metadata per route, OG and Twitter cards, JSON-LD Restaurant schema with
the real address, phone, hours, priceRange and servesCuisine.

**Code.** Strict types, no `any`. All content in `data/`, none hard-coded in
components. Comment only non-obvious decisions.

## COPY

Write it yourself. Sentence case. Active voice. A button that says "Add to cart"
produces a toast that says "Added". Errors say what went wrong and what to do about
it, in the interface's voice — they do not apologise and they are never vague. Empty
states are invitations to act, not statements of absence.

Ban outright: "Experience the finest", "culinary journey", "tantalise", "a symphony
of flavours", "we pride ourselves", "nestled in the heart of". If a line could sit on
any restaurant's website, it is wrong for this one.

## DESIGN PROCESS

Before writing any code, work out a compact plan in your head: the palette above, the
type roles above, an ASCII wireframe for the hero and for the menu grid, and the ring
geometry.

Then review that plan against this brief. If any part of it is what you would produce
for any restaurant rather than for this one, change it.

Build it end to end, then look at it once more and remove one thing that isn't
earning its place.

## OUTPUT

A complete, running Next.js project. Every file written. `npm install && npm run dev`
works with no further edits.

Open with **one paragraph** on the design direction, then a **bulleted list of
deviations** — anything you changed from this brief, and why, one line each — then
the code. Nothing else. No essay.
