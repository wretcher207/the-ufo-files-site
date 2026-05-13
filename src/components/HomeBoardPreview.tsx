/**
 * HomeBoardPreview.tsx
 *
 * Homepage embed of /board. Same InvestigationBoard component, with a
 * thin wrapper that intercepts node selection and navigates to
 * /board?focus=<id> instead of opening the in-place DossierPanel.
 *
 * Hosted from index.astro via `client:only="react"`.
 */

import { useEffect, useRef } from 'react';
import { InvestigationBoard } from '../graph/components/InvestigationBoard';
import { useGraphStore } from '../graph/store/graphStore';
import type { EvidenceGraph } from '../graph/types';

export interface HomeBoardPreviewProps {
  graph: EvidenceGraph;
}

export function HomeBoardPreview({ graph }: HomeBoardPreviewProps) {
  const navigatedRef = useRef(false);

  useEffect(() => {
    // Subscribe to selectedNodeId. When any node is selected, navigate
    // to /board?focus=<id>. Clear immediately so the in-place panel
    // never shows.
    const unsub = useGraphStore.subscribe((state, prev) => {
      const id = state.selectedNodeId;
      if (!id || id === prev.selectedNodeId) return;
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      useGraphStore.getState().clearSelection();
      const target = `/board?focus=${encodeURIComponent(id)}`;
      // Use Astro view-transition-friendly navigation if available.
      if (typeof window !== 'undefined') {
        window.location.assign(target);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  return <InvestigationBoard graph={graph} />;
}

export default HomeBoardPreview;
