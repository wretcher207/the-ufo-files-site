// Shared visual primitive for all 7 node types. Each typed node wraps this
// with its own silhouette glyph and label. The card itself handles zoom level
// of detail, selected state, tack treatment, and confidence chip.

import * as React from 'react';
import { Handle, Position, useStore } from '@xyflow/react';
import type { ReactNode } from 'react';
import type { Confidence, EvidenceNode } from '../../types';

export interface NodeCardProps {
  node: EvidenceNode;
  selected: boolean;
  glyph: ReactNode;
  silhouette: 'rect' | 'tag' | 'shield' | 'pin' | 'diamond' | 'circle' | 'broken';
  typeLabel: string;
}

function confidenceColor(c: Confidence | undefined): string {
  if (c === 'high') return 'var(--fg)';
  if (c === 'low') return 'var(--red)';
  return 'var(--fg-mid)';
}

const zoomSelector = (s: { transform: [number, number, number] }) => s.transform[2];

export function NodeCard({
  node,
  selected,
  glyph,
  silhouette,
  typeLabel,
}: NodeCardProps) {
  const zoom = useStore(zoomSelector);
  const lod = zoom < 0.5 ? 'icon' : zoom < 1.0 ? 'mid' : 'full';

  return (
    <div
      className={`evidence-node evidence-node--${silhouette} ${selected ? 'is-selected' : ''}`}
      data-lod={lod}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="evidence-node__handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="evidence-node__handle"
      />

      <span className="evidence-node__tack" aria-hidden="true" />

      <span
        className="evidence-node__confidence"
        style={{ background: confidenceColor(node.confidence) }}
        aria-label={`Confidence ${node.confidence ?? 'unknown'}`}
      />

      <span className="evidence-node__glyph" aria-hidden="true">
        {glyph}
      </span>

      {lod !== 'icon' && (
        <span className="evidence-node__case-id" title={node.id}>
          {node.id}
        </span>
      )}

      {lod !== 'icon' && (
        <span className="evidence-node__title">{node.title}</span>
      )}

      {lod === 'full' && node.summary && (
        <span className="evidence-node__summary">{node.summary}</span>
      )}

      {lod === 'full' && (
        <span className="evidence-node__type-label">{typeLabel}</span>
      )}
    </div>
  );
}
