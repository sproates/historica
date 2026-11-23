import type {HistoryDataset} from '../domain/history.js';
import {FIRST, LAST, ordinal, historical, windowAround} from '../domain/timeline.js';
import type {TimeWindow} from '../domain/timeline.js';

export type FocusData = Pick<HistoryDataset, 'entities'>;
export type ContextKind = 'all' | 'event' | 'period' | 'person';
export interface FocusState extends TimeWindow {focus: string; kind: ContextKind; area: string}
export const isContextKind = (value: unknown): value is ContextKind => typeof value === 'string' && ['all','event','period','person'].includes(value);
export const validYear = (year: number): boolean => Number.isInteger(year) && year !== 0 && year >= FIRST && year <= LAST;

export function initialFocus(data: FocusData, id: string | null = 'alexander'): FocusState {
  const entity = data.entities.find(e => e.id === id) ?? data.entities.find(e => e.id === 'alexander') ?? data.entities[0];
  if (!entity) throw new Error('Cannot choose a focus from an empty collection');
  return {focus: entity.id, start: entity.startYear, end: entity.endYear, kind: 'all', area: 'all'};
}

export function changeFocus(data: FocusData, state: FocusState, id: string): FocusState {
  const next = initialFocus(data, id);
  const entity = data.entities.find(e => e.id === next.focus)!;
  return ['area','state','city'].includes(entity.type) ? {...next, start: state.start, end: state.end} : next;
}

export function encodeFocus(state: FocusState): string {
  return '#' + new URLSearchParams({focus: state.focus, from: String(state.start), to: String(state.end), kind: state.kind, area: state.area});
}

export function decodeFocus(hash: string, data: FocusData): FocusState {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const state = initialFocus(data, p.get('focus'));
  const start = Number(p.get('from')), end = Number(p.get('to'));
  if (p.has('focus') && p.has('from') && p.has('to') && validYear(start) && validYear(end) && start <= end) {
    state.start = start; state.end = end;
  }
  const kind = p.get('kind'), area = p.get('area');
  if (isContextKind(kind)) state.kind = kind;
  if (area === 'all' || data.entities.some(e => e.id === area && ['area','state','city'].includes(e.type))) state.area = area!;
  return state;
}

export function focusEnvelope(data: FocusData, state: FocusState): TimeWindow {
  const entity = data.entities.find(e => e.id === state.focus);
  if (!entity) throw new Error('Unknown focus');
  return {start: Math.min(state.start, entity.startYear), end: Math.max(state.end, entity.endYear)};
}

export function clampMoment(moment: number | null, state: TimeWindow): number | null {
  return moment !== null && Number.isInteger(moment) && moment !== 0 ? Math.max(state.start, Math.min(state.end, moment)) : null;
}

export function midpoint(state: TimeWindow): number {
  return historical(Math.round((ordinal(state.start) + ordinal(state.end)) / 2));
}

export function zoomFocus(state: FocusState, factor: number): FocusState {
  const width = ordinal(state.end) - ordinal(state.start);
  return {...state, ...windowAround(midpoint(state), factor > 1 ? Math.max(13, width * factor) : width < 3 ? 0 : Math.floor(width * factor))};
}
