import {decodeFocus,validYear} from './focus.js';
import type {FocusData,FocusState} from './focus.js';
import type {TimeWindow} from '../domain/timeline.js';
import type {MapCamera} from '../domain/map-camera.js';

export const bookmarkPanels = ['timeline-options','connections-panel','browse-panel'] as const;
export type BookmarkPanel = typeof bookmarkPanels[number];
export interface ViewState {
  moment: number | null;
  people: string[];
  map: MapCamera & {borders: number};
  envelope: TimeWindow;
  lanes: string[];
  panels: BookmarkPanel[];
  comparison: 'full' | 'shared';
  expanded: boolean;
  evidence: boolean;
}
export interface ExplorerSnapshot {state: FocusState; view: ViewState}
const unique = <T>(values: T[]): T[] => [...new Set(values)];
const laneNames = (values: string[]): string[] => unique(values.filter(v => typeof v === 'string' && v.length > 0 && v.length <= 100 && !/[\u0000-\u001f]/.test(v))).slice(0,50);

/** The browser adapter supplies its mount point; this module never reads location or the DOM. */
export function encodeView(state: FocusState, view: ViewState, data: FocusData, base = '/'): string {
  const f = data.entities.find(e => e.id === state.focus);
  if (!f) throw new Error('Unknown focus');
  const p = new URLSearchParams();
  if (state.start !== f.startYear || state.end !== f.endYear) {p.set('from',String(state.start));p.set('to',String(state.end));}
  if (state.kind !== 'all') p.set('kind',state.kind);
  if (state.area !== 'all') p.set('area',state.area);
  const defaults = {x:0,y:0,w:720,borders:1};
  for (const k of ['x','y','w','borders'] as const) if (view.map[k] !== defaults[k]) p.set(k,String(view.map[k]));
  if (view.moment !== null && Number.isInteger(view.moment) && view.moment !== 0 && view.moment >= state.start && view.moment <= state.end) p.set('year',String(view.moment));
  const people = unique(view.people || []).filter(id => data.entities.some(e => e.id === id && e.type === 'person')).slice(0,2);
  if (people.length === 2) for (const id of people) p.append('person',id);
  if (view.comparison === 'full') p.set('comparison','full');
  for (const name of laneNames(view.lanes || [])) p.append('lane',name);
  for (const name of bookmarkPanels) if ((view.panels || []).includes(name)) p.append('panel',name);
  if (view.expanded) p.set('expanded','1');
  if (view.evidence) p.set('evidence','1');
  if (view.envelope.start !== Math.min(state.start,f.startYear)) p.set('rangeFrom',String(view.envelope.start));
  if (view.envelope.end !== Math.max(state.end,f.endYear)) p.set('rangeTo',String(view.envelope.end));
  return base + `${f.type}/${encodeURIComponent(f.id)}/` + (p.size ? '?' + p : '');
}

export function decodeView(address: string, data: FocusData, base = '/'): ExplorerSnapshot {
  const url = new URL(address || '/', 'https://historica.online');
  const legacy = url.hash.startsWith('#focus=');
  const p = new URLSearchParams(legacy ? url.hash.slice(1) : url.search);
  if (!legacy) {
    const pathname = url.pathname.startsWith(base) ? '/' + url.pathname.slice(base.length) : url.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const entity = data.entities.find(e => e.type === parts[0] && e.id === parts[1]);
    p.set('focus',entity?.id || 'alexander');
  }
  const state = decodeFocus('#' + p,data);
  const number = (key: string, fallback: number): number => {
    const value = p.get(key);
    return value !== null && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;
  };
  const w = Math.max(30,Math.min(720,number('w',720)));
  const map = {w,x:Math.max(0,Math.min(720-w,number('x',0))),y:Math.max(0,Math.min(360-w/2,number('y',0))),borders:Math.max(0,Math.min(1,number('borders',1)))};
  const f = data.entities.find(e => e.id === state.focus)!;
  const start = number('rangeFrom',Math.min(state.start,f.startYear)), end = number('rangeTo',Math.max(state.end,f.endYear));
  const envelope = {start:validYear(start)?Math.min(start,state.start):Math.min(state.start,f.startYear),end:validYear(end)?Math.max(end,state.end):Math.max(state.end,f.endYear)};
  const selected = number('year',NaN);
  const people = unique(p.getAll('person')).filter(id => data.entities.some(e => e.id === id && e.type === 'person')).slice(0,2);
  return {state,view:{moment:validYear(selected)?Math.max(state.start,Math.min(state.end,selected)):null,people:people.length===2?people:[],map,envelope,lanes:laneNames(p.getAll('lane')),panels:bookmarkPanels.filter(name=>p.getAll('panel').includes(name)),comparison:p.get('comparison')==='full'?'full':'shared',expanded:p.get('expanded')==='1',evidence:p.get('evidence')==='1'}};
}
