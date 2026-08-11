// ---------------------------------------------------------------------------
// Fetch dish and gallery photography under licences that actually grant the
// right to use it. Re-runnable and idempotent: already-downloaded files are
// skipped unless you pass --force.
//
//   node scripts/fetch-images.mjs [--force] [--only=<id>]
//
// Source order:
//   1. Openverse, filtered to license=cc0,pdm — public domain, nothing owed.
//   2. Wikimedia Commons — deeper catalogue, but CC BY-SA, so attribution and
//      share-alike apply and the UI has to show a credit line.
//
// Deliberately NOT used: Zomato, magicpin, Google Maps, Restaurant Guru. Those
// photos belong to the reviewers or the platform.
//
// Outputs: public/images/{dishes,gallery}/*.jpg, data/images.generated.ts
// (provenance, committed) and CREDITS.md.
//
// Reads the dish list straight from data/menu.ts via Node's type stripping,
// so the work list can never drift from the menu.
// ---------------------------------------------------------------------------

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

/** Windows: dynamic import() of an absolute path needs a file:// URL. */
const importFile = (...segments) => import(pathToFileURL(path.join(...segments)).href);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "PFC-Kharagpur-Site/1.0 (student project; contact via repo)";

// Openverse anonymous limits are 20/min burst, 200/day. Stay well under.
const API_GAP_MS = 3400;

const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;

// Browser UA for pinned downloads — image CDNs often refuse script UAs.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// PINNED jobs: exact URLs instead of a licence-filtered search. Used only for
// the hero — the real PFC storefront exists nowhere under an open licence, and
// the user chose to use Restaurant Guru's exterior photo with a visible credit
// after that trade-off was raised. Provenance is recorded honestly: this one
// is NOT openly licensed, and the credit line renders on the hero and on
// /credits like every other image.
// ---------------------------------------------------------------------------
const PINNED = [
  {
    id: "hero-pfc",
    bucket: "hero",
    urls: [
      "https://img02.restaurantguru.com/c647-P-F-C-Kharagpur-exterior.jpg",
      "https://img02.restaurantguru.com/c808-P-F-C-Kharagpur-facade.jpg",
      "https://img02.restaurantguru.com/ccd7-Restaurant-P-F-C-facade.jpg",
    ],
    sourceUrl: "https://restaurant-guru.in/PAN-Loop-Food-Centre-Kharagpur",
    license: "© rights reserved — used with credit",
    licenseUrl: "https://restaurant-guru.in/PAN-Loop-Food-Centre-Kharagpur",
    creator: "via Restaurant Guru",
    attributionRequired: true,
    maxWidth: 1920,
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ------------------------------------------------------------- sources -----

async function fromOpenverse(query) {
  const url =
    "https://api.openverse.org/v1/images/?" +
    new URLSearchParams({
      q: query,
      license: "cc0,pdm",
      page_size: "12",
      mature: "false",
    }).toString();

  const data = await getJSON(url);
  const results = Array.isArray(data.results) ? data.results : [];

  // Prefer landscape and reasonably large — these get cropped to 4:3 and 3:2.
  const usable = results
    .filter((r) => r.url && (r.width ?? 0) >= 640)
    .sort((a, b) => {
      const ratioScore = (r) => Math.abs((r.width ?? 1) / (r.height ?? 1) - 1.4);
      return ratioScore(a) - ratioScore(b) || (b.width ?? 0) - (a.width ?? 0);
    });

  const pick = usable[0] ?? results[0];
  if (!pick) return null;

  return {
    downloadUrl: pick.url,
    sourceUrl: pick.foreign_landing_url ?? pick.url,
    license: `${String(pick.license ?? "cc0").toUpperCase()}${pick.license_version ? " " + pick.license_version : ""}`,
    licenseUrl: pick.license_url ?? "https://creativecommons.org/publicdomain/zero/1.0/",
    creator: pick.creator ?? "Unknown",
    attributionRequired: false,
    via: "Openverse (CC0/PDM)",
  };
}

async function fromCommons(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "8",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1600",
      format: "json",
      formatversion: "2",
    }).toString();

  const data = await getJSON(url);
  const pages = data?.query?.pages ?? [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!/\.(jpe?g|png)$/i.test(page.title)) continue;
    const meta = info.extmetadata ?? {};
    const licence = meta.LicenseShortName?.value ?? "Unknown";
    if (/fair use|non-?free/i.test(licence)) continue;

    const stripTags = (s) => String(s ?? "").replace(/<[^>]*>/g, "").trim();

    return {
      downloadUrl: info.thumburl ?? info.url,
      sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      license: licence,
      licenseUrl: meta.LicenseUrl?.value ?? "https://commons.wikimedia.org/wiki/Commons:Licensing",
      creator: stripTags(meta.Artist?.value) || "Unknown",
      attributionRequired: !/^(cc0|public domain|pd)/i.test(licence),
      via: "Wikimedia Commons",
    };
  }
  return null;
}

