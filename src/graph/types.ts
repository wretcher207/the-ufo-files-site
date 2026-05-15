// Phase 6 graph data contract. Imported by /board (Agent 4) and /atlas (Agent 5).
// The DossierPanel shared between both routes also consumes these types.

export type EvidenceNodeType =
  | 'document'
  | 'witness'
  | 'agency'
  | 'location'
  | 'event'
  | 'sighting'
  | 'contradiction'
  | 'media'
  | 'classification';

export type EvidenceRelationship =
  | 'mentions'
  | 'supports'
  | 'contradicts'
  | 'same_location'
  | 'same_date'
  | 'same_agency'
  | 'derived_from'
  | 'occurred_before'
  | 'classified_under';

export type Confidence = 'low' | 'medium' | 'high';

export type EvidenceCollection = 'fbiCases' | 'pursueCases' | 'entities';

export interface EvidenceHeroAsset {
  type: 'photo' | 'scan' | 'map';
  src?: string;
  alt?: string;
  credit?: string;
}

export interface EvidenceGeo {
  lat: number;
  lng: number;
  placeName?: string;
}

export interface EvidenceNode {
  /** caseId if present on the source frontmatter, else `${collection}-${slug}`. */
  id: string;
  type: EvidenceNodeType;
  title: string;
  collection: EvidenceCollection;
  /** Used for URL building. `/dossier/${slug}` or `/entity/${slug}`. */
  slug: string;
  date?: string;
  agency?: string;
  classification?: string;
  confidence?: Confidence;
  threads?: string[];
  geo?: EvidenceGeo;
  summary?: string;
  excerpt?: string;
  heroAsset?: EvidenceHeroAsset;
  /** Canonical government/agency source URL if present in frontmatter. */
  officialUrl?: string;
}

export interface EvidenceEdge {
  /** `${source}__${type}__${target}`. Used for dedupe and React keys. */
  id: string;
  source: string;
  target: string;
  type: EvidenceRelationship;
  confidence: Confidence;
  explanation?: string;
  sourceParagraph?: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}
