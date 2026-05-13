import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type {
  Confidence,
  EvidenceCollection,
  EvidenceEdge,
  EvidenceGeo,
  EvidenceGraph,
  EvidenceHeroAsset,
  EvidenceNode,
  EvidenceNodeType,
  EvidenceRelationship,
} from '../types';

type AnyEntry =
  | CollectionEntry<'fbiCases'>
  | CollectionEntry<'pursueCases'>
  | CollectionEntry<'entities'>;

const NODE_TYPES: ReadonlySet<EvidenceNodeType> = new Set([
  'document',
  'witness',
  'agency',
  'location',
  'event',
  'sighting',
  'contradiction',
  'media',
  'classification',
]);

const RELATIONSHIP_TYPES: ReadonlySet<EvidenceRelationship> = new Set([
  'mentions',
  'supports',
  'contradicts',
  'same_location',
  'same_date',
  'same_agency',
  'derived_from',
  'occurred_before',
  'classified_under',
]);

const CONFIDENCES: ReadonlySet<Confidence> = new Set(['low', 'medium', 'high']);

function nodeIdFor(entry: AnyEntry): string {
  const caseId = (entry.data as { caseId?: unknown }).caseId;
  if (typeof caseId === 'string' && caseId.length > 0) return caseId;
  return `${entry.collection}-${entry.id}`;
}

function defaultNodeTypeFor(collection: EvidenceCollection): EvidenceNodeType {
  if (collection === 'entities') return 'agency';
  return 'document';
}

function resolveNodeType(raw: unknown, collection: EvidenceCollection): EvidenceNodeType {
  if (typeof raw === 'string' && NODE_TYPES.has(raw as EvidenceNodeType)) {
    return raw as EvidenceNodeType;
  }
  return defaultNodeTypeFor(collection);
}

function resolveConfidence(raw: unknown): Confidence | undefined {
  if (typeof raw === 'string' && CONFIDENCES.has(raw as Confidence)) {
    return raw as Confidence;
  }
  return undefined;
}

function resolveRelationshipType(raw: unknown): EvidenceRelationship | null {
  if (typeof raw === 'string' && RELATIONSHIP_TYPES.has(raw as EvidenceRelationship)) {
    return raw as EvidenceRelationship;
  }
  return null;
}

function asStringArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    if (item == null) continue;
    out.push(String(item));
  }
  return out.length > 0 ? out : undefined;
}

function resolveGeo(raw: unknown): EvidenceGeo | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as { lat?: unknown; lng?: unknown; placeName?: unknown };
  if (typeof r.lat !== 'number' || typeof r.lng !== 'number') return undefined;
  const geo: EvidenceGeo = { lat: r.lat, lng: r.lng };
  if (typeof r.placeName === 'string') geo.placeName = r.placeName;
  else if (r.placeName != null) geo.placeName = String(r.placeName);
  return geo;
}

function resolveHeroAsset(raw: unknown): EvidenceHeroAsset | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as { type?: unknown; src?: unknown; alt?: unknown; credit?: unknown };
  if (r.type !== 'photo' && r.type !== 'scan' && r.type !== 'map') return undefined;
  const hero: EvidenceHeroAsset = { type: r.type };
  if (r.src != null) hero.src = String(r.src);
  if (r.alt != null) hero.alt = String(r.alt);
  if (r.credit != null) hero.credit = String(r.credit);
  return hero;
}

function resolveTitle(entry: AnyEntry): string {
  const t = (entry.data as { title?: unknown }).title;
  if (typeof t === 'string' && t.trim().length > 0) return t;
  return entry.id;
}

function resolveDate(entry: AnyEntry): string | undefined {
  const d = (entry.data as { date?: unknown; case_date?: unknown; source_date?: unknown }).date;
  if (d != null) return String(d);
  const cd = (entry.data as { case_date?: unknown }).case_date;
  if (cd != null) return cd instanceof Date ? cd.toISOString().slice(0, 10) : String(cd);
  const sd = (entry.data as { source_date?: unknown }).source_date;
  if (sd != null) return sd instanceof Date ? sd.toISOString().slice(0, 10) : String(sd);
  return undefined;
}

