/** Historical years use negative values for BCE and omit year zero. */
export const FIRST = -300000;
export const LAST = 2026;

export interface TimeWindow { start: number; end: number }
export interface TimelineState extends TimeWindow { moment: number }
export interface SharedTimelineState extends TimelineState { selection: string }
export type DatedRecord =
  | { date: { year: number; era: 'BCE' | 'CE' } }
  | { date?: undefined; startYear: number; endYear: number };

export const ordinal = (year: number): number => year < 0 ? year + 1 : year;
export const historical = (value: number): number => value <= 0 ? value - 1 : value;
export const clampYear = (year: number): number => Math.max(FIRST, Math.min(LAST, year === 0 ? 1 : year));

export function bounds(record: DatedRecord): [number, number] {
  if (record.date) {
    const year = record.date.era === 'BCE' ? -record.date.year : record.date.year;
    return [year, year];
  }
  return [record.startYear, record.endYear];
}

export function overlaps(record: DatedRecord, start: number, end: number): boolean {
  const [a, b] = bounds(record);
  return a <= end && b >= start;
}

export function position(year: number, start: number, end: number): number {
  return (ordinal(year) - ordinal(start)) / Math.max(1, ordinal(end) - ordinal(start));
}

export function windowAround(year: number, width: number): TimeWindow {
  const size = Math.min(ordinal(LAST) - ordinal(FIRST), Math.max(0, Math.round(width)));
  let a = ordinal(year) - Math.floor(size / 2);
  a = Math.max(ordinal(FIRST), Math.min(ordinal(LAST) - size, a));
  return { start: historical(a), end: historical(a + size) };
}

export function shiftWindow<T extends TimelineState>(state: T, direction: number): T {
  const size = ordinal(state.end) - ordinal(state.start);
  const delta = direction * Math.max(1, Math.round(size * .65));
  const a = Math.max(ordinal(FIRST), Math.min(ordinal(LAST) - size, ordinal(state.start) + delta));
  const actual = a - ordinal(state.start);
  return { ...state, start: historical(a), end: historical(a + size), moment: historical(ordinal(state.moment) + actual) };
}

export function zoomWindow<T extends TimelineState>(state: T, direction: number): T {
  const sizes = [0, 13, 99, 499, 1499, 12025, 302025];
  const width = ordinal(state.end) - ordinal(state.start);
  const size = direction > 0
    ? sizes.find(size => size > width) ?? 302025
    : [...sizes].reverse().find(size => size < width) ?? 0;
  return { ...state, ...windowAround(state.moment, size) };
}

export function readTimeline(hash: string, fallback = -329): SharedTimelineState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const number = (key: string): number => params.has(key) ? Number(params.get(key)) : NaN;
  const valid = (year: number): boolean => Number.isInteger(year) && year !== 0 && year >= FIRST && year <= LAST;
  const start = number('from'), end = number('to'), moment = number('moment');
  if (valid(number('year'))) fallback = number('year');
  const range = valid(start) && valid(end) && start <= end ? { start, end } : { start: -400, end: -301 };
  return {
    ...range,
    moment: valid(moment)
      ? Math.max(range.start, Math.min(range.end, moment))
      : Math.max(range.start, Math.min(range.end, fallback)),
    selection: params.get('story') || 'life-alexander',
  };
}

export function appendTimeline(hash: string, state: SharedTimelineState): string {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  for (const [key, value] of Object.entries({ from: state.start, to: state.end, moment: state.moment, story: state.selection })) {
    params.set(key, String(value));
  }
  return '#' + params.toString();
}
