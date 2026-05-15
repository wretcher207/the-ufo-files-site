// Phase 6 /atlas route. WebGL network atlas over the full corpus.
// Uses Sigma 3 + Graphology + ForceAtlas2 (worker). Reads brand
// tokens off the document root so node/edge colors track mode.

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import forceAtlas2 from 'graphology-layout-forceatlas2';
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

interface ResolvedTokens {
  fg: string;
  fgMid: string;
  fgDim: string;
  red: string;
  rule: string;
  bg: string;
  // Backwards-compat names retained so the rest of the file compiles.
  amber: string;        // alias of fg (highlight)
  amberDim: string;     // alias of fgMid
  verdigris: string;    // alias of red (semantic)
  verdigrisDim: string; // alias of fgDim
  inkPrimary: string;   // alias of fg
  inkSecondary: string; // alias of fgMid
  inkMuted: string;     // alias of fgDim
  bgBase: string;       // alias of bg
  bgRaised: string;     // alias of bg
}

function readTokens(): ResolvedTokens {
  const fallback = {
    fg: '#ffffff',
    fgMid: '#888888',
    fgDim: '#555555',
    red: '#e10600',
    rule: '#1a1a1a',
    bg: '#000000',
  };
  let resolved = { ...fallback };
  if (typeof window !== 'undefined') {
    const css = getComputedStyle(document.documentElement);
    const v = (k: string, f: string) => (css.getPropertyValue(k).trim() || f);
    resolved = {
      fg: v('--fg', fallback.fg),
      fgMid: v('--fg-mid', fallback.fgMid),
      fgDim: v('--fg-dim', fallback.fgDim),
      red: v('--red', fallback.red),
      rule: v('--rule', fallback.rule),
      bg: v('--bg', fallback.bg),
    };
  }
  return {
    ...resolved,
    amber: resolved.fg,
    amberDim: resolved.fgMid,
    verdigris: resolved.red,
    verdigrisDim: resolved.fgDim,
    inkPrimary: resolved.fg,
    inkSecondary: resolved.fgMid,
    inkMuted: resolved.fgDim,
    bgBase: resolved.bg,
    bgRaised: resolved.bg,
  };
}

function colorForNodeType(t: EvidenceNodeType, tokens: ResolvedTokens): string {
  // Monochrome distribution: high-importance node types stay bright,
  // structural / context types step back to mid/dim greys. Contradictions
  // are the only non-grey signal because the rule reserves red for
  // content semantics (contradiction is content semantics).
  switch (t) {
    case 'document': return tokens.fg;
    case 'witness': return tokens.fg;
    case 'agency': return tokens.fgMid;
    case 'location': return tokens.fgMid;
    case 'event': return tokens.fgMid;
    case 'sighting': return tokens.fg;
    case 'contradiction': return tokens.red;
    case 'media': return tokens.fgMid;
    case 'classification': return tokens.fgDim;
    default: return tokens.fgDim;
  }
}

function colorForEdgeType(t: EvidenceRelationship, tokens: ResolvedTokens): string {
  switch (t) {
    case 'supports':
    case 'derived_from':
      return tokens.fg;
    case 'contradicts':
      return tokens.red;
    case 'mentions':
      return tokens.fgDim;
    case 'same_location':
    case 'same_date':
    case 'same_agency':
    case 'classified_under':
    case 'occurred_before':
      return tokens.fgDim;
    default:
      return tokens.fgDim;
  }
}

