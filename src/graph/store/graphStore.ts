import { create } from 'zustand';
import type { Confidence, EvidenceNodeType } from '../types';

export type LayoutMode = 'manual' | 'elk' | 'force' | 'timeline';
export type ViewMode = 'board' | 'atlas';

export interface GraphFilters {
  nodeTypes: Set<EvidenceNodeType>;
  agencies: Set<string>;
  confidences: Set<Confidence>;
  threads: Set<string>;
  /** ISO date strings, inclusive. */
  dateRange?: [string, string];
}

export interface GraphState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  filters: GraphFilters;
  searchQuery: string;
  layoutMode: LayoutMode;
  viewMode: ViewMode;

  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;
  setFilter: <K extends keyof GraphFilters>(key: K, value: GraphFilters[K]) => void;
  clearFilters: () => void;
  setQuery: (q: string) => void;
  setLayout: (mode: LayoutMode) => void;
  setView: (mode: ViewMode) => void;
}

function emptyFilters(): GraphFilters {
  return {
    nodeTypes: new Set<EvidenceNodeType>(),
    agencies: new Set<string>(),
    confidences: new Set<Confidence>(),
    threads: new Set<string>(),
  };
}

export const useGraphStore = create<GraphState>((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  filters: emptyFilters(),
  searchQuery: '',
  layoutMode: 'elk',
  viewMode: 'board',

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: emptyFilters() }),
  setQuery: (q) => set({ searchQuery: q }),
  setLayout: (mode) => set({ layoutMode: mode }),
  setView: (mode) => set({ viewMode: mode }),
}));
