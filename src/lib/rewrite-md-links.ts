/**
 * rehype plugin: rewrite relative .md links in archive content to site URLs.
 *
 * Cases: any path ending in <slug>.md that we know about → /dossier/<slug>
 * Context entities: <name>.md → /entity/<name>
 * Coverage: <slug>.md (PURSUE press) → /dossier/<slug>
 * Anything else → GitHub mirror.
 *
 * Slug discovery walks the archive content dirs at module-load. Paths are
 * resolved against this file's own location, NOT process.cwd(), because vite/astro
 * may load the plugin from a worker context where cwd is unreliable.
 */

import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_BLOB = 'https://github.com/wretcher207/the-ufo-files/blob/main/';

// Resolve archive dirs relative to this file: src/lib/rewrite-md-links.ts → ../../content/archive
const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE_ROOT = resolve(HERE, '..', '..', 'content', 'archive');

function loadSlugs(rel: string): Set<string> {
  const out = new Set<string>();
  const dir = resolve(ARCHIVE_ROOT, rel);
  if (!existsSync(dir)) return out;
  try {
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.md')) out.add(f.replace(/\.md$/, ''));
    }
  } catch {}
  return out;
}

const CASE_SLUGS = new Set<string>([
  ...loadSlugs('fbi-62hq83894/cases'),
  ...loadSlugs('pursue-release-01/cases'),
  ...loadSlugs('pursue-release-01/coverage'),
]);
const ENTITY_SLUGS = loadSlugs('context');

// Self-check at module load — helpful for debugging silent path issues.
if (CASE_SLUGS.size === 0) {
  console.warn('[rewrite-md-links] No case slugs discovered. Looked in:', ARCHIVE_ROOT);
} else {
  console.log(`[rewrite-md-links] Discovered ${CASE_SLUGS.size} case slugs and ${ENTITY_SLUGS.size} entity slugs.`);
}

export function rewriteMdLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      // DEBUG: log every link the plugin sees.
      if (!href.endsWith('.md')) return;
      if (/^https?:\/\//i.test(href)) return;

      const clean = href.replace(/^(\.\.?\/)+/, '');

      // Explicit cases/ path:
      let m = clean.match(/(?:^|\/)cases\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/dossier/${m[1]}`;
        return;
      }
      m = clean.match(/(?:^|\/)context\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/entity/${m[1]}`;
        return;
      }
      m = clean.match(/(?:^|\/)coverage\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/dossier/${m[1]}`;
        return;
      }

      // Bare slug.md sibling reference (very common in case prose).
      m = clean.match(/^([^/]+)\.md$/);
      if (m) {
        const slug = m[1];
        if (CASE_SLUGS.has(slug)) {
          node.properties!.href = `/dossier/${slug}`;
          return;
        }
        if (ENTITY_SLUGS.has(slug)) {
          node.properties!.href = `/entity/${slug}`;
          return;
        }
      }

      // Fallback: link to the file in the GitHub mirror so we never 404.
      node.properties!.href = REPO_BLOB + clean;
      const rel = (node.properties!.rel as string[] | undefined) ?? [];
      node.properties!.rel = Array.from(new Set([...rel, 'noopener', 'external']));
      node.properties!.target = '_blank';
    });
  };
}
