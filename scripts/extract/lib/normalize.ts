// Field-level normalizers — turn raw existing frontmatter into canonical
// values for the new schema. All deterministic.

import type { Confidence, EvidenceNodeType } from './fields.js';

/** Normalize a `publisher` string into a canonical agency code. */
export function normalizeAgency(publisher: string | undefined, tags: string[] = []): string {
  const src = (publisher || '').toLowerCase();
  const tagSet = new Set(tags.map((t) => String(t).toLowerCase()));

  // Tag-based wins first.
  if (tagSet.has('fbi') || tagSet.has('62hq83894') || tagSet.has('62-hq-83894')) return 'FBI';
  if (tagSet.has('aaro')) return 'AARO';
  if (tagSet.has('cia')) return 'CIA';

  if (src.includes('federal bureau') || src.startsWith('fbi') || src.includes('/ fbi') || src.includes('fbi /')) return 'FBI';
  if (src.includes('state')) return 'State Department';
  if (src.includes('aaro') || src.includes('all-domain')) return 'AARO';
  if (src.includes('pursue')) return 'PURSUE';
  if (src.includes('cia') || src.includes('central intelligence')) return 'CIA';
  if (src.includes('air force') || src.includes('aaf') || src.includes('usaf')) return 'Air Force';
  if (src.includes('osi')) return 'OSI';
  if (src.includes('department of war') || src.includes('war department')) return 'Department of War';
  if (src.includes('department of defense') || src.includes('dod')) return 'DoD';
  if (src.includes('nasa')) return 'NASA';

  // Default fallback: cases come from FBI/PURSUE releases so default to FBI for legacy, PURSUE for new release.
  return publisher?.trim() || 'FBI';
}

/** Map existing `significance` (high|medium|low) to canonical confidence. */
export function normalizeConfidence(significance: string | undefined): Confidence {
  const s = (significance || '').toLowerCase();
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}

/** Heuristic nodeType for entities, based on slug + tags + existing `type` field. */
export function entityNodeType(
  slug: string,
  existingType: string | undefined,
  tags: string[] = [],
): EvidenceNodeType {
  if (existingType) {
    const t = existingType.toLowerCase();
    if (t === 'agency' || t === 'department') return 'agency';
    if (t === 'person' || t === 'witness' || t === 'official') return 'person';
    if (t === 'location' || t === 'place') return 'location';
    if (t === 'program' || t === 'project') return 'program';
    if (t === 'concept') return 'concept';
    if (t === 'event') return 'event';
  }
  const tagSet = new Set(tags.map((t) => String(t).toLowerCase()));
  const sl = slug.toLowerCase();

  if (tagSet.has('agency') || tagSet.has('pentagon') || tagSet.has('department')) return 'agency';
  if (/^(fbi|aaro|cia|nasa|state-department|department-of-war|aaf)$/.test(sl)) return 'agency';

  // Known programs.
  if (/(program|project|pursue)/.test(sl)) return 'program';

  // Locations: bare place names often end in known suffixes.
  if (/(base|field|air-force|nm|texas|alaska|maine|county|city|island|mountain|laboratory|labs)$/.test(sl)) return 'location';

  // People: two name-like parts separated by hyphen and short.
  if (/^[a-z]+-[a-z]+(-[a-z]+)?$/.test(sl) && sl.split('-').length <= 3) {
    return 'person';
  }

  return 'concept';
}

/** Cases are documents by default — they're scanned releases. Override if a `nodeType` is already set. */
export function caseNodeType(existing: string | undefined): EvidenceNodeType {
  if (!existing) return 'document';
  return existing as EvidenceNodeType;
}

/** Decide the canonical date for a case. */
export function pickDate(data: {
  case_date?: unknown;
  source_date?: unknown;
  date_ingested?: unknown;
  date?: unknown;
}): string | undefined {
  const cands = [data.date, data.case_date, data.source_date, data.date_ingested];
  for (const c of cands) {
    if (!c) continue;
    if (c instanceof Date) return c.toISOString().slice(0, 10);
    const s = String(c).trim();
    if (s) return s;
  }
  return undefined;
}

/** Decide a release date — when this document went public. */
export function pickReleaseDate(data: {
  source_date?: unknown;
  date_ingested?: unknown;
}): string | undefined {
  const cands = [data.source_date, data.date_ingested];
  for (const c of cands) {
    if (!c) continue;
    if (c instanceof Date) return c.toISOString().slice(0, 10);
    const s = String(c).trim();
    if (s) return s;
  }
  return undefined;
}

/** Build a stable caseId from a slug. */
export function caseIdFromSlug(slug: string, collection: string): string {
  if (collection === 'fbiCases') return `FBI-62HQ-83894/${slug}`;
  if (collection === 'pursueCases') return `PURSUE-01/${slug}`;
  if (collection === 'entities') return `ENTITY/${slug}`;
  return `${collection}/${slug}`;
}

/** Classification default — these are all declassified public releases. */
export function defaultClassification(): string {
  return 'Declassified';
}
