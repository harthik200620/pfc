# PFC — PAN Loop Fast Food Center

Marketing and ordering site for PFC, the campus restaurant at Oval 3 on the PAN Loop
inside IIT Kharagpur. Frontend only — no backend, no database, no auth.

```bash
npm install
npm run dev
```

That is the whole setup. Fonts and photographs are already committed or fetchable; the
site runs without either.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run images` | Refetch dish and gallery photography (`-- --force` to redo all) |
| `npm run fonts` | Fetch the three webfaces into `public/fonts/` |

Built from [PROMPT.md](PROMPT.md), which is a repaired version of the original brief.
[CRITIQUE.md](CRITIQUE.md) explains what was repaired and why. [FACTS.md](FACTS.md) records
which claims about PFC are sourced and which are not.

---

## Everything here is a placeholder except the facts in FACTS.md

**Prices, the delivery fee and the packaging fee are invented.** No verified price list for
PFC exists publicly. They all live in [`data/menu.ts`](data/menu.ts) behind a `PLACEHOLDER`
header — ten minutes at the counter replaces the lot without touching a component. The two
public sources even disagree on delivery: MetaKGP says ₹30, Restaurant Guru says ~₹15.

**Six of the twenty-six dishes are not attested.** Three breads and three beverages, added
because the twenty documented dishes leave those categories empty and a category that
renders with nothing in it is broken. They carry `unverified: true` and are marked in the UI.

**Hall bearings and ETAs are modelled, not measured.** The ring places halls at approximate
relative bearings and derives ETAs from a distance table. Deterministic, but not survey data.

**Nothing places a real order.** Every network call is mocked in [`lib/api.ts`](lib/api.ts).

---

## Images

Photographs come from sources that actually grant the right to use them, fetched by
[`scripts/fetch-images.mjs`](scripts/fetch-images.mjs):

1. **Openverse**, filtered to `license=cc0,pdm` — public domain, no attribution owed.
2. **Wikimedia Commons** as fallback — deeper catalogue, mostly CC BY-SA, so attribution
   and share-alike apply.

Nothing is taken from Zomato, magicpin, Google Maps or Restaurant Guru; those photographs
belong to the reviewers who took them or to the platform.

Provenance ships with the data. Every record in `data/images.generated.ts` carries
`sourceUrl`, `license`, `licenseUrl` and `creator`, and [CREDITS.md](CREDITS.md) plus the
`/credits` route are generated from it. Where a licence requires a credit, it also renders
in the dish modal and the gallery lightbox.

Downloaded originals are gitignored — run `npm run images` to recreate them. A dish with no
image falls back to a drawn plate in the same palette, not a grey box.

**The hero is the exception.** No CC-licensed photograph of the PFC storefront exists, so
`public/images/hero-storefront.svg` is drawn in-repo from the building's description. To use
a real photo, drop it in `public/images/` and change one line at the top of
[`components/Hero.tsx`](components/Hero.tsx):

```ts
const HERO_PLATE = "/images/hero-storefront.svg";
```

## Fonts

`npm run fonts` pulls all three into `public/fonts/`: JetBrains Mono from Google Fonts
(SIL OFL), Switzer and Gambarino from Fontshare's public CSS API (ITF Free Font License).
They are declared with plain `@font-face` and a real fallback stack — **not**
`next/font/local`, which fails the build outright when a file is missing. Delete
`public/fonts/` and the site still runs, on the system stack.

## Testing the error paths

Failure is **deterministic, not random**. A uniform failure rate means roughly one visitor
in twelve who clicks "Place order" gets an error and never sees the success screen, and it
cannot be reproduced on demand. Instead:

- Order or reserve with the phone number **`+91 00000 00000`**.
- Or use *Make the next call fail* in the checkout panel.

Both are in `lib/api.ts` and are the only ways a call fails.

---

## Architecture

```
app/
  layout.tsx          Providers, metadata, JSON-LD Restaurant schema
  page.tsx            Section order — the only place the page shape is expressed
  credits/page.tsx    Generated from image provenance
  globals.css         Tokens via @theme, motion contract, @font-face
components/
  providers/          Cart (context + useReducer) and toasts. No state library.
  menu/               Rail, filters, cards, dish modal
  cart/CartPanel.tsx  Cart, Treat Mode, checkout, success
  DeliveryRing.tsx    The PAN Loop dial
data/                 All content. Nothing is hard-coded in a component.
lib/                  api (mock seam), storage, hours, delivery geometry, format, search
scripts/              Image and font fetchers
```

Next 16.3 App Router, React 19.2, TypeScript strict, Tailwind v4.3 with tokens declared
through `@theme` in CSS. No animation library, no component library, no state library.

### Decisions worth knowing

**Motion is native CSS scroll-driven animation**, not a library — it runs on the compositor,
which is what keeps it smooth on the mid-range Android most of this audience is holding.
`animation-range` is left at its default: Firefox ships `animation-timeline` (132+) but not
full `animation-range` support, and a custom range there animates over the wrong window,
which reads as broken where an absent animation reads as fine.

**Filters sync to the URL with `history.replaceState`**, not `useSearchParams` — the latter
needs a Suspense boundary or the production build fails at prerender. Same shareable link.

**Anything time-dependent paints neutral first**, then computes in an effect. The open/closed
pill and the "today" row in Visit both read Asia/Kolkata, which is not the server's clock.

**The dish modal's View Transition is a two-step handoff.** The card paints
`view-transition-name: dish-media` first; the modal claims it one commit later. If both held
it in the same frame the browser would abort the transition. A 250ms watchdog applies the
state change regardless, so a tab that isn't producing frames can't strand the modal.

**Ring coordinates are rounded to 2dp.** `Math.cos`/`Math.sin` aren't required to be
correctly rounded and Node and Chrome differ in the last ULP — which surfaces as a hydration
mismatch on every SVG coordinate.

**`--chilli` marks, `--chilli-lit` speaks.** Against `--ink`, `#C2361F` measures 3.3:1 —
fine for the veg/non-veg square and spice pips at the 3:1 graphical threshold, failing for
text at 4.5:1. `#E4573B` is 4.9:1 and carries any chilli-coloured text.

**The hall `<select>` is visible below 640px.** The ring scales to 328px there and its nodes
fall to ~33px, under the 44px touch target. Above 640px the dial is the full-size control and
the select collapses to screen-reader-only.

### Measured, not claimed

Route JS for `/` is **165 KB gzipped** across 6 chunks (537 KB raw). The brief asked for
under 120 KB; Next 16 and React 19 consume most of that before this site's own code exists,
so the number is reported rather than asserted. Dropping framer-motion/GSAP — which this
build never installs — was where the real saving was.

---

Student-built. Not officially affiliated with PFC or with IIT Kharagpur.
