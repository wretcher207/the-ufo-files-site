/**
 * Geocoder — fills geo.lat + geo.lng from geo.placeName via Nominatim/OSM.
 *
 * Policy: 1 req/sec, custom User-Agent (Nominatim usage policy).
 * Cache:  scripts/extract/.cache/geo.json keyed by lowercased place name.
 * Idempotent: skips cases that already have lat/lng.
 *
 * Run:   npx tsx scripts/extract/geocode.ts [--force] [--dry-run]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import { collectCorpus } from './lib/walk.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVE = path.join(REPO_ROOT, 'content', 'archive');
const CACHE_DIR = path.join(REPO_ROOT, 'scripts', 'extract', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'geo.json');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

const USER_AGENT = 'the-ufo-files-archive/1.0 (drjr1021@gmail.com)';
const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

interface GeoCacheEntry {
  lat: number | null;
  lng: number | null;
  resolvedAt: string;
}

type GeoCache = Record<string, GeoCacheEntry>;

async function loadCache(): Promise<GeoCache> {
  try {
    const txt = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(txt) as GeoCache;
  } catch {
    return {};
  }
}

async function saveCache(cache: GeoCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

const MIN_INTERVAL_MS = 1100;
let lastReq = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const dt = now - lastReq;
  if (dt < MIN_INTERVAL_MS) await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - dt));
  lastReq = Date.now();
}

async function geocodeOnce(placeName: string): Promise<{ lat: number | null; lng: number | null }> {
  await throttle();
  const url = `${ENDPOINT}?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    console.log(`     network error: ${(err as Error).message}`);
    return { lat: null, lng: null };
  }
  if (!res.ok) {
    console.log(`     HTTP ${res.status} for "${placeName}"`);
    return { lat: null, lng: null };
  }
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(data) || data.length === 0) {
    return { lat: null, lng: null };
  }
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

interface Stats {
  total: number;
  considered: number;
  cacheHits: number;
  geocoded: number;
  patched: number;
  miss: number;
}

async function main(): Promise<void> {
  console.log('━━━ GEOCODE (Nominatim) ━━━');
  console.log(`Archive: ${ARCHIVE}`);
  console.log(`Mode:    ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}${FORCE ? ' + FORCE' : ''}`);
  console.log('');

  const cache = await loadCache();
  const corpus = await collectCorpus(ARCHIVE);
  const stats: Stats = { total: corpus.length, considered: 0, cacheHits: 0, geocoded: 0, patched: 0, miss: 0 };

  for (const f of corpus) {
    const raw = await fs.readFile(f.absPath, 'utf8');
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch {
      continue;
    }
    const data: Record<string, unknown> = { ...parsed.data };
    const geo = (data.geo as Record<string, unknown> | undefined) ?? {};
    const placeName = (geo.placeName as string | undefined)?.trim();
    if (!placeName) continue;
    const hasCoords =
      typeof geo.lat === 'number' &&
      typeof geo.lng === 'number' &&
      Number.isFinite(geo.lat) &&
      Number.isFinite(geo.lng);
    if (hasCoords && !FORCE) continue;

    stats.considered++;
    const key = placeName.toLowerCase();
    let hit = cache[key];
    if (hit) {
      stats.cacheHits++;
    } else {
      const res = await geocodeOnce(placeName);
      hit = { lat: res.lat, lng: res.lng, resolvedAt: new Date().toISOString() };
      cache[key] = hit;
      await saveCache(cache);
      stats.geocoded++;
      if (res.lat === null) {
        console.log(`  ? [${f.slug}] no result for "${placeName}"`);
      }
    }
    if (hit.lat == null || hit.lng == null) {
      stats.miss++;
      continue;
    }

    const newGeo: Record<string, unknown> = { ...geo, lat: hit.lat, lng: hit.lng };
    data.geo = newGeo;
    stats.patched++;
    console.log(`  + [${f.slug}] ${placeName} -> ${hit.lat.toFixed(4)}, ${hit.lng.toFixed(4)}`);
    if (!DRY_RUN) {
      const newContent = matter.stringify(parsed.content, data, { language: 'yaml' });
      await fs.writeFile(f.absPath, newContent, 'utf8');
    }
  }

  console.log('');
  console.log('━━━ RESULTS ━━━');
  console.log(`Considered:  ${stats.considered}`);
  console.log(`Cache hits:  ${stats.cacheHits}`);
  console.log(`Geocoded:    ${stats.geocoded}`);
  console.log(`Patched:     ${stats.patched}`);
  console.log(`Misses:      ${stats.miss}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
