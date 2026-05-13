import * as React from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { EventGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function EventNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<EventGlyph />}
      silhouette="tag"
      typeLabel="EVENT"
    />
  );
}
