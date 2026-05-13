/**
 * rehype plugin: rewrite relative .md links in archive content to site URLs.
 *
 * Archive markdown uses paths like:
 *   [Apollo 17 VM6](pursue-release-01/cases/apollo-17-vm6.md)
 *   [Kenneth Arnold](../cases/kenneth-arnold-cascade-1947.md)
 *   [AARO](../context/aaro.md)
 *
 * Map to:
 *   /dossier/apollo-17-vm6
 *   /dossier/kenneth-arnold-cascade-1947
 *   /entity/aaro
 *
 * Anything else (raw OCR, inventory, README) becomes a github.com link
 * back to the the-ufo-files repo so we don't 404.
 */

import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

const REPO_BLOB = 'https://github.com/wretcher207/the-ufo-files/blob/main/';

export function rewriteMdLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      if (!href.endsWith('.md')) return;
      if (/^https?:\/\//i.test(href)) return;

      // Normalize the path: drop leading "./" and "../" segments.
      const clean = href.replace(/^(\.\.?\/)+/, '');

      // Cases:
      let m = clean.match(/(?:^|\/)cases\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/dossier/${m[1]}`;
        return;
      }

      // Context (entities/concepts):
      m = clean.match(/(?:^|\/)context\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/entity/${m[1]}`;
        return;
      }

      // Coverage (PURSUE press):
      m = clean.match(/(?:^|\/)coverage\/([^/]+)\.md$/);
      if (m) {
        node.properties!.href = `/dossier/${m[1]}`;
        return;
      }

      // Fallback: link to the file in the GitHub mirror so we never 404.
      node.properties!.href = REPO_BLOB + clean;
      const rel = (node.properties!.rel as string[] | undefined) ?? [];
      node.properties!.rel = Array.from(new Set([...rel, 'noopener', 'external']));
      node.properties!.target = '_blank';
    });
  };
}
