// ---------------------------------------------------------------------------
// GILDED SURVEY — Plate I. Renders design/gilded-survey.png (1600×2000).
//
//   node scripts/canvas.mjs
//
// The plate expresses design/gilded-survey.md. Its quiet subject: the PAN Loop
// as an orbital survey — twelve unnamed points at the REAL bearings from
// data/halls.ts, a 24-hour outer band with two arcs (the split shift,
// 12–16 and 18–23), and one gilded point at bearing 200 (the entrance).
// Nothing is labelled as such; those who know, know.
//
// Text uses the canvas-design skill's font library (Italiana, Crimson Pro,
// GeistMono). Pango on Windows ignores FONTCONFIG_FILE (verified by probe),
// so every glyph is converted to a vector outline with opentype.js — the
// plate contains no <text> at all, only paths. Typography as geometry.
// ---------------------------------------------------------------------------

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import opentype from "opentype.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR =
  "C:/Users/HP/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/45c829b9-5ff1-40c5-8159-bd98de5a4bba/8ae16384-18d3-4a28-81fa-3da581f3d629/skills/canvas-design/canvas-fonts";

const sharp = (await import("sharp")).default;
const { HALLS, PFC_BEARING } = await import(
  pathToFileURL(path.join(ROOT, "data", "halls.ts")).href
);

