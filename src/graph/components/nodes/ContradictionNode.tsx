import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { ContradictionGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function ContradictionNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<ContradictionGlyph />}
      silhouette="broken"
      typeLabel="CONTRADICTION"
    />
  );
}