function parseHex(c: string): [number, number, number] | null {
  const m = c.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nodeSizeFromDegree(degree: number): number {
  // Min 3px, max 12px. Degree typically 0..30 in this corpus.
  const clamped = Math.min(30, Math.max(0, degree));
  return 3 + (clamped / 30) * 9;
}

function withAlpha(hex: string, a: number): string {
  const p = parseHex(hex);
  if (!p) return hex;
  return `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${a})`;
}

interface NetworkAtlasProps {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  focusNodeId?: string | null;
  initialFilters?: Partial<{
    nodeTypes: EvidenceNodeType[];
    agencies: string[];
    confidences: Confidence[];
    threads: string[];
  }>;
}

interface AtlasPing {
  nodeId?: string;
  x?: number;
  y?: number;
  t0: number;
  life: number;
  color: string;
  maxR: number;
  ringWidth: number;
}

export default function NetworkAtlas({ nodes, edges, focusNodeId, initialFilters }: NetworkAtlasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const layoutRef = useRef<FA2Layout | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const searchMatchesRef = useRef<Set<string>>(new Set());
  const pulseUntilRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const bootStartRef = useRef<number>(0);
  const bootSchedRef = useRef<Map<string, { start: number; dur: number }>>(new Map());
  const bootActiveRef = useRef<boolean>(false);
  const pingsRef = useRef<AtlasPing[]>([]);
  const isVisibleRef = useRef<(n: EvidenceNode) => boolean>(() => true);
  const reducedMotionRef = useRef<boolean>(false);

  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const filters = useGraphStore((s) => s.filters);
  const setFilter = useGraphStore((s) => s.setFilter);
  const clearFilters = useGraphStore((s) => s.clearFilters);
  const searchQuery = useGraphStore((s) => s.searchQuery);
  const setQuery = useGraphStore((s) => s.setQuery);

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  // Apply initial state from URL query exactly once.
  useEffect(() => {
    if (focusNodeId) selectNode(focusNodeId);
    if (initialFilters?.nodeTypes && initialFilters.nodeTypes.length > 0) {
      setFilter('nodeTypes', new Set(initialFilters.nodeTypes));
    }
    if (initialFilters?.agencies && initialFilters.agencies.length > 0) {
      setFilter('agencies', new Set(initialFilters.agencies));
    }
    if (initialFilters?.confidences && initialFilters.confidences.length > 0) {
      setFilter('confidences', new Set(initialFilters.confidences));
    }
    if (initialFilters?.threads && initialFilters.threads.length > 0) {
      setFilter('threads', new Set(initialFilters.threads));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build derived option lists once.
  const allAgencies = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) if (n.agency) set.add(n.agency);
    return Array.from(set).sort();
  }, [nodes]);

  const allThreads = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) if (n.threads) for (const t of n.threads) set.add(t);
    return Array.from(set).sort();
  }, [nodes]);

  const yearRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const n of nodes) {
      if (!n.date) continue;
      const y = parseInt(n.date.slice(0, 4), 10);
      if (Number.isFinite(y)) {
        if (y < min) min = y;
        if (y > max) max = y;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max };
  }, [nodes]);

  const [dateLow, setDateLow] = useState<number | null>(null);
  const [dateHigh, setDateHigh] = useState<number | null>(null);
  useEffect(() => {
    if (yearRange) {
      setDateLow(yearRange.min);
      setDateHigh(yearRange.max);
    }
  }, [yearRange]);

  // Keep reducedMotion in a ref so the rAF loop (created once) sees fresh values.
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  // Visibility predicate from filters + date range.
  const isVisible = (node: EvidenceNode): boolean => {
    if (filters.nodeTypes.size > 0 && !filters.nodeTypes.has(node.type)) return false;
    if (filters.agencies.size > 0) {
      if (!node.agency || !filters.agencies.has(node.agency)) return false;
    }
    if (filters.confidences.size > 0) {
      if (!node.confidence || !filters.confidences.has(node.confidence)) return false;
    }
    if (filters.threads.size > 0) {
      if (!node.threads || !node.threads.some((t) => filters.threads.has(t))) return false;
    }
    if (dateLow != null && dateHigh != null && node.date) {
      const y = parseInt(node.date.slice(0, 4), 10);
      if (Number.isFinite(y) && (y < dateLow || y > dateHigh)) return false;
    }
    return true;
  };

  // Mirror isVisible into a ref so the rAF loop (one-time closure) reads fresh
  // filter state without being torn down on every change.
  useEffect(() => {
    isVisibleRef.current = isVisible;
  });

  // Build Sigma + Graphology once.
  useEffect(() => {
    if (!containerRef.current) return;
    const tokens = readTokens();
    const graph = new Graph({ multi: false, type: 'undirected' });

    // Pre-compute degrees from edges only between known nodes.
    const nodeIds = new Set(nodes.map((n) => n.id));
    const degree = new Map<string, number>();
    for (const e of edges) {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    for (const n of nodes) {
      graph.addNode(n.id, {
        label: n.title,
        x: Math.random(),
        y: Math.random(),
        size: nodeSizeFromDegree(degree.get(n.id) ?? 0),
        color: colorForNodeType(n.type, tokens),
        nodeType: n.type,
      });
    }
    for (const e of edges) {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
      if (graph.hasEdge(e.source, e.target)) continue;
      graph.addEdge(e.source, e.target, {
        size: e.confidence === 'high' ? 1 : e.confidence === 'medium' ? 0.7 : 0.4,
        color: withAlpha(colorForEdgeType(e.type, tokens), 0.4),
        edgeType: e.type,
        confidence: e.confidence,
      });
    }

    graphRef.current = graph;

    // Seed positions with a quick static FA2 pass so the first frame is sane,
    // then hand off to the worker for further refinement.
    forceAtlas2.assign(graph, { iterations: 80, settings: forceAtlas2.inferSettings(graph) });

    // Boot schedule: signal acquisition. Each node has its own fade-in window
    // ordered by descending degree, so the densest signals materialize first
    // and trace contacts follow. Skipped under reduced motion.
    bootSchedRef.current.clear();
    pingsRef.current = [];
    bootActiveRef.current = false;
    if (!reducedMotion) {
      const ranked = nodes
        .map((n) => ({ id: n.id, deg: degree.get(n.id) ?? 0 }))
        .sort((a, b) => b.deg - a.deg);
      const totalStagger = 700;
      const perNodeDur = 520;
      const now0 = performance.now();
      bootStartRef.current = now0;
      const denom = Math.max(1, ranked.length - 1);
      for (let i = 0; i < ranked.length; i++) {
        bootSchedRef.current.set(ranked[i].id, {
          start: now0 + (i / denom) * totalStagger,
          dur: perNodeDur,
        });
      }
      bootActiveRef.current = true;

      // Acquisition pings emanating from the densest node. A deliberate
      // hero moment telegraphing "this is where the corpus is most entangled."
      if (ranked.length > 0) {
        pingsRef.current.push({
          nodeId: ranked[0].id,
          t0: now0 + 60,
          life: 1100,
          color: tokens.fg,
          maxR: 96,
          ringWidth: 1,
        });
        pingsRef.current.push({
          nodeId: ranked[0].id,
          t0: now0 + 320,
          life: 900,
          color: tokens.fg,
          maxR: 64,
          ringWidth: 1,
        });
      }
    }

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultEdgeColor: tokens.rule,
      defaultNodeColor: tokens.inkSecondary,
      labelColor: { color: tokens.inkPrimary },
      labelFont: 'Schibsted Grotesk, system-ui, sans-serif',
      labelSize: 12,
      labelWeight: '500',
      minCameraRatio: 0.05,
      maxCameraRatio: 8,
      labelDensity: 0.5,
      labelGridCellSize: 80,
      labelRenderedSizeThreshold: 6,
    });
    sigmaRef.current = sigma;

    // Reducer for nodes (visibility, fade, highlight, pulse).
    sigma.setSetting('nodeReducer', (key, attrs) => {
      const node = nodes.find((n) => n.id === key);
      if (!node) return attrs;
      const visible = isVisible(node);
      if (!visible) return { ...attrs, hidden: true };

      const out = { ...attrs };
      const hovered = hoveredRef.current;
      const selected = selectedNodeId;
      const matches = searchMatchesRef.current;

      // Boot acquisition fade: until each node's window ends it eases in via
      // alpha + size scale. Applied first so hover/select can override below.
      if (bootActiveRef.current) {
        const sched = bootSchedRef.current.get(String(key));
        if (sched) {
          const now = performance.now();
          let p = (now - sched.start) / sched.dur;
          if (p < 0) p = 0;
          if (p > 1) p = 1;
          if (p < 1) {
            const eased = 1 - Math.pow(1 - p, 4);
            out.color = withAlpha(String(attrs.color ?? tokens.inkSecondary), eased);
            out.size = (attrs.size ?? 4) * (0.35 + 0.65 * eased);
            if (eased < 0.25) out.label = '';
          }
        }
      }

      // Search-result pulse: nodes that match the query enlarge and turn
      // red for 1.5s after the search fires. Uses red because that's the
      // archive's content-semantics accent; here it signals "this is a
      // matched item, not just a hovered one."
      const pulsing = matches.has(key) && Date.now() < pulseUntilRef.current;

      if (pulsing) {
        out.color = readTokens().red;
        out.size = (attrs.size ?? 4) * 1.6;
        out.zIndex = 2;
      } else if (selected === key || hovered === key) {
        out.color = readTokens().fg;
        out.size = (attrs.size ?? 4) * 1.5;
        out.zIndex = 2;
      } else if (hovered && !graphRef.current?.hasEdge(hovered, key) && !graphRef.current?.hasEdge(key, hovered)) {
        out.color = withAlpha(attrs.color ?? tokens.inkSecondary, 0.15);
        out.label = '';
      } else if (selected && !graphRef.current?.hasEdge(selected, key) && !graphRef.current?.hasEdge(key, selected) && selected !== key) {
        out.color = withAlpha(attrs.color ?? tokens.inkSecondary, 0.2);
        out.label = '';
      } else if (matches.size > 0 && !matches.has(key)) {
        out.color = withAlpha(attrs.color ?? tokens.inkSecondary, 0.18);
        out.label = '';
      }
      return out;
    });

    // Reducer for edges.
    sigma.setSetting('edgeReducer', (key, attrs) => {
      const src = graph.source(key);
      const tgt = graph.target(key);
      const srcN = nodes.find((n) => n.id === src);
      const tgtN = nodes.find((n) => n.id === tgt);
      if (!srcN || !tgtN) return attrs;
      if (!isVisible(srcN) || !isVisible(tgtN)) return { ...attrs, hidden: true };
      const hovered = hoveredRef.current;
      const selected = selectedNodeId;
      const focus = hovered ?? selected;
      if (focus && src !== focus && tgt !== focus) {
        return { ...attrs, color: withAlpha(String(attrs.color ?? tokens.rule), 0.08), hidden: false };
      }
      if (focus && (src === focus || tgt === focus)) {
        return { ...attrs, color: withAlpha(String(attrs.color ?? tokens.rule), 0.9), size: (attrs.size ?? 0.6) * 1.4 };
      }
      return attrs;
    });

    sigma.on('enterNode', ({ node }) => {
      hoveredRef.current = node;
      sigma.refresh();
      const el = containerRef.current;
      if (el) el.style.cursor = 'pointer';
    });
    sigma.on('leaveNode', () => {
      hoveredRef.current = null;
      sigma.refresh();
      const el = containerRef.current;
      if (el) el.style.cursor = 'default';
    });
    sigma.on('clickNode', ({ node }) => {
      selectNode(node);
    });
    sigma.on('clickStage', () => {
      clearSelection();
    });

    // Start the FA2 worker for continued layout refinement, unless the user
    // prefers reduced motion (which case we keep the static seed).
    if (!reducedMotion) {
      const settings = forceAtlas2.inferSettings(graph);
      const layout = new FA2Layout(graph, { settings });
      layoutRef.current = layout;
      layout.start();
      window.setTimeout(() => {
        layout.stop();
      }, 4000);
    }

    // FX overlay loop: draws contradiction halos and transient pings on a 2D
    // canvas above the WebGL surface. While the boot fade is active we also
    // refresh sigma each frame so the staggered alpha resolves. Once boot
    // completes the loop only drives the cheap overlay paint.
    const tick = (now: number) => {
      const overlay = overlayRef.current;
      const s = sigmaRef.current;
      const g = graphRef.current;
      if (!overlay || !s || !g) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const parent = overlay.parentElement;
      const ctx = overlay.getContext('2d');
      if (!parent || !ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (overlay.width !== targetW || overlay.height !== targetH) {
        overlay.width = targetW;
        overlay.height = targetH;
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const tk = readTokens();
      const reduced = reducedMotionRef.current;

      // Contradiction halos: ambient breathing rings at each visible
      // contradiction node. Red because contradictions own the red signal.
      // Suppressed during boot so the entrance reads as a single gesture,
      // and suppressed entirely under reduced motion.
      if (!reduced && !bootActiveRef.current) {
        const phase = (now / 3200) * Math.PI * 2;
        const wave = 0.5 + 0.5 * Math.sin(phase);
        const haloAlpha = 0.06 + 0.10 * wave;
        const haloR = 16 + 8 * wave;
        ctx.lineWidth = 1;
        for (const n of nodes) {
          if (n.type !== 'contradiction') continue;
          if (!isVisibleRef.current(n)) continue;
          if (!g.hasNode(n.id)) continue;
          const gx = g.getNodeAttribute(n.id, 'x') as number;
          const gy = g.getNodeAttribute(n.id, 'y') as number;
          const sp = s.graphToViewport({ x: gx, y: gy });
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, haloR, 0, Math.PI * 2);
          ctx.strokeStyle = withAlpha(tk.red, haloAlpha);
          ctx.stroke();
        }
      }

      // Pings: sonar-style expanding rings. Search matches (red), selection
      // confirmations (white), and boot acquisition (white from densest node).
      if (!reduced) {
        const alive: AtlasPing[] = [];
        for (const p of pingsRef.current) {
          const t = (now - p.t0) / p.life;
          if (t < 0) {
            alive.push(p);
            continue;
          }
          if (t >= 1) continue;
          const eased = 1 - Math.pow(1 - t, 4);
          const r = p.maxR * eased;
          const alpha = 0.7 * Math.pow(1 - t, 1.7);
          let sx: number | undefined;
          let sy: number | undefined;
          if (p.nodeId && g.hasNode(p.nodeId)) {
            const gx = g.getNodeAttribute(p.nodeId, 'x') as number;
            const gy = g.getNodeAttribute(p.nodeId, 'y') as number;
            const sp = s.graphToViewport({ x: gx, y: gy });
            sx = sp.x;
            sy = sp.y;
          } else {
            sx = p.x;
            sy = p.y;
          }
          if (sx == null || sy == null) {
            alive.push(p);
            continue;
          }
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.strokeStyle = withAlpha(p.color, alpha);
          ctx.lineWidth = p.ringWidth;
          ctx.stroke();
          alive.push(p);
        }
        pingsRef.current = alive;
      } else {
        pingsRef.current = [];
      }

      // Resolve boot lifecycle and drive sigma refresh while it's active.
      if (bootActiveRef.current) {
        let allDone = true;
        for (const v of bootSchedRef.current.values()) {
          if (now < v.start + v.dur) {
            allDone = false;
            break;
          }
        }
        if (allDone) {
          bootActiveRef.current = false;
          s.refresh(); // one last refresh so reducer drops the override
        } else {
          s.refresh();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      layoutRef.current?.kill();
      layoutRef.current = null;
      sigma.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh sigma reducers whenever selection, filters, or query change.
  useEffect(() => {
    sigmaRef.current?.refresh();
  }, [selectedNodeId, filters, dateLow, dateHigh]);

  // Recompute search matches whenever query changes.
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = new Set<string>();
    if (q.length >= 2) {
      for (const n of nodes) {
        if (
          n.title.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q) ||
          (n.agency && n.agency.toLowerCase().includes(q)) ||
          (n.geo?.placeName && n.geo.placeName.toLowerCase().includes(q))
        ) {
          matches.add(n.id);
        }
      }
    }
    searchMatchesRef.current = matches;
    setMatchCount(matches.size);
    setCurrentMatchIndex(0);
    if (matches.size > 0 && !reducedMotion) {
      pulseUntilRef.current = Date.now() + 1500;
      // Sonar ring per match, layered on top of the existing red color pulse.
      // Tracks nodeId so rings follow if the FA2 worker is still drifting.
      const tk = readTokens();
      const t0 = performance.now();
      let i = 0;
      for (const id of matches) {
        pingsRef.current.push({
          nodeId: id,
          // tiny cascade so a big match set doesn't smear into one flash
          t0: t0 + i * 18,
          life: 900,
          color: tk.red,
          maxR: 56,
          ringWidth: 1,
        });
        i++;
      }
      sigmaRef.current?.refresh();
      window.setTimeout(() => sigmaRef.current?.refresh(), 1500);
    } else {
      sigmaRef.current?.refresh();
    }
  }, [searchQuery, nodes, reducedMotion]);

  // Pan to selected node (e.g., when focusNodeId arrives via querystring).
  useEffect(() => {
    if (!selectedNodeId) return;
    const s = sigmaRef.current;
    const g = graphRef.current;
    if (!s || !g || !g.hasNode(selectedNodeId)) return;
    const x = g.getNodeAttribute(selectedNodeId, 'x') as number;
    const y = g.getNodeAttribute(selectedNodeId, 'y') as number;
    const camera = s.getCamera();
    // Sigma camera animates in graph coordinates already.
    camera.animate({ x, y, ratio: 0.5 }, { duration: reducedMotion ? 0 : 400 });
    if (!reducedMotion) {
      // Selection ping. A quiet "acquired" confirmation that tracks the node
      // as the camera pans.
      pingsRef.current.push({
        nodeId: selectedNodeId,
        t0: performance.now(),
        life: 620,
        color: readTokens().fg,
        maxR: 38,
        ringWidth: 1,
      });
    }
  }, [selectedNodeId, reducedMotion]);

  // Resolve selected node + edges for the panel.
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null;
  const selectedEdges = useMemo<EvidenceEdge[]>(() => {
    if (!selectedNodeId) return [];
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);
  }, [selectedNodeId, edges]);
  const relatedNodes = useMemo<EvidenceNode[]>(() => {
    if (!selectedNodeId) return [];
    const ids = new Set<string>();
    for (const e of selectedEdges) {
      ids.add(e.source === selectedNodeId ? e.target : e.source);
    }
    return Array.from(ids)
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is EvidenceNode => Boolean(n));
  }, [selectedNodeId, selectedEdges, nodes]);


  // Search bar handlers.
  function onSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }
  function jumpToMatch(index: number) {
    const ids = Array.from(searchMatchesRef.current);
    if (ids.length === 0) return;
    const i = ((index % ids.length) + ids.length) % ids.length;
    setCurrentMatchIndex(i);
    selectNode(ids[i]);
  }
  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      jumpToMatch(currentMatchIndex);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      jumpToMatch(currentMatchIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      jumpToMatch(currentMatchIndex - 1);
    }
  }

  // Filter chip handlers.
  function toggleNodeType(t: EvidenceNodeType) {
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
  function toggleThread(t: string) {
    const next = new Set(filters.threads);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setFilter('threads', next);
  }
  function onAgencyChange(e: ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (!v) return;
    const next = new Set(filters.agencies);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setFilter('agencies', next);
    e.target.value = '';
  }
  function removeAgency(a: string) {
    const next = new Set(filters.agencies);
    next.delete(a);
    setFilter('agencies', next);
  }

  const focusQs = selectedNodeId ? `?focus=${encodeURIComponent(selectedNodeId)}` : '';

  return (
    <div className="atlas-root">
      <aside
        className={`atlas-filters ${filtersOpen ? '' : 'atlas-filters--collapsed'}`}
        aria-label="Atlas filters"
      >
        <button
          type="button"
          className="atlas-filters__toggle"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? 'Hide filters' : 'Filters'}
        </button>
        {filtersOpen && (
          <div className="atlas-filters__body">
            <section>
              <h3 className="t-label">Node type</h3>
              <div className="atlas-chips">
                {(Object.keys(NODE_TYPE_LABELS) as EvidenceNodeType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleNodeType(t)}
                    data-active={filters.nodeTypes.has(t) ? 'true' : 'false'}
                    className="atlas-chip"
                  >
                    {NODE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="t-label">Agency</h3>
              <select className="atlas-select" onChange={onAgencyChange} defaultValue="">
                <option value="" disabled>Add agency...</option>
                {allAgencies.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {filters.agencies.size > 0 && (
                <ul className="atlas-tags">
                  {Array.from(filters.agencies).map((a) => (
                    <li key={a}>
                      <button type="button" onClick={() => removeAgency(a)} className="atlas-tag" aria-label={`Remove ${a}`}>
                        <span>{a}</span>
                        <span aria-hidden="true">x</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="t-label">Confidence</h3>
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

            {yearRange && (
              <section>
                <h3 className="t-label">Date range</h3>
                <div className="atlas-daterange">
                  <span className="t-mono">{dateLow ?? yearRange.min}</span>
                  <input
                    type="range"
                    min={yearRange.min}
                    max={yearRange.max}
                    value={dateLow ?? yearRange.min}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setDateLow(Math.min(v, dateHigh ?? yearRange.max));
                    }}
                    aria-label="Earliest year"
                  />
                  <input
                    type="range"
                    min={yearRange.min}
                    max={yearRange.max}
                    value={dateHigh ?? yearRange.max}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setDateHigh(Math.max(v, dateLow ?? yearRange.min));
                    }}
                    aria-label="Latest year"
                  />
                  <span className="t-mono">{dateHigh ?? yearRange.max}</span>
                </div>
              </section>
            )}

            {allThreads.length > 0 && (
              <section>
                <h3 className="t-label">Thread</h3>
                <div className="atlas-chips">
                  {allThreads.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleThread(t)}
                      data-active={filters.threads.has(t) ? 'true' : 'false'}
                      className="atlas-chip"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <button
              type="button"
              className="atlas-clear"
              onClick={() => {
                clearFilters();
                if (yearRange) {
                  setDateLow(yearRange.min);
                  setDateHigh(yearRange.max);
                }
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </aside>

      <div className="atlas-canvas-wrap">
        <div className="atlas-topbar">
          <label className="atlas-search">
            <span className="t-label atlas-search__label">Search</span>
            <input
              type="search"
              value={searchQuery}
              onChange={onSearchInput}
              onKeyDown={onSearchKey}
              placeholder="title, agency, place, case id"
              aria-label="Search the atlas"
            />
            {matchCount > 0 && (
              <span className="t-mono atlas-search__count" aria-live="polite">
                {matchCount} match{matchCount === 1 ? '' : 'es'}
              </span>
            )}
          </label>
          <a className="atlas-cross" href={`/board${focusQs}`}>
            Open as Board &rarr;
          </a>
        </div>

        <div ref={containerRef} className="atlas-canvas" aria-hidden="true" />
        <canvas ref={overlayRef} className="atlas-fx" aria-hidden="true" />

        {selectedNode && (
          <DossierPanel
            node={selectedNode}
            edges={selectedEdges}
            relatedNodes={relatedNodes}
            onClose={clearSelection}
          />
        )}
      </div>
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
