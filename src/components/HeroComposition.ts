/**
 * HeroComposition.ts
 *
 * Pure TypeScript module for the exploded-document hero composition.
 * DOM-agnostic. The same seeded RNG and layout solver back both:
 *  - the Astro <Hero> component (DOM-rendered satellites), and
 *  - an optional Canvas renderer for the homepage hero animation.
 *
 * Determinism: same `seed` (caseId or ISO week) always returns the same
 * layout. The same layout means no Cumulative Layout Shift between
 * client and server, and a stable visual identity per week / per case.
 */

export type SatelliteKind =
  | 'photo'
  | 'scan'
  | 'map'
  | 'witness'
  | 'agency'
  | 'evidence'
  | 'sighting';

export interface SatelliteInput {
  kind: SatelliteKind;
  eyebrow?: string;
  title: string;
  meta?: string;
  href?: string;
  src?: string;
  alt?: string;
}

export interface PlacedSatellite extends SatelliteInput {
  /** Percent-of-container coordinates. */
  x: number;
  y: number;
  rot: number;
  /** Amber-tack corner index: 0=tl, 1=tr, 2=bl, 3=br. */
  tack: 0 | 1 | 2 | 3;
  /** Parallax depth, 1..3 for non-zero satellites. */
  depth: number;
  /** Stagger animation delay in ms. */
  delay: number;
}

/** 32-bit FNV-1a hash. Deterministic across V8 and Node. */
export function hash32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 PRNG seeded from a 32-bit integer. Returns a function that
 * yields uniform doubles in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Anchor slots (percent of container). 6 slots laid out as a ring. */
export const ANCHOR_SLOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 8,  y: 18 },
  { x: 78, y: 12 },
  { x: 6,  y: 68 },
  { x: 80, y: 64 },
  { x: 42, y: 4  },
  { x: 44, y: 86 },
];

/**
 * Deterministically place up to 5 satellites around a center.
 * Same seed always yields the same arrangement.
 */
export function placeSatellites(
  satellites: ReadonlyArray<SatelliteInput>,
  seed: string
): PlacedSatellite[] {
  const rand = mulberry32(hash32(seed || 'fallback'));
  return satellites.slice(0, 5).map((sat, i) => {
    const slot = ANCHOR_SLOTS[i % ANCHOR_SLOTS.length];
    const jx = (rand() - 0.5) * 8;
    const jy = (rand() - 0.5) * 8;
    const rot = (rand() - 0.5) * 12;
    const tack = Math.floor(rand() * 4) as 0 | 1 | 2 | 3;
    const delay = Math.floor(rand() * 180);
    return {
      ...sat,
      x: slot.x + jx,
      y: slot.y + jy,
      rot,
      tack,
      depth: (i % 3) + 1,
      delay,
    };
  });
}

/**
 * Return the ISO 8601 week key for a Date, e.g. "2026-W19".
 * Used to rotate the homepage hero between anchor cases on a stable
 * weekly cadence, so a return visitor sees the same layout for the week.
 */
export function isoWeekKey(d: Date = new Date()): string {
  // Copy to avoid mutating the input.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number.
  // (Make Sunday = 7, per ISO).
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week =
    Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Pick a deterministic anchor case from a list, rotating by ISO week.
 * Same week always picks the same case. Different week picks the next.
 */
export function pickWeeklyAnchor<T>(items: ReadonlyArray<T>, now: Date = new Date()): T | undefined {
  if (items.length === 0) return undefined;
  const seed = hash32(isoWeekKey(now));
  return items[seed % items.length];
}

/**
 * Optional Canvas renderer. Draws soft-shadowed solid document silhouettes
 * with mono-caps Case ID labels. No textures, no scanlines, no grain.
 * Honors prefers-reduced-motion at the caller; this fn just renders one frame.
 */
export interface CanvasDrawOptions {
  /** Mono-caps eyebrow color (e.g. ink-muted token resolved by caller). */
  eyebrowColor: string;
  /** Card fill (e.g. bg-raised token). */
  cardFill: string;
  /** Card border (e.g. rule token). */
  cardBorder: string;
  /** Amber tack color. */
  tackColor: string;
  /** Verdigris string color. */
  stringColor: string;
  /** Title text color. */
  titleColor: string;
  /** Card width in pixels. */
  cardWidth: number;
  /** Card height in pixels. */
  cardHeight: number;
}

export function drawComposition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  placed: ReadonlyArray<PlacedSatellite>,
  opts: CanvasDrawOptions
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Verdigris strings from center to each satellite anchor.
  ctx.strokeStyle = opts.stringColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (const p of placed) {
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo((p.x / 100) * width + opts.cardWidth / 2, (p.y / 100) * height + 12);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cards.
  for (const p of placed) {
    const cx = (p.x / 100) * width;
    const cy = (p.y / 100) * height;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((p.rot * Math.PI) / 180);

    // Soft shadow.
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = opts.cardFill;
    ctx.strokeStyle = opts.cardBorder;
    ctx.lineWidth = 1;
    ctx.fillRect(0, 0, opts.cardWidth, opts.cardHeight);
    ctx.shadowColor = 'transparent';
    ctx.strokeRect(0, 0, opts.cardWidth, opts.cardHeight);

    // Eyebrow.
    if (p.eyebrow) {
      ctx.fillStyle = opts.eyebrowColor;
      ctx.font = '500 11px "Azeret Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(p.eyebrow.toUpperCase(), 12, 12);
    }

    // Title.
    ctx.fillStyle = opts.titleColor;
    ctx.font = '600 15px "Schibsted Grotesk", sans-serif';
    ctx.fillText(p.title.slice(0, 28), 12, 32);

    // Amber tack.
    const corners: Record<0 | 1 | 2 | 3, { x: number; y: number }> = {
      0: { x: 0, y: 0 },
      1: { x: opts.cardWidth, y: 0 },
      2: { x: 0, y: opts.cardHeight },
      3: { x: opts.cardWidth, y: opts.cardHeight },
    };
    const c = corners[p.tack];
    ctx.fillStyle = opts.tackColor;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}
