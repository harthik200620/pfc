# Fact sheet — PFC Kharagpur

Everything [PROMPT.md](PROMPT.md) asserts, with its source. **Established fact** unless
marked otherwise. Part D of the original document is carried across intact; the sections
after it record what was checked on 2026-08-10 and what still hasn't been.

---

## Subject

| Fact | Source |
|---|---|
| Full name: PAN Loop Fast Food Center, called PFC | MetaKGP Wiki |
| PAN Loop = circuit road joining Patel, Azad, Nehru Halls | MetaKGP Wiki |
| Shop No. Oval 3, PAN Loop, near Patel Hall, Kharagpur 721302 | Restaurant Guru, business directories |
| +91 90938 88281, +91 90468 59505 | MetaKGP Wiki |
| Hours 12:00–16:00 and 18:00–23:00 daily | MetaKGP Wiki |
| Shaded open-air eating arena | MetaKGP Wiki |
| Delivers to halls, departments, Main Building | MetaKGP Wiki |
| Delivery ₹30+ (₹10 packaging + ₹20 delivery) | MetaKGP Wiki — **conflicts** with Restaurant Guru's ~₹15. Unresolved. |
| ₹200–400 per person | Restaurant Guru |
| ~3.8/5 from ~2,224 reviews | Restaurant Guru, at time of writing |
| North Indian, Chinese, Mughlai, Continental, fast food, desserts | magicpin, Restaurant Guru |
| The twenty attested dish names | magicpin menu listing + public reviews |
| The "treat" ritual | **Informed inference** — consistent across KGP fresher guides and review language, but not documented as such anywhere. It matches how the place is described. Sanity-check it against your own experience before it becomes the site's central idea. |
| Six filler dishes (3 breads, 3 beverages) | **Not attested.** Added to populate two categories the attested twenty leave empty. Carried in the data as `unverified: true`. |

---

## Verified 2026-08-10

**Firefox scroll-driven animation support — the original claim is correct.**
Firefox 132+ ships `animation-timeline` enabled by default (it was behind
`layout.css.scroll-driven-animations.enabled` from around Firefox 111). The "Chrome/Edge
115+, Firefox 132+, Safari 18+" figure in Part A holds.

*The caveat the original missed:* MDN still lists `animation-range-start` and
`animation-range-end` as not fully supported in Firefox. So a custom `animation-range` runs
over the wrong window there rather than not running at all — which looks broken, where an
absent animation looks fine. Keep ranges near default.

**Contrast ratios against `--ink #051C15`** — computed from WCAG relative luminance:

| Token | Value | Ratio | AA body 4.5:1 | AA non-text 3:1 |
|---|---|---|---|---|
| `--jade-mist` | `#E8F2EC` | 15.6:1 | pass | pass |
| `--brass` | `#C8A24A` | 7.5:1 | pass | pass |
| `--emerald-lit` | `#17A673` | 5.7:1 | pass | pass |
| `--chilli-lit` | `#E4573B` | 4.9:1 | pass | pass |
| `--chilli` | `#C2361F` | **3.3:1** | **fail** | pass |

`--chilli-lit #E4573B` is a new token, added because `--chilli` cannot legally carry body
text at AA. Worth re-running in a checker of your choice — the whole C1 finding in
[CRITIQUE.md](CRITIQUE.md) rests on that 3.3.

**Stack versions**, from the npm registry:

| Package | Latest | Use |
|---|---|---|
| `next` | 16.3.0 | `^16.3` — the brief's "16.x" is current |
| `react` / `react-dom` | 19.2.8 | `^19.2` |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.3 | `^4.3` |
| `typescript` | 7.0.2 | **pin `^5.9`** — `latest` is now the 7.x native port |

**Image APIs** — both tested, both respond without an API key:

| Source | Endpoint | Licence | Attribution |
|---|---|---|---|
| Openverse | `api.openverse.org/v1/images/?q=…&license=cc0,pdm` | CC0 / PDM | none required |
| Wikimedia Commons | `commons.wikimedia.org/w/api.php` | mostly CC BY-SA 3.0/4.0 | required + share-alike |

Openverse returned 22 CC0 results for "chicken biryani", sourced from Wikimedia Commons and
the WordPress Photo Directory. Anonymous rate limits are 20/min burst and 200/day
sustained — ample for ~36 images. Commons returned a far deeper catalogue at CC BY-SA.

An unfiltered Openverse query (`license_type=commercial`) returned 240 results for "chilli
chicken", nearly all CC BY-SA from Flickr — usable, but only with attribution. Prefer the
CC0 filter and accept the smaller pool.

---

## Still unverified

**Every price, and the delivery fee.** No verified price list was found. The band
(₹200–400 per head) is documented; the individual numbers are not. MetaKGP says ₹30 total
(₹10 packaging + ₹20 delivery), Restaurant Guru says ~₹15. Ten minutes at the physical menu
board resolves all of it, and every number lives in one file for exactly that reason.

**The MetaKGP menu gallery** at `postimg.cc/gallery/ozpl5v9c`, last edited March 2023. If it
still resolves it is the fastest route to real prices, but it is three years old — treat the
numbers as a starting point, not truth.

**Hall bearings and ring distances.** The delivery ring places halls at "real relative
bearings" and derives ETAs from a distance table. Nothing published gives those bearings;
they have to come from a campus map or from memory, and the ETA table is a modelling choice
rather than a measurement. Fine for the interface, worth not presenting as precise.

**The treat ritual.** Repeated from Part D because it is the load-bearing one: this is the
single most important claim in the brief and the only one with no direct source.

---

## Photographs

None of the existing PFC photography is yours to use. Restaurant Guru has ~95 photos of the
storefront and interior, magicpin and Zomato both host galleries, Google Maps has
user-contributed shots — all of it belongs to the reviewers or the platform.

Dish and ambience imagery therefore comes from the CC0 sources above. The storefront cannot:
no CC-licensed photograph of the building exists, so the hero is either your own photo or an
in-repo SVG illustration. Ten minutes with a phone at 6:30pm gets you the real plate and
every gallery frame besides.
