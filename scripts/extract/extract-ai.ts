/**
 * AI gap-fill extractor via OpenRouter.
 *
 * Reads every .md case + entity file under content/archive/, identifies which
 * required-or-recommended fields the deterministic pass left empty, and asks
 * a model to fill ONLY those fields from the body. Merges the response back
 * into frontmatter without overwriting any existing value (unless --force).
 *
 * Provider: OpenRouter (NOT Anthropic SDK).
 * Model:    openrouter/owl-alpha
 * Env var:  OPENROUTER_API_KEY
 *
 * Run:   npx tsx scripts/extract/extract-ai.ts [--force] [--dry-run] [--limit=N]
 *
 * Conservative: never invents witness names, requires exact source paragraph
 * quotes, skips files where target fields are already populated.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import { collectCorpus, type CorpusFile } from './lib/walk.js';
import { bodyOf } from './lib/parse-body.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVE = path.join(REPO_ROOT, 'content', 'archive');

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  return arg ? parseInt(arg.split('=')[1], 10) : Number.POSITIVE_INFINITY;
})();

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openrouter/owl-alpha';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// Conservative throttle: 1 req/sec.
const MIN_REQ_INTERVAL_MS = 1000;
let lastReqAt = 0;

interface AIResponse {
  witnesses?: string[];
  agency?: string;
  classification?: string;
  nodeType?: string;
  summary?: string;
  excerpt?: string;
  date?: string;
  geo?: { placeName?: string };
  notes?: string;
}

const TARGET_FIELDS_CASE = [
  'witnesses',
  'agency',
  'classification',
  'summary',
  'excerpt',
  'date',
] as const;

const TARGET_FIELDS_ENTITY = [
  'summary',
  'excerpt',
  'nodeType',
] as const;

interface Stats {
  total: number;
  examined: number;
  skipped: number;
  apiCalls: number;
  patched: number;
  rateLimited: number;
  errors: number;
  byField: Record<string, number>;
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  return false;
}

function missingFieldsFor(
  data: Record<string, unknown>,
  collection: CorpusFile['collection'],
): string[] {
  const targets = collection === 'entities' ? TARGET_FIELDS_ENTITY : TARGET_FIELDS_CASE;
  const out: string[] = [];
  for (const f of targets) {
    if (isEmpty(data[f])) out.push(f);
  }
  return out;
}

async function throttle(): Promise<void> {
  const now = Date.now();
  const dt = now - lastReqAt;
  if (dt < MIN_REQ_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_REQ_INTERVAL_MS - dt));
  }
  lastReqAt = Date.now();
}

/** Extract first {...} JSON block from any model output, including reasoning leakage. */
function extractJSON(text: string): AIResponse | null {
  if (!text) return null;
  const stripped = text.trim();
  try {
    return JSON.parse(stripped) as AIResponse;
  } catch {
    /* fall through */
  }
  // Try fenced ```json blocks.
  const fenced = stripped.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]) as AIResponse;
    } catch {
      /* fall through */
    }
  }
  // First { to last }.
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(stripped.slice(first, last + 1)) as AIResponse;
    } catch {
      return null;
    }
  }
  return null;
}

function buildPrompt(
  collection: CorpusFile['collection'],
  slug: string,
  existing: Record<string, unknown>,
  body: string,
  missing: string[],
): { system: string; user: string } {
  const fieldSpec: Record<string, string> = {
    witnesses: 'string[] — exact names of named witnesses cited in the body. Never invent. Omit if none are explicitly named.',
    agency: 'string — primary issuing agency (e.g. "FBI", "CIA", "Air Force", "AARO", "OSI", "PURSUE"). Omit if unclear.',
    classification: 'string — current classification status ("Declassified", "FOIA-Released", "Pre-Release", etc.).',
    nodeType: 'one of: "document"|"witness"|"agency"|"location"|"event"|"sighting"|"contradiction"|"media"|"classification"|"person"|"program"|"concept". Omit if unclear.',
    summary: 'string ≤200 chars — neutral one-sentence summary derived ONLY from explicit body content.',
    excerpt: 'string 2-3 sentences — slightly longer neutral summary from explicit body content.',
    date: 'string ISO-like (YYYY-MM-DD or YYYY-MM or YYYY) — primary date referenced in the document. Omit if unclear.',
  };

  const askedFor = missing.map((f) => `- "${f}": ${fieldSpec[f] ?? 'see schema'}`).join('\n');

  const system = `You extract verifiable metadata from declassified UFO archive documents.

CRITICAL OUTPUT RULES:
- Your reply MUST start with \`{\` and end with \`}\`.
- Do NOT write any prose, reasoning, preamble, or explanation before or after the JSON.
- Do NOT wrap the JSON in markdown code fences.
- Output ONLY a JSON object with the requested fields filled.

CONTENT RULES:
- Extract verifiable metadata ONLY. If a field is unclear, OMIT it from the output.
- NEVER invent witness names. Only include witnesses explicitly named in the body.
- Neutral, factual tone. No speculation.
- All values must be grounded in the supplied body text.`;

  const user = `Collection: ${collection}
Slug: ${slug}
Existing frontmatter (do not change):
${JSON.stringify(existing, null, 2)}

Body (authoritative source for extraction):
${body.slice(0, 8000)}

Return a JSON object filling ONLY these missing fields (omit any field you cannot verify from the body):
${askedFor}`;

  return { system, user };
}

