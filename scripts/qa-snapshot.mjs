import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve(process.cwd(), 'qa-snapshots');
mkdirSync(outDir, { recursive: true });

const pages = [
  { path: '/', name: 'index' },
  { path: '/atlas', name: 'atlas' },
  { path: '/vault', name: 'vault' },
  { path: '/timeline', name: 'timeline' },
  { path: '/dossier/apollo-17-vm6', name: 'dossier-apollo' },
];

const widths = [
  { w: 1440, h: 900, tag: 'desktop' },
  { w: 768, h: 1024, tag: 'tablet' },
  { w: 390, h: 844, tag: 'mobile' },
];

const browser = await chromium.launch();
for (const wcfg of widths) {
  const ctx = await browser.newContext({ viewport: { width: wcfg.w, height: wcfg.h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const p of pages) {
    try {
      await page.goto(`http://localhost:4321${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(400);
      const file = resolve(outDir, `${p.name}-${wcfg.tag}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`✓ ${p.name} @ ${wcfg.tag} → ${file}`);
    } catch (e) {
      console.log(`✗ ${p.name} @ ${wcfg.tag}: ${e.message}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log('\nDone.');
