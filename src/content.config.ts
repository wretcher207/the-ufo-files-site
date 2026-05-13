import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Tags and entities arrive as YAML. Bare integers (1947) parse as numbers.
// Coerce union members to strings so we can rely on string ops downstream.
// DO NOT remove. The corpus contains numeric-typed tags that silently drop
// without this coercion. See feedback_stringish_schema.md.
const stringish = z.union([z.string(), z.number(), z.boolean()]).transform(String);

// Shared Phase 6 enums. Kept here so all three collections agree.
// The public EvidenceNodeType (src/graph/types.ts) is exactly these 9 values.
// The extractor sometimes writes wider values (person, program, concept) on entity
// frontmatter. We accept any string here and let buildGraph normalize to the 9.
// That keeps the schema permissive (matches the project rule on stringish) while
// the runtime graph contract stays narrow.
const nodeTypeField = z.union([z.string(), z.number(), z.boolean()]).transform(String);

const relationshipTypeEnum = z.enum([
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

const confidenceEnum = z.enum(['low', 'medium', 'high']);

// Phase 6 source object. Mirrors scripts/extract/lib/fields.ts CaseSourceObject.
const sourceObjectSchema = z
  .object({
    officialUrl: stringish.optional(),
    officialName: stringish.optional(),
    officialMirror: stringish.optional(),
    releaseDate: stringish.optional(),
    archiveCommit: stringish.optional(),
    retrievedDate: stringish.optional(),
  })
  .partial();

const relationshipSchema = z.object({
  target: stringish,
  type: relationshipTypeEnum,
  confidence: confidenceEnum,
  explanation: z.string().optional(),
  sourceParagraph: z.string().optional(),
});

const geoSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
    placeName: stringish.optional(),
  })
  .partial();

const dateRangeSchema = z.object({
  start: stringish,
  end: stringish,
});

const heroAssetSchema = z.object({
  type: z.enum(['photo', 'scan', 'map']),
  src: stringish.optional(),
  alt: stringish.optional(),
  credit: stringish.optional(),
});

// Phase 6 additive fields. All optional in Zod. The build-time launch gate
// (scripts/extract/coverage.ts) enforces required fields per CASE_REQUIRED_FIELDS.
const phase6Fields = {
  caseId: z.string().optional(),
  // `source` was a free-string in Phase 1-5. Accept either the legacy string
  // or the new object shape so we do not break in-flight content.
  source: z.union([z.string(), sourceObjectSchema]).optional(),
  relationships: z.array(relationshipSchema).optional(),
  // Phase 6 entities list, plus legacy entities_mentioned kept below.
  entities: z.array(stringish).optional(),
  // Phase 6 threads list (multi). Legacy `thread` enum kept below.
  threads: z.array(stringish).optional(),
  nodeType: nodeTypeField.optional(),
  agency: stringish.optional(),
  classification: stringish.optional(),
  confidence: confidenceEnum.optional(),
  witnesses: z.array(stringish).optional(),
  geo: geoSchema.optional(),
  // `date` can be string, number (YAML 1947), or Date. Coerce to string.
  date: z.union([z.string(), z.number(), z.date()]).transform(String).optional(),
  dateRange: dateRangeSchema.optional(),
  summary: stringish.optional(),
  excerpt: stringish.optional(),
  heroAsset: heroAssetSchema.optional(),
};

const caseSchema = z.object({
  title: z.string().optional(),
  // Legacy field. Phase 6 `source` replaces this for new content, but extraction
  // sometimes leaves the old string in place. Permissive on purpose.
  origin_url: z.string().optional(),
  mirror_url: z.string().optional(),
  domain: z.string().optional(),
  date_ingested: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  source_date: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  case_date: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  publisher: z.string().optional(),
  tags: z.array(stringish).optional(),
  // Legacy entity list. Phase 6 also writes `entities`. Both kept for back-compat.
  entities_mentioned: z.array(stringish).optional(),
  // Legacy single-thread enum. Phase 6 also writes `threads[]`. Both kept.
  thread: z
    .enum(['1947-origin', '1948-49-hardening', '1949-50-disinfo', '1950s-1973-tail', 'pursue-2026'])
    .optional(),
  significance: z.enum(['high', 'medium', 'low']).optional(),
  evidence_urls: z.array(z.string()).optional(),
  related_cases: z.array(stringish).optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  ...phase6Fields,
});

const fbiCases = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/archive/fbi-62hq83894/cases',
  }),
  schema: caseSchema,
});

const pursueCases = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/archive/pursue-release-01/cases',
  }),
  schema: caseSchema,
});

const entities = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/archive/context',
  }),
  schema: z
    .object({
      title: z.string().optional(),
      publisher: z.string().optional(),
      tags: z.array(stringish).optional(),
      ...phase6Fields,
    })
    .passthrough(),
});

export const collections = {
  fbiCases,
  pursueCases,
  entities,
};
