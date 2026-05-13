// ELK layered layout for the investigation board.
// Runs synchronously off the main thread via elkjs (web worker variant when
// available). Returns positions only; React Flow handles render.

import ELK from 'elkjs/lib/elk.bundled.js';
import type { EvidenceEdge, EvidenceNode } from '../types';

export interface LayoutPosition {
  id: string;
  x: number;
  y: number;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '40',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.edgeRouting': 'POLYLINE',
};

export async function elkLayout(
  nodes: EvidenceNode[],
  edges: EvidenceEdge[]
): Promise<LayoutPosition[]> {
  if (nodes.length === 0) return [];
  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
  try {
    const layout = await elk.layout(graph);
    const positions: LayoutPosition[] = [];
    for (const child of layout.children ?? []) {
      if (child.id == null) continue;
      positions.push({
        id: String(child.id),
        x: typeof child.x === 'number' ? child.x : 0,
        y: typeof child.y === 'number' ? child.y : 0,
      });
    }
    return positions;
  } catch {
    return gridFallback(nodes);
  }
}

function gridFallback(nodes: EvidenceNode[]): LayoutPosition[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const gap = 60;
  return nodes.map((n, i) => ({
    id: n.id,
    x: (i % cols) * (NODE_WIDTH + gap),
    y: Math.floor(i / cols) * (NODE_HEIGHT + gap),
  }));
}
