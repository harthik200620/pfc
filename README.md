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

**The hero is the exception.** No CC-licensed photograph of the PFC storefront exists.
The hero uses the exterior photo from Restaurant Guru's public listing — fetched by a
*pinned* job in the same script, recorded with `attributionRequired: true`, and credited
visibly under the photo and on `/credits`. It is **not** openly licensed; the trade-off was
made deliberately, and swapping in your own photo is one constant
(`HERO_IMAGE_ID` in [`components/Hero.tsx`](components/Hero.tsx)) plus one record. The
drawn storefront (`public/images/hero-storefront.svg`) remains as the committed fallback if
the pinned fetch ever fails.

## Fonts

Three voices, all Google Fonts (SIL OFL), fetched by `npm run fonts`, per the
[Gilded Survey philosophy](design/gilded-survey.md):

- **Italiana** — engraved hairline capitals: the wordmark, display sizes, headings.
- **Crimson Pro** — the reading voice: body serif, review quotes, and **every price**
  (`.price` — money in the UI sans reads cheap; serif numerals read like a menu).
- **Instrument Sans** — the instrument labels: buttons, eyebrows, data (tabular figures).

All declared with plain `@font-face` and real fallback stacks — **not** `next/font/local`,
which fails the build outright when a file is missing. Delete `public/fonts/` and the site
still runs.

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

**The design follows the Gilded Survey philosophy** ([manifesto](design/gilded-survey.md),
[Plate I](design/gilded-survey.png)): layered espresso grounds that are never one flat
hex — the body carries a fixed champagne-breath radial over a tonal vertical wash —
champagne metal (`#D3B778`, ~9:1 on espresso) applied thin, linen text, hairline rules,
and a centred, formal hero with the foil wordmark written on the storefront photograph.
Errors use `--oxide #E4573B`, the only non-metal accent.

**The 3D is CSS, not WebGL.** Pointer-tracked perspective tilt with a specular highlight
and layered shadows on dish/spotlight cards ([`components/ui/Tilt.tsx`](components/ui/Tilt.tsx)),
a scroll-driven "stand up off the counter" entrance on the delivery dial, and an extruded
text-shadow wordmark. WebGL was rejected: 150KB+ of runtime, no free photorealistic
Indian-food models, and it janks the mid-range Androids this audience holds. All of it is
gated behind `(hover: hover)` and `prefers-reduced-motion`.

**Motion is native CSS scroll-driven animation**, not a library — it runs on the compositor,
which is what keeps it smooth on the mid-range Android most of this audience is holding.
The ring's 3D entrance is guarded on `@supports (animation-range: entry)` specifically:
Firefox ships `animation-timeline` (132+) but not full `animation-range`, and a custom
range there animates over the wrong window — so Firefox gets a flat ring, which reads as
fine where a wrong-windowed tilt reads as broken.

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

**The veg/non-veg mark keeps its legal colours.** It is a marking under India's food
labelling regulations, not a style choice — the green square survives the single-accent
palette on purpose.

**The hall `<select>` is visible below 640px.** The ring scales to 328px there and its nodes
fall to ~33px, under the 44px touch target. Above 640px the dial is the full-size control and
the select collapses to screen-reader-only.

### Measured, not claimed

Route JS for `/` is **~165 KB gzipped** across 6 chunks. The original brief asked for under
120 KB; Next 16 and React 19 consume most of that before this site's own code exists, so the
number is reported rather than asserted. The redesign added no dependencies — the 3D, the
type system and the palette are CSS.

---

Student-built. Not officially affiliated with PFC or with IIT Kharagpur.
