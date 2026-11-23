import type { HistoryDataset } from '../domain/history.js';

type RecordValue = Record<string, unknown>;
export interface ReferenceRegistry {
  claimIds?: ReadonlySet<string>;
  sourceIds?: ReadonlySet<string>;
}
const object = (value: unknown): value is RecordValue => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const year = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value !== 0;
const url = (value: unknown): boolean => {
  if (!text(value)) return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};
const entityTypes = new Set(['person', 'area', 'state', 'city', 'period', 'event']);

/** Report all structural errors with paths. Never coerce, fill gaps or discard fields. */
export function validateHistory(input: unknown, registry: ReferenceRegistry = {}): string[] {
  const errors: string[] = [];
  const fail = (path: string, message: string): void => { errors.push(`${path}: ${message}`); };
  if (!object(input)) return ['history: expected an object'];
  const rows = (key: string): RecordValue[] => {
    const value = input[key];
    if (!Array.isArray(value)) { fail(key, 'expected an array'); return []; }
    return value.map((row: unknown, i: number) => {
      if (!object(row)) { fail(`${key}[${i}]`, 'expected an object'); return {}; }
      return row;
    });
  };
  const entities = rows('entities'), associations = rows('associations'), relationships = rows('relationships');
  const ids = new Set<string>();
  entities.forEach((row, i) => {
    if (!text(row.id)) fail(`entities[${i}].id`, 'expected a non-empty ID');
    else if (ids.has(row.id)) fail(`entities[${i}].id`, `duplicate ID ${row.id}`);
    else ids.add(row.id);
  });
  const strings = (row: RecordValue, path: string, keys: string[], optional = false): void => {
    for (const key of keys) {
      if (optional && row[key] === undefined) continue;
      if (optional ? typeof row[key] !== 'string' : !text(row[key])) fail(`${path}.${key}`, 'expected a string');
    }
  };
  const interval = (row: RecordValue, path: string, optional = false): void => {
    if (optional && row.startYear === undefined && row.endYear === undefined) return;
    for (const key of ['startYear', 'endYear']) if (!year(row[key])) fail(`${path}.${key}`, 'expected an integer historical year, without year zero');
    if (year(row.startYear) && year(row.endYear) && row.startYear > row.endYear) fail(path, 'startYear must not exceed endYear');
  };
  const point = (value: unknown, path: string): void => {
    if (value === null) return;
    if (!Array.isArray(value) || value.length !== 2 || !value.every(n => typeof n === 'number' && Number.isFinite(n)) || Math.abs(value[0]) > 180 || Math.abs(value[1]) > 90) fail(path, 'expected null or [longitude, latitude] within geographic bounds');
  };
  const reference = (value: unknown, path: string, known: ReadonlySet<string>): void => {
    if (!text(value) || !known.has(value)) fail(path, 'unknown reference');
  };
  const list = (row: RecordValue, path: string, key: string, known?: ReadonlySet<string>, urls = false): void => {
    const values = row[key];
    if (values === undefined) return;
    if (!Array.isArray(values)) { fail(`${path}.${key}`, 'expected an array'); return; }
    values.forEach((value: unknown, i: number) => {
      const p = `${path}.${key}[${i}]`;
      if (!text(value)) fail(p, 'expected a non-empty string');
      else if (known) reference(value, p, known);
      if (urls && !url(value)) fail(p, 'expected an HTTP(S) source URL');
    });
  };
  const datesAndClaims = (row: RecordValue, path: string): void => {
    if (row.contextual !== undefined && typeof row.contextual !== 'boolean') fail(`${path}.contextual`, 'expected a boolean');
    strings(row, path, ['temporalKind'], true);
    list(row, path, 'claimIds', registry.claimIds);
    if (row.uncertainty === undefined) return;
    if (!object(row.uncertainty)) { fail(`${path}.uncertainty`, 'expected date envelopes'); return; }
    for (const key of ['start', 'end']) {
      const bounds = row.uncertainty[key];
      if (!Array.isArray(bounds) || bounds.length !== 2 || !year(bounds[0]) || !year(bounds[1]) || bounds[0] > bounds[1]) fail(`${path}.uncertainty.${key}`, 'expected ordered historical-year bounds');
    }
  };
  entities.forEach((row, i) => {
    const path = `entities[${i}]`;
    strings(row, path, ['title', 'description']);
    strings(row, path, ['note', 'kind', 'region', 'displayDate', 'precisionNote', 'dateLabel'], true);
    if (typeof row.type !== 'string' || !entityTypes.has(row.type)) fail(`${path}.type`, 'unknown entity type');
    interval(row, path); point(row.point, `${path}.point`);
    // Editorial overview records may point to the site's research coverage page.
    if (!url(row.url) && row.url !== 'coverage.html' && row.url !== '/coverage.html') fail(`${path}.url`, 'expected an HTTP(S) source URL or the coverage page');
    list(row, path, 'regionIds', ids); list(row, path, 'sourceIds', registry.sourceIds);
    datesAndClaims(row, path);
  });
  associations.forEach((row, i) => {
    const path = `associations[${i}]`;
    reference(row.subject, `${path}.subject`, ids); reference(row.place, `${path}.place`, ids);
    strings(row, path, ['label']); interval(row, path); point(row.point, `${path}.point`);
    if (!url(row.source)) fail(`${path}.source`, 'expected an HTTP(S) source URL');
    datesAndClaims(row, path);
  });
  relationships.forEach((row, i) => {
    const path = `relationships[${i}]`;
    reference(row.a, `${path}.a`, ids); reference(row.b, `${path}.b`, ids);
    strings(row, path, ['label']); strings(row, path, ['labelFromA', 'labelFromB', 'basis'], true);
    interval(row, path, true); list(row, path, 'sourceUrls', undefined, true);
  });
  return errors;
}

export function parseHistory(input: unknown, registry: ReferenceRegistry = {}): HistoryDataset {
  const errors = validateHistory(input, registry);
  if (errors.length) throw new Error(`Invalid history data:\n${errors.join('\n')}`);
  return input as HistoryDataset;
}
