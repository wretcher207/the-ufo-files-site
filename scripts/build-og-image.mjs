// Generate the default Open Graph image at public/og-image.jpg
// Run via: node scripts/build-og-image.mjs
// Output: 1200x630, monochrome, Fraunces masthead + JetBrains Mono meta.

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outPath = path.join(repoRoot, 'public', 'og-image.jpg');

const W = 1200;
const H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    .display { font-family: 'Fraunces', 'Times New Roman', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', 'Menlo', 'Courier New', monospace; }
    text { fill: #ffffff; }
  </style>

  <rect width="${W}" height="${H}" fill="#000000"/>

  <line x1="64" y1="80" x2="${W - 64}" y2="80" stroke="#1a1a1a" stroke-width="1"/>
  <line x1="64" y1="${H - 80}" x2="${W - 64}" y2="${H - 80}" stroke="#1a1a1a" stroke-width="1"/>

  <text class="mono" x="64" y="58" font-size="14" letter-spacing="3" font-weight="500">
    INDEX 2026-05-13 &#183; 63 FILES &#183; 06 THREADS
  </text>
  <text class="mono" x="${W - 64}" y="58" font-size="14" letter-spacing="3" font-weight="500" text-anchor="end">
    DEAD PIXEL DESIGN
  </text>

  <text class="display" x="64" y="285" font-size="116" font-weight="400" letter-spacing="-3">
    THE UFO FILES
  </text>

  <text class="display" x="64" y="385" font-size="36" font-weight="300" font-style="italic" fill="#888888">
    FBI 62-HQ-83894 + PURSUE Release 01
  </text>

  <text class="mono" x="64" y="${H - 110}" font-size="13" letter-spacing="3" font-weight="500" fill="#888888">
    AN ARCHIVE OF THE MAY 2026 PURSUE UFO FILE RELEASE
  </text>
  <text class="mono" x="64" y="${H - 88}" font-size="13" letter-spacing="3" font-weight="500" fill="#888888">
    AND FBI 62-HQ-83894, 1947 TO 1973
  </text>

  <text class="mono" x="64" y="${H - 38}" font-size="12" letter-spacing="4" font-weight="500">
    THEUFOFILES.COM
  </text>
</svg>
`;

async function main() {
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
