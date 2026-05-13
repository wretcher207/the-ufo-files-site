import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Tags and entities arrive as YAML — bare integers (1947) parse as numbers.
// Coerce array members to strings so we can rely on string ops downstream.
const stringish = z.union([z.string(), z.number(), z.boolean()]).transform(String);

const caseSchema = z.object({
  title: z.string().optional(),
  source: z.string().optional(),
  origin_url: z.string().optional(),
  mirror_url: z.string().optional(),
  domain: z.string().optional(),
  date_ingested: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  source_date: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  case_date: z.union([z.string(), z.date(), z.number().transform(String)]).optional(),
  publisher: z.string().optional(),
  tags: z.array(stringish).optional(),
  entities_mentioned: z.array(stringish).optional(),
  // New fields driving the site:
  thread: z
    .enum(['1947-origin', '1948-49-hardening', '1949-50-disinfo', '1950s-1973-tail', 'pursue-2026'])
    .optional(),
  significance: z.enum(['high', 'medium', 'low']).optional(),
  evidence_urls: z.array(z.string()).optional(),
  related_cases: z.array(stringish).optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
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
  schema: z.object({
    title: z.string().optional(),
    publisher: z.string().optional(),
    tags: z.array(stringish).optional(),
  }).passthrough(),
});

export const collections = {
  fbiCases,
  pursueCases,
  entities,
};
