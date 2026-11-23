/** Structural contracts for the existing collection; these do not certify historical accuracy. */
export type EntityType = 'person' | 'area' | 'state' | 'city' | 'period' | 'event';
export type GeoPoint = [longitude: number, latitude: number];
export interface HistoricalInterval { startYear: number; endYear: number }
export interface DateUncertainty { start: [number, number]; end: [number, number] }

export interface HistoryEntity extends HistoricalInterval {
  id: string;
  type: EntityType;
  title: string;
  description: string;
  point: GeoPoint | null;
  /** External reference or the local coverage page for an editorial overview. */
  url: string;
  note?: string;
  kind?: string;
  region?: string;
  displayDate?: string;
  precisionNote?: string;
  contextual?: boolean;
  dateLabel?: string;
  temporalKind?: string;
  uncertainty?: DateUncertainty;
  sourceIds?: string[];
  claimIds?: string[];
  regionIds?: string[];
}

export interface PlaceAssociation extends HistoricalInterval {
  subject: string;
  place: string;
  label: string;
  point: GeoPoint | null;
  source: string;
  claimIds?: string[];
  uncertainty?: DateUncertainty;
  temporalKind?: string;
  contextual?: boolean;
}

export interface HistoryRelationship {
  a: string;
  b: string;
  label: string;
  startYear?: number;
  endYear?: number;
  labelFromA?: string;
  labelFromB?: string;
  sourceUrls?: string[];
  basis?: string;
}

export interface HistoryDataset {
  entities: HistoryEntity[];
  associations: PlaceAssociation[];
  relationships: HistoryRelationship[];
  /** Legacy input retained intact until authored records are migrated. */
  collection?: unknown;
}
