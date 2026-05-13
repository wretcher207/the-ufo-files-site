// Custom React Flow edge. Styling driven entirely by `relationship.type`
// and `confidence`. No raster, no gradients, just stroke color, width, and
// dash pattern. Hovering thickens the line and reveals the explanation
// tooltip (when present).

import * as React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { useState } from 'react';
import type { Confidence, EvidenceRelationship } from '../../types';

interface EdgeData {
  relationship: EvidenceRelationship;
  confidence: Confidence;
  explanation?: string;
}

interface Style {
  stroke: string;
  width: number;
  dash?: string;
}

function styleFor(rel: EvidenceRelationship, conf: Confidence): Style {
  const isLow = conf === 'low';
  switch (rel) {
    case 'supports':
      return {
        stroke: 'var(--fg)',
        width: 2,
        dash: isLow ? '2 4' : undefined,
      };
    case 'contradicts':
      return {
        stroke: 'var(--red)',
        width: 2,
        dash: '6 4',
      };
    case 'derived_from':
      return {
        stroke: 'var(--fg)',
        width: 1.5,
        dash: '4 4',
      };
    case 'mentions':
      return {
        stroke: 'var(--fg-dim)',
        width: 1,
        dash: isLow ? '2 4' : undefined,
      };
    default:
      return {
        stroke: 'var(--fg-dim)',
        width: 1,
        dash: isLow ? '2 4' : undefined,
      };
  }
}

export function EvidenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const d = (data ?? {}) as Partial<EdgeData>;
  const rel = d.relationship ?? 'mentions';
  const conf = d.confidence ?? 'medium';
  const style = styleFor(rel, conf);
  const [hovered, setHovered] = useState(false);

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const widthBoost = hovered || selected ? 1 : 0;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: style.stroke,
          strokeWidth: style.width + widthBoost,
          strokeDasharray: style.dash,
          transition: 'stroke-width 120ms ease-out',
          fill: 'none',
        }}
      />
      {/* Hit area: a wide transparent overlay so hover/click is forgiving. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      {hovered && d.explanation && (
        <EdgeLabelRenderer>
          <div
            className="evidence-edge__tooltip"
            style={{
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <span className="evidence-edge__tooltip-rel">
              {rel.replace(/_/g, ' ')}
            </span>
            <span className="evidence-edge__tooltip-text">{d.explanation}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
