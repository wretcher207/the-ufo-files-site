import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { AgencyGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function AgencyNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<AgencyGlyph />}
      silhouette="shield"
      typeLabel="AGENCY"
    />
  );
}
