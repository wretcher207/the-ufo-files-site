import * as React from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { WitnessGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function WitnessNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<WitnessGlyph />}
      silhouette="circle"
      typeLabel="WITNESS"
    />
  );
}