async function callModel(
  system: string,
  user: string,
  attempt = 1,
): Promise<AIResponse | null> {
  if (!API_KEY) throw new Error('OPENROUTER_API_KEY not set');

  await throttle();

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://theufofiles.com',
        'X-Title': 'the-ufo-files-extraction',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });
  } catch (err) {
    console.log(`     network error: ${(err as Error).message}`);
    return null;
  }

  if (res.status === 429 || res.status === 503) {
    if (attempt >= 4) return null;
    const backoff = 2000 * Math.pow(2, attempt - 1);
    console.log(`     rate limited (${res.status}), backing off ${backoff}ms`);
    await new Promise((r) => setTimeout(r, backoff));
    return callModel(system, user, attempt + 1);
  }
  if (!res.ok) {
    const txt = await res.text();
    console.log(`     HTTP ${res.status}: ${txt.slice(0, 200)}`);
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null; reasoning?: string; reasoning_content?: string } }>;
  };
  const msg = data.choices?.[0]?.message;
  if (!msg) return null;
  let content: string | null | undefined = msg.content;
  if (!content) content = msg.reasoning ?? msg.reasoning_content ?? '';
  if (!content) return null;
  return extractJSON(content);
}

function mergePatch(
  data: Record<string, unknown>,
  patch: AIResponse,
  missing: string[],
  stats: Stats,
): boolean {
  let changed = false;
  for (const f of missing) {
    const v = (patch as Record<string, unknown>)[f];
    if (isEmpty(v)) continue;
    if (!FORCE && !isEmpty(data[f])) continue;
    // Conservative type/sanity checks.
    if (f === 'witnesses') {
      if (!Array.isArray(v)) continue;
      const clean = (v as unknown[])
        .map((x) => String(x).trim())
        .filter((s) => s.length > 2 && s.length < 80);
      if (clean.length === 0) continue;
      data[f] = clean;
    } else if (f === 'summary') {
      const s = String(v).trim();
      data[f] = s.length > 220 ? s.slice(0, 200).trim() + '…' : s;
    } else {
      data[f] = typeof v === 'string' ? String(v).trim() : v;
    }
    stats.byField[f] = (stats.byField[f] ?? 0) + 1;
    changed = true;
  }
  return changed;
}

async function processFile(file: CorpusFile, stats: Stats): Promise<void> {
  const raw = await fs.readFile(file.absPath, 'utf8');
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (err) {
    console.log(`  ! [${file.collection.padEnd(11)}] ${file.slug}  SKIPPED frontmatter parse: ${(err as Error).message.split('\n')[0]}`);
    stats.skipped++;
    return;
  }
  const data: Record<string, unknown> = { ...parsed.data };
  const missing = missingFieldsFor(data, file.collection);
  if (missing.length === 0) {
    stats.skipped++;
    return;
  }
  stats.examined++;
  const body = bodyOf(raw);
  if (body.trim().length < 80) {
    console.log(`  · [${file.collection.padEnd(11)}] ${file.slug}  body too short`);
    return;
  }

  const { system, user } = buildPrompt(file.collection, file.slug, data, body, missing);

  let patch: AIResponse | null = null;
  try {
    patch = await callModel(system, user);
    stats.apiCalls++;
  } catch (err) {
    console.log(`  ! [${file.collection.padEnd(11)}] ${file.slug}  ERROR: ${(err as Error).message}`);
    stats.errors++;
    return;
  }
  if (!patch) {
    console.log(`  ? [${file.collection.padEnd(11)}] ${file.slug}  no parseable response`);
    stats.rateLimited++;
    return;
  }

  const changed = mergePatch(data, patch, missing, stats);
  if (!changed) {
    console.log(`  · [${file.collection.padEnd(11)}] ${file.slug}  nothing usable returned`);
    return;
  }

  const newContent = matter.stringify(parsed.content, data, { language: 'yaml' });
  if (!DRY_RUN) {
    await fs.writeFile(file.absPath, newContent, 'utf8');
  }
  stats.patched++;
  console.log(`  + [${file.collection.padEnd(11)}] ${file.slug}  filled: ${missing.filter((m) => !isEmpty((patch as Record<string, unknown>)[m])).join(', ')}`);
}

async function main(): Promise<void> {
  console.log('━━━ AI GAP-FILL EXTRACTION ━━━');
  console.log(`Archive: ${ARCHIVE}`);
  console.log(`Model:   ${MODEL}`);
  console.log(`Mode:    ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}${FORCE ? ' + FORCE' : ''}`);
  console.log('');

  if (!API_KEY) {
    console.error('OPENROUTER_API_KEY is not set. Aborting.');
    process.exit(1);
  }

  const corpus = await collectCorpus(ARCHIVE);
  console.log(`Found ${corpus.length} files.`);
  console.log('');

  const stats: Stats = {
    total: corpus.length,
    examined: 0,
    skipped: 0,
    apiCalls: 0,
    patched: 0,
    rateLimited: 0,
    errors: 0,
    byField: {},
  };

  let processed = 0;
  for (const f of corpus) {
    if (processed >= LIMIT) break;
    await processFile(f, stats);
    processed++;
  }

  console.log('');
  console.log('━━━ RESULTS ━━━');
  console.log(`Total files:      ${stats.total}`);
  console.log(`Examined (gaps):  ${stats.examined}`);
  console.log(`Skipped (full):   ${stats.skipped}`);
  console.log(`API calls:        ${stats.apiCalls}`);
  console.log(`Patched:          ${stats.patched}`);
  console.log(`Rate limited:     ${stats.rateLimited}`);
  console.log(`Errors:           ${stats.errors}`);
  console.log('Field hits:');
  for (const [k, v] of Object.entries(stats.byField).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(18)} ${v}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
