// Shared dossier panel for /board (Agent 4) and /atlas (Agent 5).
// Contract: see DOSSIER_PANEL_CONTRACT.md at repo root.
//
// Renders the static Case Actions row at the bottom with `data-action` hooks.
// Agent 6 wires Cite / Share / Export popovers via event delegation after
// this lands. Save action wires to localStorage immediately as a toggle.
// Open Original is a stub link target for now.

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { EvidenceEdge, EvidenceNode } from '../types';

export interface DossierPanelProps {
  node: EvidenceNode;
  edges: EvidenceEdge[];
  relatedNodes: EvidenceNode[];
  onClose: () => void;
}

const SAVED_KEY = 'saved-cases';

function readSaved(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may throw on quota or disabled storage. Swallow.
  }
}

function useViewport() {
  const [w, setW] = useState<number>(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

function ConfidenceChip({ value }: { value: NonNullable<EvidenceNode['confidence']> }) {
  return (
    <span className={`dossier-chip dossier-chip--conf-${value}`}>
      <span className="dossier-chip__dot" aria-hidden="true" />
      {value}
    </span>
  );
}

function RelationshipChip({
  rel,
}: {
  rel: EvidenceEdge['type'];
}) {
  return (
    <span className={`dossier-rel-chip dossier-rel-chip--${rel}`}>
      {rel.replace(/_/g, ' ')}
    </span>
  );
}

function relationshipFor(
  edges: EvidenceEdge[],
  selfId: string,
  otherId: string
): EvidenceEdge | undefined {
  return edges.find(
    (e) =>
      (e.source === selfId && e.target === otherId) ||
      (e.target === selfId && e.source === otherId)
  );
}

export function DossierPanel({
  node,
  edges,
  relatedNodes,
  onClose,
}: DossierPanelProps) {
  const selectNode = useGraphStore((s) => s.selectNode);
  const width = useViewport();
  const mobile = width < 768;
  const ref = useRef<HTMLDivElement | null>(null);
  const titleId = `dossier-title-${node.id}`;

  // Saved-state toggle.
  const [savedIds, setSavedIds] = useState<string[]>(readSaved);
  const isSaved = savedIds.includes(node.id);
  const toggleSaved = useCallback(() => {
    setSavedIds((prev) => {
      const next = prev.includes(node.id)
        ? prev.filter((x) => x !== node.id)
        : [...prev, node.id];
      writeSaved(next);
      return next;
    });
  }, [node.id]);

  // Escape closes on desktop.
  useEffect(() => {
    if (mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobile, onClose]);

  // Focus the close button on mount for keyboard users.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>('[data-dossier-focus]');
    first?.focus();
  }, [node.id]);

  // Mobile sheet drag-to-dismiss.
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (!mobile) return;
    dragRef.current = {
      startY: e.touches[0]!.clientY,
      startTime: Date.now(),
    };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!mobile || !dragRef.current) return;
    const dy = e.changedTouches[0]!.clientY - dragRef.current.startY;
    const dt = Math.max(1, Date.now() - dragRef.current.startTime);
    const velocity = dy / dt;
    dragRef.current = null;
    if (dy > 60 || velocity > 0.5) onClose();
  };

  const dossierHref = useMemo(() => {
    if (node.collection === 'entities') return `/entity/${node.slug}`;
    return `/dossier/${node.slug}`;
  }, [node.collection, node.slug]);

  return (
    <>
      {mobile && (
        <div
          className="dossier-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={ref}
        role="dialog"
        aria-modal={mobile ? 'true' : 'false'}
        aria-labelledby={titleId}
        className={`dossier-panel ${mobile ? 'dossier-panel--mobile' : 'dossier-panel--desktop'}`}
        data-mode="dark"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {mobile && <div className="dossier-panel__grabber" aria-hidden="true" />}

        <header className="dossier-panel__header">
          <div className="dossier-panel__id-row">
            <span className="dossier-panel__case-id t-label">{node.id}</span>
            <button
              type="button"
              className="dossier-panel__close"
              aria-label="Close dossier panel"
              onClick={onClose}
              data-dossier-focus
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 2l10 10M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
              </svg>
            </button>
          </div>
          <h2 id={titleId} className="dossier-panel__title">
            {node.title}
          </h2>
        </header>

        <div className="dossier-panel__meta">
          {node.date && <span className="dossier-meta__date">{node.date}</span>}
          {node.agency && (
            <span className="dossier-meta__agency">{node.agency}</span>
          )}
          {node.classification && (
            <span className="dossier-meta__class">{node.classification}</span>
          )}
          {node.confidence && <ConfidenceChip value={node.confidence} />}
        </div>

        <div className="dossier-panel__body">
          {node.summary && (
            <p className="dossier-panel__summary">{node.summary}</p>
          )}
          {node.excerpt && (
            <details className="dossier-panel__excerpt">
              <summary>Read excerpt</summary>
              <p>{node.excerpt}</p>
            </details>
          )}

          {relatedNodes.length > 0 && (
            <div className="dossier-panel__related">
              <span className="t-label">Connected</span>
              <ul className="dossier-related-list">
                {relatedNodes.slice(0, 8).map((r) => {
                  const edge = relationshipFor(edges, node.id, r.id);
                  return (
                    <li key={r.id} className="dossier-related-row">
                      <button
                        type="button"
                        className="dossier-related-row__btn"
                        onClick={() => selectNode(r.id)}
                      >
                        <span className="dossier-related-row__case-id t-mono">
                          {r.id}
                        </span>
                        <span className="dossier-related-row__title">
                          {r.title}
                        </span>
                        {edge && <RelationshipChip rel={edge.type} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <a className="dossier-panel__cta" href={dossierHref}>
            Open Dossier <span aria-hidden="true">{'->'}</span>
          </a>
        </div>

        <footer className="dossier-panel__actions">
          <button
            type="button"
            data-action="save"
            className={`dossier-action ${isSaved ? 'is-active' : ''}`}
            aria-pressed={isSaved}
            onClick={toggleSaved}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={isSaved ? 'currentColor' : 'none'}>
              <path
                d="M3 2h10v12l-5-3-5 3z"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
            <span className="dossier-action__label">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button type="button" data-action="open" className="dossier-action">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M9 2h5v5M14 2L7 9M12 9v4H3V4h4"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
            <span className="dossier-action__label">Original</span>
          </button>
          <button type="button" data-action="cite" className="dossier-action">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4h4v4H3zM3 8c0 2 1 3 3 3M9 4h4v4H9zM9 8c0 2 1 3 3 3"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
            <span className="dossier-action__label">Cite</span>
          </button>
          <button type="button" data-action="share" className="dossier-action">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.25" />
              <path d="M6 7l4-3M6 9l4 3" stroke="currentColor" strokeWidth="1.25" />
            </svg>
            <span className="dossier-action__label">Share</span>
          </button>
          <button type="button" data-action="export" className="dossier-action">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M4 7l4 3 4-3M3 13h10"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
            <span className="dossier-action__label">Export</span>
          </button>
        </footer>
      </aside>
    </>
  );
}
