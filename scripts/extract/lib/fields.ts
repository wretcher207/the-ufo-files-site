// Schema fields required on every case for the new graph + dossier surfaces.
// Each entry has a `required` flag — coverage check fails if a required
// field is missing on any case after the full pipeline runs.

export const CASE_REQUIRED_FIELDS = [
  'caseId',
  'title',
  'source.officialUrl',     // may be empty string for pre-release PURSUE cases
  'source.releaseDate',
  'nodeType',
  'agency',
  'classification',
  'confidence',
  'date',
  'summary',
  'excerpt',
  'threads',
  'entities',
] as const;

export const CASE_OPTIONAL_FIELDS = [
  'witnesses',
  'geo',
  'dateRange',
  'heroAsset',
  'relationships',
] as const;

export const ENTITY_REQUIRED_FIELDS = [
  'caseId',
  'title',
  'nodeType',
  'summary',
] as const;

export type Confidence = 'low' | 'medium' | 'high';

export type EvidenceNodeType =
  | 'document'
  | 'witness'
  | 'agency'
  | 'location'
  | 'event'
  | 'sighting'
  | 'contradiction'
  | 'media'
  | 'classification'
  | 'person'
  | 'program'
  | 'concept';

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

export interface CaseSourceObject {
  officialUrl?: string;
  officialName?: string;
  releaseDate?: string;
  retrievedDate?: string;
  archiveCommit?: string;
}

export interface Relationship {
  target: string;
  type: EvidenceRelationship;
  confidence: Confidence;
  explanation?: string;
  sourceParagraph?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  placeName?: string;
}
