// d3-force initial positions for the board. After this initial pass, React
// Flow owns dragging. Used when the user selects the "force" layout mode.

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import type { EvidenceEdge, EvidenceNode } from '../types';
import type { LayoutPosition } from './elkLayout';

interface SimNode {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export function forceLayout(
  nodes: EvidenceNode[],
  edges: EvidenceEdge[]
): LayoutPosition[] {
  if (nodes.length === 0) return [];
  const simNodes: SimNode[] = nodes.map((n, i) => ({
    id: n.id,
    x: Math.cos(i) * 200,
    y: Math.sin(i) * 200,
  }));
  const simLinks = edges
    .filter((e) => e.source !== e.target)
    .map((e) => ({ source: e.source, target: e.target }));

  const sim = forceSimulation(simNodes as never)
    .force('charge', forceManyBody().strength(-200))
    .force(
      'link',
      forceLink(simLinks as never)
        .id((d) => (d as SimNode).id)
        .distance(120)
        .strength(0.6)
    )
    .force('collide', forceCollide(60))
    .force('center', forceCenter(0, 0))
    .stop();

  // Run a fixed tick count for deterministic build output.
  for (let i = 0; i < 200; i++) sim.tick();

  return simNodes.map((n) => ({
    id: n.id,
    x: typeof n.x === 'number' ? n.x : 0,
    y: typeof n.y === 'number' ? n.y : 0,
  }));
}

// Timeline mode: x position by date, y by row to avoid overlap.
export function timelineLayout(nodes: EvidenceNode[]): LayoutPosition[] {
  const dated = nodes.filter((n) => n.date);
  const undated = nodes.filter((n) => !n.date);
  const sorted = [...dated].sort((a, b) =>
    (a.date ?? '').localeCompare(b.date ?? '')
  );
  const positions: LayoutPosition[] = [];
  let row = 0;
  const ROW_HEIGHT = 140;
  const COL_WIDTH = 220;
  sorted.forEach((n, i) => {
    positions.push({ id: n.id, x: i * COL_WIDTH, y: row * ROW_HEIGHT });
    row = (row + 1) % 3;
  });
  undated.forEach((n, i) => {
    positions.push({
      id: n.id,
      x: i * COL_WIDTH,
      y: (3 + (i % 2)) * ROW_HEIGHT,
    });
  });
  return positions;
}

// Manual layout: simple grid as a starting point. The user repositions.
export function manualLayout(nodes: EvidenceNode[]): LayoutPosition[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const gapX = 220;
  const gapY = 160;
  return nodes.map((n, i) => ({
    id: n.id,
    x: (i % cols) * gapX,
    y: Math.floor(i / cols) * gapY,
  }));
}
