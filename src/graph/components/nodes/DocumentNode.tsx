import type { NodeProps } from '@xyflow/react';
import type { EvidenceNode } from '../../types';
import { DocumentGlyph } from './glyphs';
import { NodeCard } from './NodeCard';

export function DocumentNode({ data, selected }: NodeProps) {
  const node = data as unknown as EvidenceNode;
  return (
    <NodeCard
      node={node}
      selected={Boolean(selected)}
      glyph={<DocumentGlyph />}
      silhouette="rect"
      typeLabel="DOCUMENT"
    />
  );
}
