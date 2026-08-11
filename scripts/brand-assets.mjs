// ---------------------------------------------------------------------------
// Render the brand surfaces nobody remembers until they're missing:
//   icon-512.png, apple-icon-180.png  — from public/favicon.svg
//   og.png (1200×630)                 — link-preview card, authored here
//
//   node scripts/brand-assets.mjs
//
// sharp rasterises SVG with its bundled libvips text support; the OG card
// falls back to system serif rendering for the wordmark, which is acceptable
// for a share card (the foil gradient is what carries it).
// ---------------------------------------------------------------------------

import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const favicon = await readFile("public/favicon.svg");

for (const [name, size] of [
  ["icon-512.png", 512],
  ["apple-icon-180.png", 180],
]) {
  const buf = await sharp(favicon, { density: 400 }).resize(size, size).png().toBuffer();
  await writeFile(`public/${name}`, buf);
  console.log(`  ok    ${name.padEnd(20)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0%" stop-color="#93773d"/>
      <stop offset="30%" stop-color="#e2c98c"/>
      <stop offset="50%" stop-color="#f7ead0"/>
      <stop offset="72%" stop-color="#d3b778"/>
      <stop offset="100%" stop-color="#93773d"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="10%" r="80%">
      <stop offset="0%" stop-color="#d3b778" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#d3b778" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#14100b"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="26" y="26" width="1148" height="578" fill="none" stroke="#d3b778" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="90" y="150" font-family="Georgia, serif" font-size="26" letter-spacing="14" fill="#d3b778">PAN LOOP · IIT KHARAGPUR</text>
  <text x="82" y="400" font-family="Georgia, serif" font-weight="bold" font-size="230" fill="url(#foil)">PFC</text>
  <rect x="92" y="452" width="72" height="2" fill="#d3b778"/>
  <text x="188" y="462" font-family="Georgia, serif" font-size="30" letter-spacing="10" fill="#f6f1e7" fill-opacity="0.85">PAN LOOP FAST FOOD CENTER</text>
  <text x="90" y="545" font-family="Georgia, serif" font-size="26" fill="#f6f1e7" fill-opacity="0.55">Where good news comes to eat · Open 12–4 and 6–11, daily</text>
</svg>`;

const ogBuf = await sharp(Buffer.from(og), { density: 96 }).png().toBuffer();
await writeFile("public/og.png", ogBuf);
console.log(`  ok    og.png               ${(ogBuf.length / 1024).toFixed(1)} KB`);
