/** Historical years use negative values for BCE and omit year zero. */
export const FIRST = -300000;
export const LAST = 2026;
export const ordinal = (year) => year < 0 ? year + 1 : year;
export const historical = (value) => value <= 0 ? value - 1 : value;
export const clampYear = (year) => Math.max(FIRST, Math.min(LAST, year === 0 ? 1 : year));
export function bounds(record) {
    if (record.date) {
        const year = record.date.era === 'BCE' ? -record.date.year : record.date.year;
        return [year, year];
    }
    return [record.startYear, record.endYear];
}
export function overlaps(record, start, end) {
    const [a, b] = bounds(record);
    return a <= end && b >= start;
}
export function position(year, start, end) {
    return (ordinal(year) - ordinal(start)) / Math.max(1, ordinal(end) - ordinal(start));
}
export function windowAround(year, width) {
    const size = Math.min(ordinal(LAST) - ordinal(FIRST), Math.max(0, Math.round(width)));
    let a = ordinal(year) - Math.floor(size / 2);
    a = Math.max(ordinal(FIRST), Math.min(ordinal(LAST) - size, a));
    return { start: historical(a), end: historical(a + size) };
}
export function shiftWindow(state, direction) {
    const size = ordinal(state.end) - ordinal(state.start);
    const delta = direction * Math.max(1, Math.round(size * .65));
    const a = Math.max(ordinal(FIRST), Math.min(ordinal(LAST) - size, ordinal(state.start) + delta));
    const actual = a - ordinal(state.start);
    return { ...state, start: historical(a), end: historical(a + size), moment: historical(ordinal(state.moment) + actual) };
}
export function zoomWindow(state, direction) {
    const sizes = [0, 13, 99, 499, 1499, 12025, 302025];
    const width = ordinal(state.end) - ordinal(state.start);
    const size = direction > 0
        ? sizes.find(size => size > width) ?? 302025
        : [...sizes].reverse().find(size => size < width) ?? 0;
    return { ...state, ...windowAround(state.moment, size) };
}
export function readTimeline(hash, fallback = -329) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const number = (key) => params.has(key) ? Number(params.get(key)) : NaN;
    const valid = (year) => Number.isInteger(year) && year !== 0 && year >= FIRST && year <= LAST;
    const start = number('from'), end = number('to'), moment = number('moment');
    if (valid(number('year')))
        fallback = number('year');
    const range = valid(start) && valid(end) && start <= end ? { start, end } : { start: -400, end: -301 };
    return {
        ...range,
        moment: valid(moment)
            ? Math.max(range.start, Math.min(range.end, moment))
            : Math.max(range.start, Math.min(range.end, fallback)),
        selection: params.get('story') || 'life-alexander',
    };
}
export function appendTimeline(hash, state) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    for (const [key, value] of Object.entries({ from: state.start, to: state.end, moment: state.moment, story: state.selection })) {
        params.set(key, String(value));
    }
    return '#' + params.toString();
}
