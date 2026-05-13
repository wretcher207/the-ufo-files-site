/**
 * Heuristic relationship inference.
 *
 * For every case/entity pair, infer "mentions" edges via:
 *   - shared entities (entities[] overlap)
 *   - shared threads
 *   - same date or close dates (within 30 days)
 *
 * Idempotent: only adds relationships that do not already exist.
 * Confidence: medium for shared-entity edges, low for date-proximity-only.
 *
 * Conservative: caps per-case relationships at 12 to avoid runaway connectivity.
 *
 * Run:   npx tsx scripts/extract/relationships.ts [--force] [--dry-run]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import { collectCorpus, type CorpusFile } from './lib/walk.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVE = path.join(REPO_ROOT, 'content', 'archive');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_RELS_PER_CASE = 12;
const DATE_WINDOW_DAYS = 30;

interface Relationship {
  target: string;
  type: string;
  confidence: 'low' | 'medium' | 'high';
  explanation?: string;
  sourceParagraph?: string;
}

interface CaseRecord {
  file: CorpusFile;
  data: Record<string, unknown>;
  body: string;
  caseId: string;
  entitySet: Set<string>;
  threadSet: Set<string>;
  date: Date | null;
}

function normalizeEntity(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return null;
  const yr = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) - 1 : 0;
  const da = m[3] ? parseInt(m[3], 10) : 1;
  const d = new Date(Date.UTC(yr, mo, da));
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / 86_400_000);
}

async function loadCase(f: CorpusFile): Promise<CaseRecord | null> {
  const raw = await fs.readFile(f.absPath, 'utf8');
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    return null;
  }
  const data = parsed.data;
  const caseId = String(data.caseId ?? '').trim();
  if (!caseId) return null;
  const entities = Array.isArray(data.entities) ? data.entities.map(String) : [];
  const threads = Array.isArray(data.threads) ? data.threads.map(String) : [];
  return {
    file: f,
    data,
    body: parsed.content,
    caseId,
    entitySet: new Set(entities.map(normalizeEntity)),
    threadSet: new Set(threads.map(normalizeEntity)),
    date: parseDate(data.date),
  };
}

function existingTargets(data: Record<string, unknown>): Set<string> {
  const out = new Set<string>();
  if (!Array.isArray(data.relationships)) return out;
  for (const r of data.relationships as Array<{ target?: string }>) {
    if (r && typeof r.target === 'string') out.add(r.target);
  }
  return out;
}

function score(a: CaseRecord, b: CaseRecord): { score: number; entityOverlap: string[]; threadOverlap: string[]; dateDelta: number | null } {
  const entityOverlap: string[] = [];
  for (const e of a.entitySet) if (b.entitySet.has(e)) entityOverlap.push(e);
  const threadOverlap: string[] = [];
  for (const t of a.threadSet) if (b.threadSet.has(t)) threadOverlap.push(t);
  let dateDelta: number | null = null;
  if (a.date && b.date) dateDelta = daysBetween(a.date, b.date);
  // Score: entities heavily, threads modestly, date proximity light.
  let s = entityOverlap.length * 3 + threadOverlap.length * 1;
  if (dateDelta !== null && dateDelta <= DATE_WINDOW_DAYS) s += 1;
  return { score: s, entityOverlap, threadOverlap, dateDelta };
}

async function main(): Promise<void> {
  console.log('━━━ HEURISTIC RELATIONSHIP INFERENCE ━━━');
  console.log(`Archive: ${ARCHIVE}`);
  console.log(`Mode:    ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}${FORCE ? ' + FORCE' : ''}`);
  console.log('');

  const corpus = await collectCorpus(ARCHIVE);
  const records: CaseRecord[] = [];
  for (const f of corpus) {
    const rec = await loadCase(f);
    if (rec) records.push(rec);
  }
  console.log(`Loaded ${records.length} usable files.`);
  console.log('');

  // Index by caseId for fast target lookup.
  const byCaseId = new Map<string, CaseRecord>();
  for (const r of records) byCaseId.set(r.caseId, r);

  let patched = 0;
  let unchanged = 0;
  let addedEdges = 0;

  for (const a of records) {
    const existing = existingTargets(a.data);
    const haveEnough = !FORCE && Array.isArray(a.data.relationships) && (a.data.relationships as unknown[]).length >= 1;

    // Score all other cases.
    const candidates: Array<{ b: CaseRecord; score: number; entityOverlap: string[]; threadOverlap: string[]; dateDelta: number | null }> = [];
    for (const b of records) {
      if (b.caseId === a.caseId) continue;
      if (existing.has(b.caseId)) continue;
      const sc = score(a, b);
      if (sc.score < 3) continue; // require at least one shared entity or a thread+date hit.
      candidates.push({ b, ...sc });
    }
    candidates.sort((x, y) => y.score - x.score);

    const room = haveEnough ? 0 : MAX_RELS_PER_CASE - (Array.isArray(a.data.relationships) ? (a.data.relationships as unknown[]).length : 0);
    if (room <= 0) {
      unchanged++;
      continue;
    }
    const toAdd = candidates.slice(0, room);
    if (toAdd.length === 0) {
      unchanged++;
      continue;
    }

    const newRels: Relationship[] = toAdd.map((c) => {
      const conf: 'low' | 'medium' | 'high' = c.entityOverlap.length >= 2 ? 'medium' : c.entityOverlap.length >= 1 ? 'medium' : 'low';
      const explanation = c.entityOverlap.length > 0
        ? `Shared entities: ${c.entityOverlap.slice(0, 4).join(', ')}`
        : c.threadOverlap.length > 0
        ? `Shared thread: ${c.threadOverlap[0]}`
        : c.dateDelta !== null
        ? `Date proximity (${Math.round(c.dateDelta)} days)`
        : 'Inferred';
      return {
        target: c.b.caseId,
        type: 'mentions',
        confidence: conf,
        explanation,
      };
    });

    const existingRels = (Array.isArray(a.data.relationships) ? (a.data.relationships as Relationship[]) : []);
    a.data.relationships = [...existingRels, ...newRels];
    addedEdges += newRels.length;

    if (!DRY_RUN) {
      const newContent = matter.stringify(a.body, a.data, { language: 'yaml' });
      await fs.writeFile(a.file.absPath, newContent, 'utf8');
    }
    patched++;
    console.log(`  + [${a.file.collection.padEnd(11)}] ${a.file.slug}  +${newRels.length} edges`);
  }

  console.log('');
  console.log('━━━ RESULTS ━━━');
  console.log(`Patched files:  ${patched}`);
  console.log(`Unchanged:      ${unchanged}`);
  console.log(`Edges added:    ${addedEdges}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
