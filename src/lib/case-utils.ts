import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { THREADS, type ThreadId } from './threads';

export type AnyCase = CollectionEntry<'fbiCases'> | CollectionEntry<'pursueCases'>;

export async function getAllCases(): Promise<AnyCase[]> {
  const fbi = await getCollection('fbiCases');
  const pursue = await getCollection('pursueCases');
  return [...fbi, ...pursue];
}

export async function getRenderableCases(): Promise<AnyCase[]> {
  const all = await getAllCases();
  return all.filter((c) => (c.data.threads?.[0] ?? c.data.thread) && c.data.title);
}

export function primaryThreadId(c: AnyCase): string | undefined {
  const t = c.data.threads?.[0] ?? c.data.thread;
  return t ? String(t) : undefined;
}

/**
 * All thread ids a case belongs to. Cases tagged on multiple threads
 * (e.g. PURSUE incident that also bridges the 1974-2025 silence)
 * get counted under each. Returns string ids, deduped, in array
 * order; falls back to the legacy single `thread` field if no array.
 */
export function allThreadIds(c: AnyCase): string[] {
  const arr = Array.isArray(c.data.threads) ? c.data.threads : null;
  const out: string[] = [];
  const seen = new Set<string>();
  if (arr && arr.length) {
    for (const t of arr) {
      if (!t) continue;
      const s = String(t);
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
  }
  if (c.data.thread) {
    const s = String(c.data.thread);
    if (!seen.has(s)) { seen.add(s); out.push(s); }
  }
  return out;
}

/**
 * Per-thread case counts across the renderable corpus.
 * A case counted under every thread it appears on.
 */
export function countCasesByThread(cases: AnyCase[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of cases) {
    for (const t of allThreadIds(c)) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return counts;
}

export function archiveOf(c: AnyCase): 'fbi' | 'pursue' {
  return (c.collection as string) === 'pursueCases' ? 'pursue' : 'fbi';
}

export function caseUrl(c: AnyCase): string {
  return `/dossier/${c.id}`;
}

export function threadOf(c: AnyCase) {
  const tid = c.data.threads?.[0] ?? c.data.thread;
  if (!tid) return undefined;
  return THREADS.find((t) => t.id === tid);
}

export function shortDate(input: unknown): string | null {
  if (!input) return null;
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }
  return String(input);
}

/**
 * Best-effort case headline date.
 * Prefers case_date (event date) over source_date (document date) over date_ingested.
 */
export function headlineDate(c: AnyCase): string | null {
  return (
    shortDate(c.data.case_date) ??
    shortDate(c.data.source_date) ??
    shortDate(c.data.date_ingested)
  );
}

/**
 * Find related cases: same thread + at least one shared entity mentioned.
 * Returns up to `limit` ranked by overlap count.
 */
export function relatedCases(target: AnyCase, all: AnyCase[], limit = 6): AnyCase[] {
  const targetEntities = new Set(target.data.entities_mentioned ?? []);
  if (targetEntities.size === 0) return [];

  const scored: { entry: AnyCase; score: number }[] = [];
  for (const c of all) {
    if (c.id === target.id) continue;
    if (!c.data.thread || !c.data.title) continue;
    const overlap = (c.data.entities_mentioned ?? []).filter((e) => targetEntities.has(e)).length;
    if (overlap > 0) {
      scored.push({ entry: c, score: overlap });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

export function tidyTitle(title: string | undefined): string {
  if (!title) return 'Untitled case';
  // Strip common prefix patterns from archive titles for nicer display.
  return title
    .replace(/^FBI 62-HQ-83894 — /, '')
    .replace(/^NASA-UAP-VM6 — /, 'Apollo 17 VM6 — ')
    .trim();
}
