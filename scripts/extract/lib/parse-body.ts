// Body parsers — extract structured data from the markdown body
// (everything after the YAML frontmatter). All deterministic, no AI.

export interface ParsedConnection {
  target: string;          // slug of the linked file (basename minus .md)
  text: string;            // link text as it appeared
  href: string;            // raw href
}

export interface ParsedBody {
  summary: string | null;          // first ## Summary section body, trimmed
  excerpt: string | null;          // first 2–3 sentences from summary
  connections: ParsedConnection[]; // links found under any "## Connections" heading
  quotes: string[];                // blockquotes from a "## Quotes Worth Keeping" section
  witnessNames: string[];          // heuristic name extraction from the body
}

/** Split frontmatter and body. Returns the body only (post-second `---`). */
export function bodyOf(raw: string): string {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return raw;
  return raw.slice(end + 4).replace(/^\s*\n/, '');
}

/** Pull the body of a named H2 section (## NAME). Returns content until the next H2 or EOF. */
function sectionBody(body: string, heading: RegExp): string | null {
  const lines = body.split('\n');
  let inSection = false;
  const buf: string[] = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (inSection) break;
      if (heading.test(line)) {
        inSection = true;
        continue;
      }
    }
    if (inSection) buf.push(line);
  }
  if (!inSection) return null;
  return buf.join('\n').trim() || null;
}

/** Extract the first paragraph (up to a blank line). */
function firstParagraph(text: string): string {
  const idx = text.indexOf('\n\n');
  return (idx === -1 ? text : text.slice(0, idx)).trim();
}

/** Pull the first 2–3 sentences from a paragraph as a one-line excerpt. */
function makeExcerpt(text: string, maxChars = 320): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  // Split on sentence boundaries but keep up to 3.
  const sentences = flat.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [flat];
  let out = '';
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const s = sentences[i].trim();
    if ((out + ' ' + s).trim().length > maxChars && i > 0) break;
    out = out ? `${out} ${s}` : s;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Trim a summary to ≤200 chars at a sentence boundary. */
function makeSummary(text: string, maxChars = 200): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= maxChars) return flat;
  const cut = flat.slice(0, maxChars);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > 80) return cut.slice(0, lastStop + 1).trim();
  // Fallback: cut at last space.
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Parse all `## Connections` H2 sections and pull markdown links targeting .md files. */
function extractConnections(body: string): ParsedConnection[] {
  const out: ParsedConnection[] = [];
  const lines = body.split('\n');
  let inConnections = false;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      inConnections = /^##\s+Connection/i.test(line);
      continue;
    }
    if (!inConnections) continue;
    LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK_RE.exec(line)) !== null) {
      const text = m[1].trim();
      const href = m[2].trim();
      // Only consider .md links — those are intra-archive references.
      if (!href.includes('.md')) continue;
      // Skip self-references to README/inventories.
      if (/README\.md$/i.test(href)) continue;
      if (/full-inventory\.md$/i.test(href)) continue;
      const base = href.split('/').pop()!.replace(/\.md.*$/, '');
      out.push({ target: base, text, href });
    }
  }
  // Dedupe by target.
  const seen = new Set<string>();
  return out.filter((c) => {
    if (seen.has(c.target)) return false;
    seen.add(c.target);
    return true;
  });
}

/** Pull blockquotes from "## Quotes Worth Keeping" — these become hero pull-quote candidates. */
function extractQuotes(body: string): string[] {
  const section = sectionBody(body, /^##\s+Quotes\s+Worth\s+Keeping/i);
  if (!section) return [];
  const out: string[] = [];
  const lines = section.split('\n');
  let buf: string[] = [];
  for (const line of lines) {
    if (line.startsWith('> ')) {
      buf.push(line.slice(2));
    } else if (buf.length > 0) {
      out.push(buf.join(' ').trim());
      buf = [];
    }
  }
  if (buf.length > 0) out.push(buf.join(' ').trim());
  return out.filter(Boolean);
}

/** Heuristic witness extraction — proper-noun sequences in capitalized form. Very conservative. */
function extractWitnesses(body: string, summary: string | null): string[] {
  // Only scan summary + first 1000 chars of body to avoid noise.
  const scan = (summary ?? '') + '\n' + body.slice(0, 1500);
  // Look for explicit witness-pattern phrases.
  const candidates = new Set<string>();
  const witnessPatterns: RegExp[] = [
    /witness(?:es)?\s+(?:include[ds]?|name[ds]?|identified\s+as)\s+([A-Z][A-Za-z. '-]+(?:,\s*[A-Z][A-Za-z. '-]+){0,3})/g,
    /interviewed\s+(?:by\s+\w+\s+)?([A-Z][A-Za-z. '-]+\s+[A-Z][A-Za-z. '-]+)/g,
  ];
  for (const re of witnessPatterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(scan)) !== null) {
      m[1].split(/\s*,\s*/).forEach((n) => {
        const trimmed = n.trim();
        if (trimmed.length > 3 && trimmed.length < 60) candidates.add(trimmed);
      });
    }
  }
  return Array.from(candidates);
}

export function parseBody(raw: string): ParsedBody {
  const body = bodyOf(raw);
  const summaryRaw = sectionBody(body, /^##\s+Summary/i) ?? sectionBody(body, /^##\s+What\s+It\s+Is/i);
  const summaryParagraph = summaryRaw ? firstParagraph(summaryRaw) : null;

  return {
    summary: summaryParagraph ? makeSummary(summaryParagraph) : null,
    excerpt: summaryParagraph ? makeExcerpt(summaryParagraph) : null,
    connections: extractConnections(body),
    quotes: extractQuotes(body),
    witnessNames: extractWitnesses(body, summaryParagraph),
  };
}