function resolveThreads(entry: AnyEntry): string[] | undefined {
  const threads = asStringArray((entry.data as { threads?: unknown }).threads);
  if (threads) return threads;
  const single = (entry.data as { thread?: unknown }).thread;
  if (typeof single === 'string' && single.length > 0) return [single];
  return undefined;
}

function entryToNode(entry: AnyEntry): EvidenceNode {
  const collection = entry.collection as EvidenceCollection;
  const data = entry.data as Record<string, unknown>;
  const node: EvidenceNode = {
    id: nodeIdFor(entry),
    type: resolveNodeType(data.nodeType, collection),
    title: resolveTitle(entry),
    collection,
    slug: entry.id,
  };
  const date = resolveDate(entry);
  if (date) node.date = date;
  if (typeof data.agency === 'string') node.agency = data.agency;
  else if (data.agency != null) node.agency = String(data.agency);
  if (typeof data.classification === 'string') node.classification = data.classification;
  else if (data.classification != null) node.classification = String(data.classification);
  const confidence = resolveConfidence(data.confidence);
  if (confidence) node.confidence = confidence;
  const threads = resolveThreads(entry);
  if (threads) node.threads = threads;
  const geo = resolveGeo(data.geo);
  if (geo) node.geo = geo;
  if (typeof data.summary === 'string') node.summary = data.summary;
  else if (data.summary != null) node.summary = String(data.summary);
  if (typeof data.excerpt === 'string') node.excerpt = data.excerpt;
  else if (data.excerpt != null) node.excerpt = String(data.excerpt);
  const hero = resolveHeroAsset(data.heroAsset);
  if (hero) node.heroAsset = hero;
  return node;
}

function collectEdges(
  entry: AnyEntry,
  sourceId: string,
  nodeIds: Set<string>,
  edgeMap: Map<string, EvidenceEdge>
): void {
  const rels = (entry.data as { relationships?: unknown }).relationships;
  if (!Array.isArray(rels)) return;
  for (const rel of rels) {
    if (!rel || typeof rel !== 'object') continue;
    const r = rel as {
      target?: unknown;
      type?: unknown;
      confidence?: unknown;
      explanation?: unknown;
      sourceParagraph?: unknown;
    };
    const target = r.target == null ? '' : String(r.target);
    if (!target || !nodeIds.has(target)) continue;
    const type = resolveRelationshipType(r.type);
    if (!type) continue;
    const confidence = resolveConfidence(r.confidence) ?? 'medium';
    const id = `${sourceId}__${type}__${target}`;
    if (edgeMap.has(id)) continue;
    const edge: EvidenceEdge = {
      id,
      source: sourceId,
      target,
      type,
      confidence,
    };
    if (typeof r.explanation === 'string') edge.explanation = r.explanation;
    if (typeof r.sourceParagraph === 'string') edge.sourceParagraph = r.sourceParagraph;
    edgeMap.set(id, edge);
  }
}

let cached: Promise<EvidenceGraph> | null = null;

async function build(): Promise<EvidenceGraph> {
  const [fbi, pursue, ent] = await Promise.all([
    getCollection('fbiCases'),
    getCollection('pursueCases'),
    getCollection('entities'),
  ]);
  const entries: AnyEntry[] = [...fbi, ...pursue, ...ent];

  const nodes: EvidenceNode[] = [];
  const idToEntry = new Map<string, AnyEntry>();
  for (const entry of entries) {
    const node = entryToNode(entry);
    // Dedupe: a duplicate caseId would mean two source files claim the same id.
    // Keep the first, drop the rest. This matches the corpus invariant.
    if (idToEntry.has(node.id)) continue;
    idToEntry.set(node.id, entry);
    nodes.push(node);
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edgeMap = new Map<string, EvidenceEdge>();
  for (const node of nodes) {
    const entry = idToEntry.get(node.id);
    if (!entry) continue;
    collectEdges(entry, node.id, nodeIds, edgeMap);
  }

  return { nodes, edges: Array.from(edgeMap.values()) };
}

/**
 * Memoized build-time graph. Both `/board` and `/atlas` call this during prerender.
 * The Astro build runs once per process, so a single in-memory cache is enough.
 */
export function getGraph(): Promise<EvidenceGraph> {
  if (!cached) cached = build();
  return cached;
}
