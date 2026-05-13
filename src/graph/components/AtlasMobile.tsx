// Phase 6 /atlas mobile variant. Sigma still renders the full corpus but the
// chrome rearranges around touch: sticky search bar on top, single-button
// filter sheet, bottom-sheet DossierPanel. Tap-radius (~40px) snaps the
// nearest visible node into selection.

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import { useGraphStore } from '../store/graphStore';
import type {
  Confidence,
  EvidenceEdge,
  EvidenceNode,
  EvidenceNodeType,
  EvidenceRelationship,
} from '../types';
import { DossierPanel } from './DossierPanel';

const NODE_TYPE_LABELS: Record<EvidenceNodeType, string> = {
  document: 'Document',
  witness: 'Witness',
  agency: 'Agency',
  location: 'Location',
  event: 'Event',
  sighting: 'Sighting',
  contradiction: 'Contradiction',
  media: 'Media',
  classification: 'Classification',
};

const CONFIDENCES: Confidence[] = ['low', 'medium', 'high'];

function readTokens() {
  if (typeof window === 'undefined') {
    return { amber: '#E8A857', verdigris: '#5C8474', inkPrimary: '#F2EBE0', inkSecondary: '#A89B8C', inkMuted: '#6B6358', rule: '#2A251F', bgBase: '#0F0D0B' };
  }
  const css = getComputedStyle(document.documentElement);
  const v = (k: string, fb: string) => (css.getPropertyValue(k).trim() || fb);
  return {
    amber: v('--accent-amber', '#E8A857'),
    verdigris: v('--accent-verdigris', '#5C8474'),
    inkPrimary: v('--ink-primary', '#F2EBE0'),
    inkSecondary: v('--ink-secondary', '#A89B8C'),
    inkMuted: v('--ink-muted', '#6B6358'),
    rule: v('--rule', '#2A251F'),
    bgBase: v('--bg-base', '#0F0D0B'),
  };
}

function colorForNodeType(t: EvidenceNodeType, k: ReturnType<typeof readTokens>): string {
  switch (t) {
    case 'document': return k.inkPrimary;
    case 'witness': return k.amber;
    case 'agency': return k.inkSecondary;
    case 'location': return k.verdigris;
    case 'event': return k.amber;
    case 'sighting': return k.amber;
    case 'contradiction': return k.verdigris;
    case 'media': return k.inkSecondary;
    case 'classification': return k.verdigris;
    default: return k.inkMuted;
  }
}

function colorForEdgeType(t: EvidenceRelationship, k: ReturnType<typeof readTokens>): string {
  if (t === 'supports' || t === 'derived_from') return k.amber;
  if (t === 'contradicts') return k.verdigris;
  return k.rule;
}

interface AtlasMobileProps {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  focusNodeId?: string | null;
}

