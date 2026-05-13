import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { AnyCase } from './case-utils';
import { getAllCases } from './case-utils';

export type EntityEntry = CollectionEntry<'entities'>;

export interface EntityRecord {
  slug: string;
  display: string;
  hasContext: boolean;
  context?: EntityEntry;
  cases: AnyCase[];
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/** Normalize a frontmatter entity reference into a URL-safe slug. */
function toSlug(raw: string): string | null {
  if (!raw) return null;
  // If already a clean kebab slug, keep it.
  if (SLUG_RE.test(raw)) return raw;
  // Slugify free-form names like "David N. Johnson" or "S/A Frank M. Brown CIC 4th AF"
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length >= 2 ? slug : null;
}

export function humanize(slug: string): string {
  const upper = new Set(['cic', 'fbi', 'aaro', 'osi', 'sac', 'aaf', 'usaf', 'oni', 'nasa', 'us', 'usper', 'nm', 'wa', 'or', 'ca', 'ny', 'tx', 'pursue', 'dow', 'aafld', 'sa']);
  const replace: Record<string, string> = {
    'p51': 'P-51',
    'b29': 'B-29',
    'su27': 'Su-27',
    '4af': '4AF',
    '509th': '509th',
    'd3': 'D3',
  };
  return slug
    .split('-')
    .map((part) => {
      if (replace[part]) return replace[part];
      if (upper.has(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export async function getAllEntities(): Promise<EntityRecord[]> {
  const cases = await getAllCases();
  const contextEntries = await getCollection('entities');

  const slugToCases = new Map<string, AnyCase[]>();
  const slugToOriginal = new Map<string, string>();

  for (const c of cases) {
    const hasThread = (c.data.threads && c.data.threads.length) || c.data.thread;
    if (!hasThread) continue;
    for (const raw of c.data.entities_mentioned ?? []) {
      const slug = toSlug(String(raw));
      if (!slug) continue;
      const arr = slugToCases.get(slug) ?? [];
      arr.push(c);
      slugToCases.set(slug, arr);
      // Remember the most-readable original spelling for the display name.
      const prev = slugToOriginal.get(slug);
      if (!prev || /[A-Z. ]/.test(String(raw))) {
        slugToOriginal.set(slug, String(raw));
      }
    }
  }

  const contextBySlug = new Map<string, EntityEntry>();
  for (const ctx of contextEntries) {
    contextBySlug.set(ctx.id, ctx);
    if (!slugToCases.has(ctx.id)) {
      slugToCases.set(ctx.id, []);
    }
  }

  const records: EntityRecord[] = [];
  for (const [slug, list] of slugToCases.entries()) {
    const ctx = contextBySlug.get(slug);
    let display: string;
    if (ctx?.data && (ctx.data as any).title) {
      display = String((ctx.data as any).title);
    } else if (slugToOriginal.has(slug) && /[A-Z. ]/.test(slugToOriginal.get(slug)!)) {
      display = slugToOriginal.get(slug)!;
    } else {
      display = humanize(slug);
    }
    records.push({
      slug,
      display,
      hasContext: !!ctx,
      context: ctx,
      cases: list,
    });
  }

  records.sort((a, b) => b.cases.length - a.cases.length);
  return records;
}

export async function getEntity(slug: string): Promise<EntityRecord | null> {
  const all = await getAllEntities();
  return all.find((r) => r.slug === slug) ?? null;
}
