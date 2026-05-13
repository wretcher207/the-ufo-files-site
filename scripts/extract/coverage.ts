/**
 * Coverage report — per-collection check of required fields.
 *
 * Exits non-zero if ANY case is missing ANY required field.
 *
 * Required fields per the Phase 6 plan:
 *   cases:    caseId, source, relationships, threads, entities, nodeType,
 *             confidence, summary, excerpt, date, agency, classification
 *   entities: caseId, nodeType, summary, excerpt
 *
 * Run:   npx tsx scripts/extract/coverage.ts
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import { collectCorpus, type CorpusFile } from './lib/walk.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVE = path.join(REPO_ROOT, 'content', 'archive');

const CASE_REQUIRED = [
  'caseId',
  'source',
  'relationships',
  'threads',
  'entities',
  'nodeType',
  'confidence',
  'summary',
  'excerpt',
  'date',
  'agency',
  'classification',
] as const;

const ENTITY_REQUIRED = ['caseId', 'nodeType', 'summary', 'excerpt'] as const;

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  return false;
}

interface CollectionReport {
  collection: CorpusFile['collection'];
  total: number;
  skipped: { slug: string; reason: string }[];
  perField: Record<string, { populated: number; missingSlugs: string[] }>;
}

function newReport(collection: CorpusFile['collection'], fields: readonly string[]): CollectionReport {
  const perField: CollectionReport['perField'] = {};
  for (const f of fields) perField[f] = { populated: 0, missingSlugs: [] };
  return { collection, total: 0, skipped: [], perField };
}

function pct(n: number, d: number): string {
  if (d === 0) return '  0%';
  return `${Math.round((n / d) * 100)
    .toString()
    .padStart(3)}%`;
}

async function main(): Promise<void> {
  const corpus = await collectCorpus(ARCHIVE);

  const reports: Record<CorpusFile['collection'], CollectionReport> = {
    fbiCases: newReport('fbiCases', CASE_REQUIRED),
    pursueCases: newReport('pursueCases', CASE_REQUIRED),
    entities: newReport('entities', ENTITY_REQUIRED),
  };

  for (const f of corpus) {
    const report = reports[f.collection];
    report.total++;
    const raw = await fs.readFile(f.absPath, 'utf8');
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch (err) {
      report.skipped.push({ slug: f.slug, reason: (err as Error).message.split('\n')[0] });
      continue;
    }
    const data: Record<string, unknown> = parsed.data;
    const required = f.collection === 'entities' ? ENTITY_REQUIRED : CASE_REQUIRED;
    for (const field of required) {
      if (isEmpty(data[field])) {
        report.perField[field].missingSlugs.push(f.slug);
      } else {
        report.perField[field].populated++;
      }
    }
  }

  console.log('━━━ COVERAGE REPORT ━━━');
  let totalMissing = 0;
  for (const r of Object.values(reports)) {
    const denom = r.total - r.skipped.length;
    console.log('');
    console.log(`[${r.collection}]  ${r.total} files (${r.skipped.length} skipped, ${denom} considered)`);
    if (r.skipped.length > 0) {
      for (const s of r.skipped) console.log(`  ! SKIPPED ${s.slug}: ${s.reason}`);
    }
    for (const [field, info] of Object.entries(r.perField)) {
      const pop = info.populated;
      const marker = pop === denom ? ' ' : 'X';
      console.log(`  ${marker} ${field.padEnd(16)} ${pop}/${denom}  ${pct(pop, denom)}`);
      if (info.missingSlugs.length > 0 && info.missingSlugs.length <= 12) {
        for (const s of info.missingSlugs) console.log(`        ↳ missing: ${s}`);
      } else if (info.missingSlugs.length > 12) {
        console.log(`        ↳ missing ${info.missingSlugs.length} files (first 8): ${info.missingSlugs.slice(0, 8).join(', ')}`);
      }
      totalMissing += info.missingSlugs.length;
    }
  }

  console.log('');
  console.log('━━━ SUMMARY ━━━');
  console.log(`Total missing-field instances: ${totalMissing}`);
  if (totalMissing > 0) {
    console.log('FAIL — required fields incomplete.');
    process.exit(1);
  }
  console.log('PASS — every required field populated on every case.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