const loadFont = async (file) => {
  const buf = await readFile(path.join(FONT_DIR, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

const F = {
  italiana: await loadFont("Italiana-Regular.ttf"),
  crimsonItalic: await loadFont("CrimsonPro-Italic.ttf"),
  mono: await loadFont("GeistMono-Regular.ttf"),
};

/**
 * Set a line of type as pure outlines via the full-string getPath (kerning
 * included; letter-spacing passed in em). Characters the face doesn't cover
 * are substituted before layout so one missing glyph can never truncate a
 * line, and the result is NaN-guarded — a bad path aborts the render rather
 * than shipping a half-set plate.
 */
function type(font, text, { x, y, size, tracking = 0, anchor = "start", fill, opacity = 1 }) {
  const sanitized = [...text]
    .map((ch) => {
      if (font.hasChar(ch) || ch === " ") return ch;
      for (const alt of ["—", "–", "-", "·", ".", "°", " "]) {
        if (alt !== ch && font.hasChar(alt)) {
          if (ch === "—" || ch === "–") return font.hasChar("-") ? "-" : alt;
          return alt;
        }
      }
      return " ";
    })
    .join("");

  const options = { kerning: true, letterSpacing: tracking / size };
  const width = font.getAdvanceWidth(sanitized, size, options);
  if (!Number.isFinite(width)) throw new Error(`unmeasurable string: "${text}"`);

  let sx = x;
  if (anchor === "middle") sx = x - width / 2;
  if (anchor === "end") sx = x - width;

  const d = font.getPath(sanitized, sx, y, size, options).toPathData(2);
  if (d.includes("NaN")) throw new Error(`NaN in path for: "${text}"`);
  return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}"/>`;
}

// --------------------------------------------------------------- geometry --

const W = 1600;
const H = 2000;
const CX = 800;
const CY = 900;
const R_MAIN = 520;

const ESP = "#14100B";
const ESP2 = "#1D1712";
const CHAMP = "#D3B778";
const LINEN = "#F6F1E7";

const pt = (deg, r) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};
const f = (n) => n.toFixed(2);

// Fine tick fields — the patient accumulation.
let ticks = "";
for (let i = 0; i < 360; i += 1) {
  const a = pt(i, R_MAIN);
  const b = pt(i, R_MAIN - (i % 10 === 0 ? 22 : 11));
  ticks += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${CHAMP}" stroke-opacity="${i % 10 === 0 ? 0.7 : 0.34}" stroke-width="${i % 10 === 0 ? 1.4 : 0.75}"/>`;
}
for (let i = 0; i < 240; i += 1) {
  const deg = i * 1.5;
  const a = pt(deg, 372);
  const b = pt(deg, 372 - 9);
  ticks += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${CHAMP}" stroke-opacity="0.26" stroke-width="0.7"/>`;
}
for (let i = 0; i < 120; i += 1) {
  const deg = i * 3;
  const a = pt(deg, 236);
  const b = pt(deg, 236 - 7);
  ticks += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${LINEN}" stroke-opacity="0.16" stroke-width="0.7"/>`;
}

// The 24-hour outer band. 0h at top, 15° per hour. The two service arcs.
const R_DAY = 606;
const hourTo = (h) => h * 15;
const arcPath = (fromDeg, toDeg, r) => {
  const a = pt(fromDeg, r);
  const b = pt(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${f(a.x)} ${f(a.y)} A ${r} ${r} 0 ${large} 1 ${f(b.x)} ${f(b.y)}`;
};
let dayBand = `<circle cx="${CX}" cy="${CY}" r="${R_DAY}" fill="none" stroke="${LINEN}" stroke-opacity="0.14" stroke-width="1"/>`;
dayBand += `<path d="${arcPath(hourTo(12), hourTo(16), R_DAY)}" fill="none" stroke="${CHAMP}" stroke-opacity="0.9" stroke-width="7"/>`;
dayBand += `<path d="${arcPath(hourTo(18), hourTo(23), R_DAY)}" fill="none" stroke="${CHAMP}" stroke-opacity="0.9" stroke-width="7"/>`;
for (let h = 0; h < 24; h += 1) {
  const a = pt(hourTo(h), R_DAY + 8);
  const b = pt(hourTo(h), R_DAY - 8);
  dayBand += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${LINEN}" stroke-opacity="${h % 6 === 0 ? 0.5 : 0.22}" stroke-width="${h % 6 === 0 ? 1.5 : 0.8}"/>`;
}
// Hour figures at the quarters, engraved small.
for (const h of [0, 6, 12, 18]) {
  const p = pt(hourTo(h), R_DAY + 36);
  dayBand += type(F.mono, String(h).padStart(2, "0"), {
    x: p.x,
    y: p.y + 6,
    size: 17,
    anchor: "middle",
    fill: LINEN,
    opacity: 0.5,
  });
}

// The twelve stations, at their true bearings.
let nodes = "";
for (const hall of HALLS) {
  const r = 214 + hall.distance * 54;
  const p = pt(hall.bearing, r);
  const spokeEnd = pt(hall.bearing, R_MAIN - 24);
  nodes += `<line x1="${CX}" y1="${CY}" x2="${f(spokeEnd.x)}" y2="${f(spokeEnd.y)}" stroke="${LINEN}" stroke-opacity="0.07" stroke-width="0.8"/>`;
  nodes += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="4.6" fill="${ESP}" stroke="${CHAMP}" stroke-opacity="0.9" stroke-width="1.4"/>`;
  const lp = pt(hall.bearing, r + 26);
  nodes += type(F.mono, String(15 + (hall.distance - 1) * 6).padStart(2, "0"), {
    x: lp.x,
    y: lp.y + 5,
    size: 15,
    anchor: "middle",
    fill: LINEN,
    opacity: 0.42,
  });
}

// The entrance: one point allowed to differ.
const entry = pt(PFC_BEARING, R_MAIN);
const entryMark = `
  <circle cx="${f(entry.x)}" cy="${f(entry.y)}" r="9" fill="${CHAMP}"/>
  <circle cx="${f(entry.x)}" cy="${f(entry.y)}" r="17" fill="none" stroke="${CHAMP}" stroke-opacity="0.55" stroke-width="1.2"/>
  <circle cx="${f(entry.x)}" cy="${f(entry.y)}" r="26" fill="none" stroke="${CHAMP}" stroke-opacity="0.22" stroke-width="1"/>
  ${type(F.mono, "OVAL 3", { x: entry.x - 40, y: entry.y + 46, size: 16, tracking: 3, anchor: "middle", fill: CHAMP })}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A140F"/>
      <stop offset="45%" stop-color="${ESP}"/>
      <stop offset="100%" stop-color="#0F0B08"/>
    </linearGradient>
    <radialGradient id="breath" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${CHAMP}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${CHAMP}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.83 0 0 0 0 0.72 0 0 0 0 0.47 0 0 0 0.05 0"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <rect width="${W}" height="${H}" fill="url(#breath)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>

  <!-- frame -->
  <rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="${CHAMP}" stroke-opacity="0.32" stroke-width="1.4"/>
  <rect x="68" y="68" width="${W - 136}" height="${H - 136}" fill="none" stroke="${CHAMP}" stroke-opacity="0.12" stroke-width="0.8"/>

  <!-- masthead -->
  ${type(F.italiana, "GILDED SURVEY", { x: CX, y: 164, size: 34, tracking: 14, anchor: "middle", fill: LINEN, opacity: 0.88 })}
  <line x1="${CX - 44}" y1="196" x2="${CX + 44}" y2="196" stroke="${CHAMP}" stroke-opacity="0.8" stroke-width="1.2"/>

  <!-- instrument -->
  <circle cx="${CX}" cy="${CY}" r="${R_MAIN}" fill="none" stroke="${CHAMP}" stroke-opacity="0.85" stroke-width="1.6"/>
  <circle cx="${CX}" cy="${CY}" r="372" fill="none" stroke="${CHAMP}" stroke-opacity="0.3" stroke-width="1"/>
  <circle cx="${CX}" cy="${CY}" r="236" fill="none" stroke="${LINEN}" stroke-opacity="0.14" stroke-width="0.9"/>
  ${ticks}
  ${dayBand}
  ${nodes}
  ${entryMark}

  <!-- centre -->
  <line x1="${CX - 16}" y1="${CY}" x2="${CX + 16}" y2="${CY}" stroke="${LINEN}" stroke-opacity="0.6" stroke-width="1"/>
  <line x1="${CX}" y1="${CY - 16}" x2="${CX}" y2="${CY + 16}" stroke="${LINEN}" stroke-opacity="0.6" stroke-width="1"/>
  <circle cx="${CX}" cy="${CY}" r="3" fill="${CHAMP}"/>

  <!-- title block -->
  <line x1="120" y1="1734" x2="${W - 120}" y2="1734" stroke="${CHAMP}" stroke-opacity="0.5" stroke-width="1.2"/>
  ${type(F.italiana, "FIG. I — THE LOOP", { x: 120, y: 1804, size: 46, tracking: 6, fill: LINEN })}
  ${type(F.crimsonItalic, "where good news comes to eat", { x: 120, y: 1852, size: 25, fill: LINEN, opacity: 0.62 })}
  ${type(F.mono, "SURVEY N° 03 — PLATE I", { x: W - 120, y: 1790, size: 16, tracking: 2, anchor: "end", fill: LINEN, opacity: 0.55 })}
  ${type(F.mono, "22.3149° N · 87.3105° E", { x: W - 120, y: 1820, size: 16, tracking: 2, anchor: "end", fill: LINEN, opacity: 0.55 })}
  ${type(F.mono, "SCALE — ONE CIRCUIT", { x: W - 120, y: 1850, size: 16, tracking: 2, anchor: "end", fill: CHAMP, opacity: 0.8 })}
</svg>`;

await mkdir(path.join(ROOT, "design"), { recursive: true });
const out = path.join(ROOT, "design", "gilded-survey.png");
const buf = await sharp(Buffer.from(svg), { density: 72 })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer();
await writeFile(out, buf);
const meta = await sharp(buf).metadata();
console.log(`  ok     gilded-survey.png  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(0)} KB`);
