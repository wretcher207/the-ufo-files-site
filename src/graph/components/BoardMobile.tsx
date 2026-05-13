// Mobile-purpose-built board.
//
// One node per card. Vertical scroll through the stack. A horizontal
// connection rail under each card lists outgoing relationships as chips.
// Tap a chip to advance to that node (we re-center the stack on it).
//
// This is NOT a responsive shrink of the desktop canvas. No React Flow
// here; it's a plain scrollable list. Same DossierPanel surfaces as a
// bottom sheet when the user opens a card for full detail.

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { EvidenceEdge, EvidenceGraph, EvidenceNode } from '../types';
import { DossierPanel } from './DossierPanel';

export interface BoardMobileProps {
  graph: EvidenceGraph;
  initialFocusId?: string | null;
}

function edgesFor(edges: EvidenceEdge[], id: string): EvidenceEdge[] {
  return edges.filter((e) => e.source === id || e.target === id);
}

export function BoardMobile({ graph, initialFocusId }: BoardMobileProps) {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const clearSelection = useGraphStore((s) => s.clearSelection);

  const byId = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  // Stack order: we promote selected/focused node to the top so it's the
  // first thing visible. Everything else keeps its original order.
  const [activeId, setActiveId] = useState<string | null>(
    initialFocusId ?? null
  );

  const stack = useMemo(() => {
    if (!activeId) return graph.nodes;
    const promoted = byId.get(activeId);
    if (!promoted) return graph.nodes;
    return [promoted, ...graph.nodes.filter((n) => n.id !== activeId)];
  }, [graph.nodes, activeId, byId]);

  const onAdvance = useCallback(
    (id: string) => {
      setActiveId(id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const selectedNode = selectedNodeId ? byId.get(selectedNodeId) : undefined;
  const selectedEdges = selectedNodeId
    ? edgesFor(graph.edges, selectedNodeId)
    : [];
  const relatedNodes: EvidenceNode[] = useMemo(() => {
    if (!selectedNodeId) return [];
    const out: EvidenceNode[] = [];
    const seen = new Set<string>();
    for (const e of selectedEdges) {
      const otherId = e.source === selectedNodeId ? e.target : e.source;
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const other = byId.get(otherId);
      if (other) out.push(other);
    }
    return out;
  }, [selectedEdges, selectedNodeId, byId]);

  // Sync activeId from store selection too.
  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== activeId) {
      setActiveId(selectedNodeId);
    }
  }, [selectedNodeId, activeId]);

  return (
    <div className="board-mobile">
      <div className="board-mobile__header">
        <span className="t-label">Investigation</span>
        <a className="board-mobile__atlas-link" href="/atlas">
          Atlas <span aria-hidden="true">{'->'}</span>
        </a>
      </div>

      <ul className="board-mobile__stack" role="list">
        {stack.map((n) => {
          const connections = edgesFor(graph.edges, n.id);
          return (
            <li key={n.id} className="board-mobile__card-wrap">
              <button
                type="button"
                className="board-mobile__card"
                onClick={() => selectNode(n.id)}
                aria-haspopup="dialog"
              >
                <span className="board-mobile__card-id t-label">{n.id}</span>
                <span className="board-mobile__card-title">{n.title}</span>
                {n.summary && (
                  <span className="board-mobile__card-summary">
                    {n.summary}
                  </span>
                )}
                <span className="board-mobile__card-meta t-mono">
                  {n.type}
                  {n.date ? ` · ${n.date}` : ''}
                  {n.confidence ? ` · ${n.confidence}` : ''}
                </span>
              </button>

              {connections.length > 0 && (
                <ConnectionRail
                  edges={connections}
                  selfId={n.id}
                  byId={byId}
                  onAdvance={onAdvance}
                />
              )}
            </li>
          );
        })}
      </ul>

      {selectedNode && (
        <DossierPanel
          node={selectedNode}
          edges={selectedEdges}
          relatedNodes={relatedNodes}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}

function ConnectionRail({
  edges,
  selfId,
  byId,
  onAdvance,
}: {
  edges: EvidenceEdge[];
  selfId: string;
  byId: Map<string, EvidenceNode>;
  onAdvance: (id: string) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={railRef}
      className="board-mobile__rail"
      role="list"
      aria-label="Connections"
    >
      {edges.map((e) => {
        const otherId = e.source === selfId ? e.target : e.source;
        const other = byId.get(otherId);
        if (!other) return null;
        return (
          <button
            key={e.id}
            type="button"
            className={`board-mobile__chip board-mobile__chip--${e.type}`}
            onClick={() => onAdvance(otherId)}
          >
            <span className="board-mobile__chip-rel">
              {e.type.replace(/_/g, ' ')}
            </span>
            <span className="board-mobile__chip-target">{other.title}</span>
          </button>
        );
      })}
    </div>
  );
}
