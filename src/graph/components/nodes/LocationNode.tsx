import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { LocationGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function LocationNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<LocationGlyph />}
      silhouette="pin"
      typeLabel="LOCATION"
    />
  );
}