export default function AtlasMobile({ nodes, edges, focusNodeId }: AtlasMobileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const filters = useGraphStore((s) => s.filters);
  const setFilter = useGraphStore((s) => s.setFilter);
  const clearFilters = useGraphStore((s) => s.clearFilters);
  const searchQuery = useGraphStore((s) => s.searchQuery);
  const setQuery = useGraphStore((s) => s.setQuery);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (focusNodeId) selectNode(focusNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVisible = (n: EvidenceNode): boolean => {
    if (filters.nodeTypes.size > 0 && !filters.nodeTypes.has(n.type)) return false;
    if (filters.confidences.size > 0 && (!n.confidence || !filters.confidences.has(n.confidence))) return false;
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const hit =
        n.title.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        (n.agency?.toLowerCase().includes(q) ?? false);
      if (!hit) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const k = readTokens();
    const g = new Graph({ multi: false, type: 'undirected' });
    const ids = new Set(nodes.map((n) => n.id));
    const degree = new Map<string, number>();
    for (const e of edges) {
      if (!ids.has(e.source) || !ids.has(e.target)) continue;
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }
    for (const n of nodes) {
      const d = degree.get(n.id) ?? 0;
      g.addNode(n.id, {
        label: n.title,
        x: Math.random(),
        y: Math.random(),
        size: 4 + Math.min(8, d / 4),
        color: colorForNodeType(n.type, k),
      });
    }
    for (const e of edges) {
      if (!ids.has(e.source) || !ids.has(e.target)) continue;
      if (g.hasEdge(e.source, e.target)) continue;
      g.addEdge(e.source, e.target, {
        size: 0.6,
        color: colorForEdgeType(e.type, k),
      });
    }
    forceAtlas2.assign(g, { iterations: 100, settings: forceAtlas2.inferSettings(g) });
    graphRef.current = g;

    const sigma = new Sigma(g, containerRef.current, {
      defaultEdgeColor: k.rule,
      defaultNodeColor: k.inkSecondary,
      labelColor: { color: k.inkPrimary },
      labelFont: 'Schibsted Grotesk, system-ui, sans-serif',
      labelSize: 11,
      labelRenderedSizeThreshold: 8,
    });
    sigmaRef.current = sigma;

    sigma.setSetting('nodeReducer', (key, attrs) => {
      const node = nodes.find((n) => n.id === key);
      if (!node) return attrs;
      if (!isVisible(node)) return { ...attrs, hidden: true };
      if (selectedNodeId === key) {
        return { ...attrs, color: k.amber, size: (attrs.size ?? 4) * 1.5, zIndex: 2 };
      }
      return attrs;
    });

    // Tap-radius selection: on stage click, find nearest visible node within ~40px.
    sigma.on('clickStage', (payload) => {
      const ev = payload.event;
      const gp = sigma.viewportToGraph({ x: ev.x, y: ev.y });
      let nearestId: string | null = null;
      let bestDist = Infinity;
      g.forEachNode((id, attrs) => {
        const node = nodes.find((n) => n.id === id);
        if (!node || !isVisible(node)) return;
        const dx = (attrs.x as number) - gp.x;
        const dy = (attrs.y as number) - gp.y;
        const d = Math.hypot(dx, dy);
        if (d < bestDist) {
          bestDist = d;
          nearestId = id;
        }
      });
      // Compare in graph units. Convert a 40px viewport offset into graph units
      // by sampling two viewport points and measuring the graph delta.
      const a = sigma.viewportToGraph({ x: 0, y: 0 });
      const b = sigma.viewportToGraph({ x: 40, y: 0 });
      const radius = Math.hypot(b.x - a.x, b.y - a.y) || 0.05;
      if (nearestId && bestDist < radius) {
        selectNode(nearestId);
      } else {
        clearSelection();
      }
    });

    sigma.on('clickNode', ({ node }) => {
      selectNode(node);
    });

    if (!reducedMotion) {
      const layout = new FA2Layout(g, { settings: forceAtlas2.inferSettings(g) });
      layout.start();
      window.setTimeout(() => layout.stop(), 3500);
      return () => {
        layout.kill();
        sigma.kill();
      };
    }

    return () => {
      sigma.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sigmaRef.current?.refresh();
  }, [selectedNodeId, filters, searchQuery]);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null;
  const selectedEdges = useMemo<EvidenceEdge[]>(() => {
    if (!selectedNodeId) return [];
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);
  }, [selectedNodeId, edges]);
  const relatedNodes = useMemo<EvidenceNode[]>(() => {
    if (!selectedNodeId) return [];
    const ids = new Set<string>();
    for (const e of selectedEdges) ids.add(e.source === selectedNodeId ? e.target : e.source);
    return Array.from(ids)
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is EvidenceNode => Boolean(n));
  }, [selectedNodeId, selectedEdges, nodes]);

  function onSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }
  function toggleType(t: EvidenceNodeType) {
    const next = new Set(filters.nodeTypes);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setFilter('nodeTypes', next);
  }
  function toggleConfidence(c: Confidence) {
    const next = new Set(filters.confidences);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setFilter('confidences', next);
  }

  return (
    <div className="atlas-mobile">
      <div className="atlas-mobile__topbar">
        <input
          type="search"
          value={searchQuery}
          onChange={onSearchInput}
          placeholder="Search cases, agencies, places"
          aria-label="Search atlas"
          className="atlas-mobile__search"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Open filters"
          className="atlas-mobile__filter-btn"
        >
          Filters
        </button>
      </div>

      <div ref={containerRef} className="atlas-mobile__canvas" aria-hidden="true" />

      {filtersOpen && (
        <div className="atlas-mobile__sheet" role="dialog" aria-label="Filters">
          <div className="atlas-mobile__sheet-head">
            <h3 className="t-h3">Filters</h3>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">Done</button>
          </div>
          <section>
            <h4 className="t-label">Node type</h4>
            <div className="atlas-chips">
              {(Object.keys(NODE_TYPE_LABELS) as EvidenceNodeType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  data-active={filters.nodeTypes.has(t) ? 'true' : 'false'}
                  className="atlas-chip"
                >
                  {NODE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h4 className="t-label">Confidence</h4>
            <div className="atlas-chips">
              {CONFIDENCES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConfidence(c)}
                  data-active={filters.confidences.has(c) ? 'true' : 'false'}
                  className="atlas-chip"
                >
                  {c}
                </button>
              ))}
            </div>
          </section>
          <button type="button" onClick={clearFilters} className="atlas-clear">Clear all</button>
        </div>
      )}

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