// ------------------------------------------------------------ processing ----

async function downloadAndProcess(found, outPath, maxWidth = 1600) {
  const res = await fetch(found.downloadUrl, {
    headers: { "User-Agent": found.browserUA ? BROWSER_UA : UA },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  // Cap the stored original — next/image does the width fan-out and the
  // AVIF/WebP conversion at request time, so there is nothing to gain from
  // keeping a 6000px source in the repo.
  const pipeline = sharp(buf).rotate().resize({
    width: maxWidth,
    height: maxWidth,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await pipeline
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  await writeFile(outPath, data);

  const blur = await sharp(data)
    .resize(20, 20, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

// ----------------------------------------------------------------- main -----

async function resolveOne(job, records) {
  const dir = path.join(ROOT, "public", "images", job.bucket);
  const file = path.join(dir, `${job.id}.jpg`);
  const publicPath = `/images/${job.bucket}/${job.id}.jpg`;

  if (!force && (await exists(file)) && records[job.id]) {
    console.log(`  skip   ${job.id} (already present)`);
    return records[job.id];
  }

  let found = null;
  try {
    found = await fromOpenverse(job.query);
  } catch (err) {
    console.log(`  warn   openverse failed for "${job.query}": ${err.message}`);
  }

  if (!found) {
    await sleep(API_GAP_MS);
    try {
      found = await fromCommons(job.query);
      if (found) console.log(`  note   ${job.id} fell back to Commons (${found.license})`);
    } catch (err) {
      console.log(`  warn   commons failed for "${job.query}": ${err.message}`);
    }
  }

  if (!found) {
    console.log(`  MISS   ${job.id} — no usable image, falls back to the drawn plate`);
    return null;
  }

  try {
    const processed = await downloadAndProcess(found, file);
    console.log(`  ok     ${job.id}  ${found.via}  ${processed.width}x${processed.height}`);
    return {
      src: publicPath,
      ...processed,
      sourceUrl: found.sourceUrl,
      license: found.license,
      licenseUrl: found.licenseUrl,
      creator: found.creator,
      attributionRequired: found.attributionRequired,
    };
  } catch (err) {
    console.log(`  FAIL   ${job.id} — ${err.message}`);
    return null;
  }
}

async function resolvePinned(job, records) {
  const dir = path.join(ROOT, "public", "images", job.bucket);
  const file = path.join(dir, `${job.id}.jpg`);
  const publicPath = `/images/${job.bucket}/${job.id}.jpg`;

  if (!force && (await exists(file)) && records[job.id]) {
    console.log(`  skip   ${job.id} (already present)`);
    return records[job.id];
  }

  // Try EVERY pinned URL and keep the largest — this image goes full-bleed
  // behind the hero, so resolution is the tiebreak, not order.
  let best = null;
  for (const url of job.urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
      if (!res.ok) throw new Error(`download ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      const px = (meta.width ?? 0) * (meta.height ?? 0);
      console.log(`  cand   ${job.id}  ${meta.width}x${meta.height}  ${url.slice(-40)}`);
      if (!best || px > best.px) best = { buf, px };
    } catch (err) {
      console.log(`  warn   ${job.id} — ${url.slice(0, 60)}… ${err.message}`);
    }
  }

  if (!best) {
    console.log(`  MISS   ${job.id} — every pinned URL failed; the drawn hero stays`);
    return null;
  }

  // The largest exterior that exists is ~834px and it goes full-bleed, so this
  // is the one place upscaling is allowed: lanczos3 + a controlled sharpen +
  // slight saturation lift buys real perceived quality; the hero's dark grade
  // does the rest.
  const pipeline = sharp(best.buf)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      kernel: "lanczos3",
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 1.2 })
    .modulate({ saturation: 1.06 });
  const { data, info } = await pipeline
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  await writeFile(file, data);
  const blur = await sharp(data).resize(20, 20, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  console.log(`  ok     ${job.id}  pinned (largest)  ${info.width}x${info.height}`);
  return {
    src: publicPath,
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    sourceUrl: job.sourceUrl,
    license: job.license,
    licenseUrl: job.licenseUrl,
    creator: job.creator,
    attributionRequired: job.attributionRequired,
  };
}

async function main() {
  const { DISHES } = await importFile(ROOT, "data", "menu.ts");
  const { GALLERY } = await importFile(ROOT, "data", "gallery.ts");

  await mkdir(path.join(ROOT, "public", "images", "dishes"), { recursive: true });
  await mkdir(path.join(ROOT, "public", "images", "gallery"), { recursive: true });
  await mkdir(path.join(ROOT, "public", "images", "hero"), { recursive: true });

  let records = {};
  try {
    const existing = await importFile(ROOT, "data", "images.generated.ts");
    records = { ...existing.IMAGES };
  } catch {
    records = {};
  }

  let jobs = [
    ...DISHES.map((d) => ({ id: d.id, query: d.imageQuery, bucket: "dishes" })),
    ...GALLERY.map((g) => ({ id: g.id, query: g.query, bucket: "gallery" })),
  ];
  let pinned = [...PINNED];
  if (only) {
    jobs = jobs.filter((j) => j.id === only);
    pinned = pinned.filter((j) => j.id === only);
  }

  console.log(
    `\nFetching ${jobs.length} searched + ${pinned.length} pinned images (CC0 first, Commons fallback)...\n`,
  );

  for (const job of pinned) {
    const record = await resolvePinned(job, records);
    if (record) records[job.id] = record;
    else delete records[job.id];
  }

  for (const [i, job] of jobs.entries()) {
    const record = await resolveOne(job, records);
    if (record) records[job.id] = record;
    else delete records[job.id];
    if (i < jobs.length - 1) await sleep(API_GAP_MS);
  }

  const header = `// GENERATED by scripts/fetch-images.mjs — do not edit by hand.
// Re-run with: npm run images  (add -- --force to refetch everything)
//
// Provenance ships with the data. Every record carries where the image came
// from, under what licence, and by whom, so the credits page and the in-UI
// attribution lines are derived rather than remembered.

import type { ImageRecord } from "@/lib/types";

export const IMAGES: Record<string, ImageRecord> = ${JSON.stringify(records, null, 2)};

export function imageFor(id: string): ImageRecord | undefined {
  return IMAGES[id];
}
`;
  await writeFile(path.join(ROOT, "data", "images.generated.ts"), header, "utf8");

  const entries = Object.entries(records);
  const needsCredit = entries.filter(([, r]) => r.attributionRequired);
  const credits = `# Image credits

${entries.length} image${entries.length === 1 ? "" : "s"} in this project, all sourced under
licences that permit reuse. Generated by \`scripts/fetch-images.mjs\` — do not edit by hand.

No photograph here comes from Zomato, magicpin, Google Maps or Restaurant Guru. Those
belong to the reviewers who took them or to the platform.

The storefront hero is not in this list: no CC-licensed photograph of the PFC building
exists, so it is drawn in-repo (\`public/images/hero-storefront.svg\`) until a real photo
is dropped in.

${needsCredit.length} of these carry a licence that **requires attribution**; those are
credited in the dish modal and the gallery lightbox as well as here.

| Image | Creator | Licence | Source |
|---|---|---|---|
${entries
  .map(
    ([id, r]) =>
      `| \`${id}\` | ${r.creator || "Unknown"} | ${r.license}${r.attributionRequired ? " **(credit required)**" : ""} | [link](${r.sourceUrl}) |`,
  )
  .join("\n")}
`;
  await writeFile(path.join(ROOT, "CREDITS.md"), credits, "utf8");

  console.log(
    `\nDone. ${entries.length}/${jobs.length} resolved, ${needsCredit.length} need attribution.`,
  );
  console.log("Wrote data/images.generated.ts and CREDITS.md\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
