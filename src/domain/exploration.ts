import type {HistoryEntity,HistoricalInterval} from './history.js';
export interface ChronologyEvidence {claims?: Array<{id: string; validity?: {start?: {earliest?: number; latest?: number}}}>}
import {ordinal,overlaps} from './timeline.js';
export function dateMeaning(e: Pick<HistoryEntity,'type'|'title'|'dateLabel'|'note'>): string{
 const note=(e.dateLabel+' '+(e.note||'')).toLowerCase();
 if(e.type==='person')return /approx|uncertain|tentative|alternative|c\./.test(note)?'Approximate lifespan':'Lifespan';
 if(['area','city','state'].includes(e.type))return 'Place study window';
 if(/snapshot/.test(note))return 'Archaeological snapshot';
 if(/reign/.test(e.title.toLowerCase())||/reign.*not lifespan/.test(note))return 'Reign';
 if(/study window|editorial|broad context|contextual window|reign context/.test(note))return 'Context window';
 if(/approx|uncertain|dating unresolved|date uncertain/.test(note))return 'Approximate dates';
 return e.type==='event'?'Event':'Period';
}
export function ageAt(e: Pick<HistoryEntity,'type'|'startYear'|'endYear'|'claimIds'|'title'|'note'|'dateLabel'>,year: number,evidence?: ChronologyEvidence | null): string | null{
 if(e.type!=='person')return null;
 if(year<e.startYear)return 'Not yet born';
 if(year>e.endYear)return 'After recorded lifespan';
 const chronology=evidence?.claims?.find(c=>e.claimIds?.includes(c.id)&&/chronology/.test(c.id));
 const start=chronology?.validity?.start;
 const earliest=start?.earliest??e.startYear,latest=start?.latest??e.startYear;
 const low=Math.max(0,ordinal(year)-ordinal(latest)-1),high=Math.max(0,ordinal(year)-ordinal(earliest));
 const approximate=dateMeaning(e)==='Approximate lifespan';
 return `${approximate?'About ':''}${low===high?high:low+'–'+high} years${year===e.endYear?' · recorded death year':''}`;
}
export function peopleAt<T extends HistoryEntity>(entities: T[],year: number): T[]{return entities.filter(e=>e.type==='person'&&overlaps(e,year,year));}
export function compareLives(a: HistoricalInterval,b: HistoricalInterval): {overlap: true; start: number; end: number} | {overlap: false}{
 const start=Math.max(a.startYear,b.startYear),end=Math.min(a.endYear,b.endYear);
 return start<=end?{overlap:true,start,end}:{overlap:false};
}
export {clampMoment} from '../state/focus.js';
