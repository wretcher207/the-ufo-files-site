/**
 * Deterministic extractor.
 *
 * Reads every .md case + entity file under content/archive/, derives the
 * new graph/dossier schema from existing frontmatter and body sections
 * (## Summary, ## Connections, ## Quotes Worth Keeping), and writes the
 * patches BACK to each file's frontmatter.
 *
 * Idempotent — only fills empty fields unless --force is passed.
 * Never overwrites a value that the upstream archive already set.
 *
 * Run:   npx tsx scripts/extract/extract.ts [--force] [--dry-run]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import { collectCorpus } from './lib/walk.js';
import { parseBody } from './lib/parse-body.js';
import {
  caseIdFromSlug,
  caseNodeType,
  defaultClassification,
  entityNodeType,
  normalizeAgency,
  normalizeConfidence,
  pickDate,
  pickReleaseDate,
} from './lib/normalize.js';
import type { Relationship } from './lib/fields.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVE = path.join(REPO_ROOT, 'content', 'archive');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

interface Stats {
  total: number;
  patched: number;
  unchanged: number;
  byField: Record<string, number>;
}

function setIfAbsent<T extends Record<string, unknown>>(
  target: T,
  key: string,
  value: unknown,
  stats: Stats,
): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'string' && value.trim() === '') return false;

  if (!FORCE && target[key] !== undefined && target[key] !== null) {
    // Preserve existing.
    return false;
  }
  (target as Record<string, unknown>)[key] = value;
  stats.byField[key] = (stats.byField[key] ?? 0) + 1;
  return true;
}

async function processFile(
  absPath: string,
  collection: 'fbiCases' | 'pursueCases' | 'entities',
  slug: string,
  stats: Stats,
): Promise<{ changed: boolean; skipped?: string }> {
  const raw = await fs.readFile(absPath, 'utf8');
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (err) {
    return { changed: false, skipped: `frontmatter parse error: ${(err as Error).message.split('\n')[0]}` };
  }
  const data: Record<string, unknown> = { ...parsed.data };
  const before = JSON.stringify(data);

  const body = parseBody(raw);

  // ─── Universal fields ──────────────────────────────────────────
  setIfAbsent(data, 'caseId', caseIdFromSlug(slug, collection), stats);
  setIfAbsent(data, 'summary', body.summary ?? undefined, stats);
  setIfAbsent(data, 'excerpt', body.excerpt ?? undefined, stats);

  // ─── Handle the legacy `source` (string) → migrate to sourcePath ──
  if (typeof data.source === 'string') {
    if (!data.sourcePath) data.sourcePath = data.source;
    delete data.source;
  }

  // ─── New `source` object ───────────────────────────────────────
  const officialUrl = (data.origin_url as string | undefined) ?? '';
  const officialMirror = (data.mirror_url as string | undefined) ?? '';
  const releaseDate = pickReleaseDate(data as { source_date?: unknown; date_ingested?: unknown });
  const sourceObj: Record<string, string> = {};
  if (officialUrl) sourceObj.officialUrl = officialUrl;
  if (officialMirror) sourceObj.officialMirror = officialMirror;
  if (releaseDate) sourceObj.releaseDate = releaseDate;
  if (data.publisher) sourceObj.officialName = String(data.publisher);
  if (data.date_ingested) sourceObj.retrievedDate = String(data.date_ingested);
  if (Object.keys(sourceObj).length > 0) {
    setIfAbsent(data, 'source', sourceObj, stats);
  }

  // ─── Case-specific ────────────────────────────────────────────
  if (collection === 'fbiCases' || collection === 'pursueCases') {
    setIfAbsent(data, 'nodeType', caseNodeType(data.nodeType as string | undefined), stats);
    setIfAbsent(data, 'agency', normalizeAgency(data.publisher as string | undefined, (data.tags as string[]) ?? []), stats);
    setIfAbsent(data, 'classification', defaultClassification(), stats);
    setIfAbsent(data, 'confidence', normalizeConfidence(data.significance as string | undefined), stats);
    setIfAbsent(data, 'date', pickDate(data as { case_date?: unknown; source_date?: unknown; date_ingested?: unknown; date?: unknown }), stats);

    // Threads: existing single `thread` → array `threads`
    if (data.thread && !data.threads) {
      data.threads = [String(data.thread)];
      stats.byField.threads = (stats.byField.threads ?? 0) + 1;
    }
    if (FORCE && data.thread) {
      data.threads = [String(data.thread)];
    }

    // Entities: alias entities_mentioned → entities
    if (data.entities_mentioned && !data.entities) {
      data.entities = [...new Set((data.entities_mentioned as unknown[]).map(String))];
      stats.byField.entities = (stats.byField.entities ?? 0) + 1;
    }

    // Witnesses (heuristic — only if we found explicit witness names AND no existing list)
    if (body.witnessNames.length > 0) {
      setIfAbsent(data, 'witnesses', body.witnessNames, stats);
    }

    // Geo: promote flat lat/lng/location → geo object
    if ((data.lat || data.lng || data.location) && !data.geo) {
      const geo: Record<string, unknown> = {};
      if (typeof data.lat === 'number') geo.lat = data.lat;
      if (typeof data.lng === 'number') geo.lng = data.lng;
      if (data.location) geo.placeName = String(data.location);
      if (Object.keys(geo).length > 0) {
        data.geo = geo;
        stats.byField.geo = (stats.byField.geo ?? 0) + 1;
      }
    }

    // Relationships from `## Connections` body section + frontmatter related_cases
    if (!data.relationships || FORCE) {
      const rels: Relationship[] = [];
      const seen = new Set<string>();

      // From `related_cases` frontmatter (explicit upstream links)
      if (Array.isArray(data.related_cases)) {
        for (const t of data.related_cases as unknown[]) {
          const target = String(t);
          if (seen.has(target)) continue;
          seen.add(target);
          rels.push({ target, type: 'mentions', confidence: 'high' });
        }
      }

      // From `## Connections` body links
      for (const c of body.connections) {
        if (seen.has(c.target)) continue;
        seen.add(c.target);
        rels.push({
          target: c.target,
          type: 'mentions',
          confidence: 'medium',
          explanation: c.text,
        });
      }

      if (rels.length > 0) {
        data.relationships = rels;
        stats.byField.relationships = (stats.byField.relationships ?? 0) + 1;
      }
    }
  }

  // ─── Entity-specific ──────────────────────────────────────────
  if (collection === 'entities') {
    setIfAbsent(data, 'nodeType', entityNodeType(slug, data.type as string | undefined, (data.tags as string[]) ?? []), stats);
    setIfAbsent(data, 'title', humanizeSlug(slug), stats);
  }

  // ─── Serialize back ───────────────────────────────────────────
  const after = JSON.stringify(data);
  if (before === after) {
    stats.unchanged++;
    return { changed: false };
  }

  const newContent = matter.stringify(parsed.content, data, {
    // Force standard YAML output.
    language: 'yaml',
  });

  if (!DRY_RUN) {
    await fs.writeFile(absPath, newContent, 'utf8');
  }
  stats.patched++;
  return { changed: true };
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

async function main(): Promise<void> {
  console.log('━━━ DETERMINISTIC EXTRACTION ━━━');
  console.log(`Archive: ${ARCHIVE}`);
  console.log(`Mode:    ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}${FORCE ? ' + FORCE' : ''}`);
  console.log('');

  const corpus = await collectCorpus(ARCHIVE);
  console.log(`Found ${corpus.length} files (fbi: ${corpus.filter((f) => f.collection === 'fbiCases').length}, pursue: ${corpus.filter((f) => f.collection === 'pursueCases').length}, entities: ${corpus.filter((f) => f.collection === 'entities').length})`);
  console.log('');

  const stats: Stats = { total: corpus.length, patched: 0, unchanged: 0, byField: {} };
  const skipped: { slug: string; reason: string }[] = [];

  for (const f of corpus) {
    const { changed, skipped: reason } = await processFile(f.absPath, f.collection, f.slug, stats);
    if (reason) {
      skipped.push({ slug: f.slug, reason });
      console.log(`  ! [${f.collection.padEnd(11)}] ${f.slug}  SKIPPED: ${reason}`);
      continue;
    }
    const marker = changed ? '+' : '·';
    console.log(`  ${marker} [${f.collection.padEnd(11)}] ${f.slug}`);
  }

  console.log('');
  console.log('━━━ RESULTS ━━━');
  console.log(`Patched:    ${stats.patched}`);
  console.log(`Unchanged:  ${stats.unchanged}`);
  console.log(`Skipped:    ${skipped.length}`);
  if (skipped.length > 0) {
    console.log('Skipped files:');
    for (const s of skipped) console.log(`  - ${s.slug}: ${s.reason}`);
  }
  console.log('');
  console.log('Field hits:');
  for (const [k, v] of Object.entries(stats.byField).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(18)} ${v}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
