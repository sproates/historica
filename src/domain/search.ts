import type {HistoryEntity} from './history.js';
export type SearchableHistory = HistoryEntity & {aliases?: string[]};
export type SearchEntry = Pick<HistoryEntity,'id'|'type'|'title'|'startYear'|'endYear'> & {text: string};
export interface SearchIndex {version: 1; entries: SearchEntry[]}
const normalize = (value: unknown): string => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const searchableText = (entity: SearchableHistory): string => normalize([entity.title,entity.type,entity.region,...(entity.aliases || []),entity.description,entity.note].join(' '));

function ranked<T extends {title: string}>(entities: T[], query: string, text: (entity: T)=>string): T[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  const matches: Array<{entity: T; score: number}> = [];
  for (const entity of entities) {
    const title = normalize(entity.title);
    const body = text(entity);
    if (!words.every(word => body.includes(word))) continue;
    const score = title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : words.every(word => title.includes(word)) ? 3 : 4;
    matches.push({entity,score});
  }
  return matches.sort((a,b) => a.score-b.score || a.entity.title.localeCompare(b.entity.title)).map(r => r.entity);
}
/** Search the complete collection, independently of the selected dates or region. */
export function searchEntities<T extends SearchableHistory>(entities: T[], query: string): T[] {
  return ranked(entities,query,searchableText);
}
/** Keep only result labels, routes, dates and searchable text; no graph or evidence records. */
export function createSearchIndex(entities: SearchableHistory[]): SearchIndex {
  return {version:1,entries:entities.map(entity=>{
    const {id,type,title,startYear,endYear}=entity;
    return {id,type,title,startYear,endYear,text:searchableText(entity)};
  })};
}
export function searchIndex(index: SearchIndex, query: string): SearchEntry[] {
  return ranked(index.entries,query,entry=>entry.text);
}
