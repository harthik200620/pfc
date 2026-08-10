// ---------------------------------------------------------------------------
// Pull the three webfaces into public/fonts/ from their publishers' own
// delivery endpoints.
//
//   npm run fonts
//
// JetBrains Mono is SIL Open Font License, served by Google Fonts as a variable
// woff2 split by unicode-range — we take the latin subset. Switzer and
// Gambarino are Indian Type Foundry faces under the ITF Free Font License,
// served through Fontshare's public CSS API as one static file per weight.
//
// This step is OPTIONAL. globals.css declares @font-face with a real fallback
// stack, so a missing file degrades to the system stack instead of breaking the
// build — which is the whole reason next/font/local is not used here.
// ---------------------------------------------------------------------------

import { mkdir, writeFile } from "node:fs/promises";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const get = async (url) => {
  const res = await fetch(url.startsWith("//") ? `https:${url}` : url, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
};

/** Split a stylesheet into @font-face blocks. */
function faceBlocks(css) {
  return css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
}

function woff2In(block) {
  // Fontshare serves protocol-relative URLs; Google serves absolute ones.
  const match = block.match(/url\(['"]?((?:https:)?\/\/[^)'"]+\.woff2)['"]?\)/);
  return match?.[1] ?? null;
}

function weightIn(block) {
  const match = block.match(/font-weight:\s*([0-9]+)/);
  return match?.[1] ?? "400";
}

async function save(name, url, licence) {
  const buf = Buffer.from(await (await get(url)).arrayBuffer());
  await writeFile(`public/fonts/${name}.woff2`, buf);
  console.log(`  ok    ${name.padEnd(24)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB   ${licence}`);
}

await mkdir("public/fonts", { recursive: true });

// -- JetBrains Mono (Google Fonts, OFL) -------------------------------------
// css2 returns one block per unicode-range subset. Take latin — the block whose
// range covers U+0000-00FF. Grabbing the first block gets you cyrillic-ext.
try {
  const css = await (
    await get(
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400..700&display=swap",
    )
  ).text();

  const latin = faceBlocks(css).find(
    (b) => /unicode-range:[^;]*U\+0000-00FF/i.test(b) && !/U\+0460/i.test(b),
  );
  const url = latin ? woff2In(latin) : null;

  if (url) await save("JetBrainsMono-latin", url, "SIL OFL 1.1");
  else console.log("  skip  JetBrainsMono — no latin subset in the stylesheet");
} catch (err) {
  console.log(`  fail  JetBrainsMono — ${err.message}; falls back to the system mono`);
}

// -- Switzer + Gambarino (Fontshare, ITF Free Font License) -----------------
for (const [family, request, weights] of [
  // 700 is deliberately not fetched — nothing in the design uses it, and it
  // would be 19KB of payload for a weight that never renders.
  ["Switzer", "switzer@400,500,600", ["400", "500", "600"]],
  ["Gambarino", "gambarino@400", ["400"]],
]) {
  try {
    const css = await (
      await get(`https://api.fontshare.com/v2/css?f%5B%5D=${request}`)
    ).text();

    let wrote = 0;
    for (const block of faceBlocks(css)) {
      const weight = weightIn(block);
      if (!weights.includes(weight)) continue;
      const url = woff2In(block);
      if (!url) continue;
      await save(`${family}-${weight}`, url, "ITF Free Font License");
      wrote += 1;
    }
    if (wrote === 0) console.log(`  skip  ${family} — no woff2 in the stylesheet response`);
  } catch (err) {
    console.log(`  fail  ${family} — ${err.message}; falls back to the system stack`);
  }
}
