// Top-level React component for /board.
//
// Receives the build-time graph from board.astro and hosts the React Flow
// canvas, custom node types, custom edges, the mini-map, the layout switcher,
// and the shared DossierPanel.
//
// Mobile (< 768px) is rendered by BoardMobile.tsx, a purpose-built card
// stack with connection rail. We branch at the top of this component.

import '@xyflow/react/dist/style.css';
import './board.css';

import * as React from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGraphStore, type LayoutMode } from '../store/graphStore';
import type { EvidenceEdge, EvidenceGraph, EvidenceNode } from '../types';
import { elkLayout, type LayoutPosition } from '../layout/elkLayout';
import { forceLayout, manualLayout, timelineLayout } from '../layout/forceLayout';
import { DossierPanel } from './DossierPanel';
import { EvidenceEdge as EvidenceEdgeComponent } from './edges/EvidenceEdge';
import { AgencyNode } from './nodes/AgencyNode';
import { ContradictionNode } from './nodes/ContradictionNode';
import { DocumentNode } from './nodes/DocumentNode';
import { EventNode } from './nodes/EventNode';
import { LocationNode } from './nodes/LocationNode';
import { SightingNode } from './nodes/SightingNode';
import { WitnessNode } from './nodes/WitnessNode';
import { BoardMobile } from './BoardMobile';

export interface InvestigationBoardProps {
  graph: EvidenceGraph;
  initialFocusId?: string | null;
}

const nodeTypes = {
  document: DocumentNode,
  witness: WitnessNode,
  agency: AgencyNode,
  location: LocationNode,
  event: EventNode,
  sighting: SightingNode,
  contradiction: ContradictionNode,
  // Map media + classification to the document silhouette so every node has
  // a renderer. They can specialize later.
  media: DocumentNode,
  classification: DocumentNode,
};

const edgeTypes = {
  evidence: EvidenceEdgeComponent,
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function toRFEdge(e: EvidenceEdge): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'evidence',
    data: {
      relationship: e.type,
      confidence: e.confidence,
      explanation: e.explanation,
    },
  };
}

function toRFNode(n: EvidenceNode, pos: LayoutPosition): Node {
  return {
    id: n.id,
    type: n.type,
    position: { x: pos.x, y: pos.y },
    data: n as unknown as Record<string, unknown>,
  };
}

function nodesById(nodes: EvidenceNode[]): Map<string, EvidenceNode> {
  return new Map(nodes.map((n) => [n.id, n]));
}

function useViewportWidth() {
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

function BoardCanvas({ graph, initialFocusId }: InvestigationBoardProps) {
  const layoutMode = useGraphStore((s) => s.layoutMode);
  const setLayout = useGraphStore((s) => s.setLayout);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const clearSelection = useGraphStore((s) => s.clearSelection);

  const reduced = prefersReducedMotion();
  // Reduced motion uses ELK static only.
  const effectiveLayout: LayoutMode = reduced ? 'elk' : layoutMode;

  const [positions, setPositions] = useState<Map<string, LayoutPosition>>(() => {
    const initial = manualLayout(graph.nodes);
    return new Map(initial.map((p) => [p.id, p]));
  });

  // Recompute positions when layout mode changes. ELK is async.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      let next: LayoutPosition[];
      if (effectiveLayout === 'elk') {
        next = await elkLayout(graph.nodes, graph.edges);
      } else if (effectiveLayout === 'force') {
        next = forceLayout(graph.nodes, graph.edges);
      } else if (effectiveLayout === 'timeline') {
        next = timelineLayout(graph.nodes);
      } else {
        next = manualLayout(graph.nodes);
      }
      if (cancelled) return;
      setPositions(new Map(next.map((p) => [p.id, p])));
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [effectiveLayout, graph.nodes, graph.edges]);

  const rfNodes = useMemo<Node[]>(() => {
    return graph.nodes.map((n) => {
      const pos = positions.get(n.id) ?? { id: n.id, x: 0, y: 0 };
      const node = toRFNode(n, pos);
      if (n.id === selectedNodeId) node.selected = true;
      return node;
    });
  }, [graph.nodes, positions, selectedNodeId]);

  const rfEdges = useMemo<Edge[]>(() => {
    return graph.edges.map(toRFEdge);
  }, [graph.edges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const { fitView, setCenter } = useReactFlow();

  // Honor ?focus=<nodeId> on first mount.
  const focusedRef = useRef(false);
  useEffect(() => {
    if (focusedRef.current) return;
    if (!initialFocusId) return;
    const pos = positions.get(initialFocusId);
    if (!pos) return;
    focusedRef.current = true;
    selectNode(initialFocusId);
    // Center after positions settle.
    requestAnimationFrame(() => {
      setCenter(pos.x + 90, pos.y + 50, { zoom: 1.0, duration: reduced ? 0 : 400 });
    });
  }, [initialFocusId, positions, selectNode, setCenter, reduced]);

  const byId = useMemo(() => nodesById(graph.nodes), [graph.nodes]);
  const selectedNode = selectedNodeId ? byId.get(selectedNodeId) : undefined;
  const selectedEdges = useMemo<EvidenceEdge[]>(() => {
    if (!selectedNodeId) return [];
    return graph.edges.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
  }, [graph.edges, selectedNodeId]);
  const relatedNodes = useMemo<EvidenceNode[]>(() => {
    if (!selectedNodeId) return [];
    const seen = new Set<string>();
    const out: EvidenceNode[] = [];
    for (const e of selectedEdges) {
      const otherId = e.source === selectedNodeId ? e.target : e.source;
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const other = byId.get(otherId);
      if (other) out.push(other);
    }
    return out;
  }, [selectedEdges, selectedNodeId, byId]);

  const atlasHref = selectedNodeId
    ? `/atlas?focus=${encodeURIComponent(selectedNodeId)}`
    : '/atlas';

  return (
    <div className="board-root">
      <div className="board-toolbar" role="toolbar" aria-label="Board controls">
        <fieldset className="board-toolbar__layout">
          <legend className="t-label">Layout</legend>
          {(['manual', 'elk', 'force', 'timeline'] as LayoutMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`board-toolbar__btn ${effectiveLayout === m ? 'is-active' : ''}`}
              aria-pressed={effectiveLayout === m}
              onClick={() => setLayout(m)}
              disabled={reduced && m !== 'elk'}
              title={
                reduced && m !== 'elk'
                  ? 'Reduced motion is enabled; static ELK only'
                  : undefined
              }
            >
              {m}
            </button>
          ))}
        </fieldset>

        <button
          type="button"
          className="board-toolbar__btn"
          onClick={() => fitView({ padding: 0.2, duration: reduced ? 0 : 300 })}
        >
          Fit
        </button>

        <a className="board-toolbar__link" href={atlasHref}>
          View in Atlas <span aria-hidden="true">{'->'}</span>
        </a>
      </div>

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="var(--rule)"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => '#ffffff'}
          maskColor="rgba(0, 0, 0, 0.85)"
          style={{
            background: '#000000',
            border: '1px solid #ffffff',
            borderRadius: 0,
          }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>

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

export function InvestigationBoard({
  graph,
  initialFocusId,
}: InvestigationBoardProps) {
  const width = useViewportWidth();
  if (width < 768) {
    return <BoardMobile graph={graph} initialFocusId={initialFocusId} />;
  }
  return (
    <ReactFlowProvider>
      <BoardCanvas graph={graph} initialFocusId={initialFocusId} />
    </ReactFlowProvider>
  );
}

export default InvestigationBoard;
