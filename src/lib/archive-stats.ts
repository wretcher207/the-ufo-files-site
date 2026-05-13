/**
 * Build-time archive stats. Computed once per build, cached in module scope.
 * Surfaced in operator chrome, footer, and homepage section anchors so the
 * site reads as a live database, not a static brochure.
 */
import { execSync } from 'node:child_process';
import { getAllCases, getRenderableCases } from './case-utils';
import { THREADS } from './threads';

export interface ArchiveStats {
  totalCases: number;
  renderableCases: number;
  fbiCount: number;
  pursueCount: number;
  threadCount: number;
  coveragePct: number;
  buildDate: string;       // 2026-05-13
  buildIso: string;        // 2026-05-13 21:48Z
  commitHash: string;      // 7-char short hash or 'local'
  branch: string;          // 'phase-6-redesign' or 'local'
  releaseDate: string;     // PURSUE release date, fixed
}

let cached: ArchiveStats | null = null;

export async function getArchiveStats(): Promise<ArchiveStats> {
  if (cached) return cached;

  const all = await getAllCases();
  const renderable = await getRenderableCases();
  const fbiCount = renderable.filter((c) => (c.collection as string) === 'fbiCases').length;
  const pursueCount = renderable.filter((c) => (c.collection as string) === 'pursueCases').length;

  const now = new Date();
  const buildDate = now.toISOString().slice(0, 10);
  const buildIso = `${buildDate} ${now.toISOString().slice(11, 16)}Z`;

  let commitHash = 'local';
  let branch = 'local';
  try {
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    /* git unavailable, leave defaults */
  }

  const denominator = all.length || renderable.length;
  const coveragePct = denominator === 0 ? 0 : Math.round((renderable.length / denominator) * 100);

  cached = {
    totalCases: renderable.length,
    renderableCases: renderable.length,
    fbiCount,
    pursueCount,
    threadCount: THREADS.length,
    coveragePct,
    buildDate,
    buildIso,
    commitHash,
    branch,
    releaseDate: '2026-05-08',
  };
  return cached;
}
