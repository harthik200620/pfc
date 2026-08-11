// ---------------------------------------------------------------------------
// Pull the three families into public/fonts/.
//
//   npm run fonts
//
//   Italiana        — the wordmark, display sizes, headings. Hairline serif
//                     capitals; one weight. Google Fonts, SIL OFL.
//   Crimson Pro     — body text, quotes and every price. Variable latin file.
//   Instrument Sans — buttons, labels, data. Variable latin file.
//
// This step is OPTIONAL. globals.css declares @font-face with real fallback
// stacks, so a missing file degrades instead of breaking the build — which is
// the whole reason next/font/local is not used.
// ---------------------------------------------------------------------------

import { mkdir, writeFile } from "node:fs/promises";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const get = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
};

const faceBlocks = (css) => css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const isLatin = (b) => /unicode-range:[^;]*U\+0000-00FF/i.test(b) && !/U\+0460/i.test(b);
const woff2In = (b) => b.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1] ?? null;

async function save(name, url) {
  const buf = Buffer.from(await (await get(url)).arrayBuffer());
  await writeFile(`public/fonts/${name}.woff2`, buf);
  console.log(`  ok    ${name.padEnd(28)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB`);
}

async function fetchLatin(name, cssUrl) {
  try {
    const css = await (await get(cssUrl)).text();
    const latin = faceBlocks(css).find(isLatin);
    const url = latin ? woff2In(latin) : null;
    if (url) await save(name, url);
    else console.log(`  skip  ${name} — no latin subset found`);
  } catch (err) {
    console.log(`  fail  ${name} — ${err.message}; falls back to the stack`);
  }
}

await mkdir("public/fonts", { recursive: true });

await fetchLatin(
  "Italiana-400",
  "https://fonts.googleapis.com/css2?family=Italiana&display=swap",
);
await fetchLatin(
  "CrimsonPro-Variable",
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400..700&display=swap",
);
await fetchLatin(
  "InstrumentSans-Variable",
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap",
);
