import fs from 'node:fs/promises';
import path from 'node:path';

export interface CorpusFile {
  collection: 'fbiCases' | 'pursueCases' | 'entities';
  absPath: string;
  relPath: string;          // relative to archive root
  slug: string;             // filename without .md
}

export async function* walkMarkdown(
  archiveRoot: string,
  collection: CorpusFile['collection'],
  subdir: string,
): AsyncGenerator<CorpusFile> {
  const startDir = path.join(archiveRoot, subdir);

  async function* walk(dir: string): AsyncGenerator<string> {
    let entries: import('node:fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        yield* walk(full);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        // Skip README-like content; we only want cases/entities.
        if (e.name === 'README.md') continue;
        if (e.name === 'full-inventory.md') continue;
        yield full;
      }
    }
  }

  for await (const full of walk(startDir)) {
    yield {
      collection,
      absPath: full,
      relPath: path.relative(archiveRoot, full).replace(/\\/g, '/'),
      slug: path.basename(full, '.md'),
    };
  }
}

export async function collectCorpus(archiveRoot: string): Promise<CorpusFile[]> {
  const out: CorpusFile[] = [];
  for await (const f of walkMarkdown(archiveRoot, 'fbiCases', 'fbi-62hq83894/cases')) out.push(f);
  for await (const f of walkMarkdown(archiveRoot, 'pursueCases', 'pursue-release-01/cases')) out.push(f);
  for await (const f of walkMarkdown(archiveRoot, 'entities', 'context')) out.push(f);
  return out;
}
