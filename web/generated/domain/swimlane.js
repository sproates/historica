import { ordinal, historical, position } from './timeline.js';
const regionAliases = { 'Warring States China': 'China', 'Kingdom of Macedonia': 'Macedonia', 'Britain': 'Britain and Ireland', 'Early Monte Albán': 'Oaxaca', 'Achaemenid Persia': 'Persia' };
const canonical = (name) => regionAliases[name] || name;
const explicitRegions = { 'philip-reign': 'Macedonia', 'philip-king': 'Macedonia', chaeronea: 'Greece', 'ptolemy-egypt': 'Egypt', 'ptolemy-rule': 'Egypt', 'ptolemy-king': 'Egypt', demosthenes: 'Athens', 'world-400-250': 'Across regions', period: 'Across regions', 'global-overview': 'Across regions' };
/** Lane membership describes recorded regional context, not an exact personal location. */
export function regionFor(entity, data, state) {
    const explicit = explicitRegions[entity.id];
    if (explicit)
        return explicit;
    if (entity.region)
        return canonical(entity.region);
    const names = (entity.regionIds || []).map(id => data.entities.find(e => e.id === id)?.title).filter((name) => Boolean(name)).map(canonical);
    if (names.length)
        return [...new Set(names)].join(' / ');
    const places = [...new Set(data.associations.filter(a => a.subject === entity.id && a.startYear <= state.end && a.endYear >= state.start).map(a => data.entities.find(e => e.id === a.place)?.title).filter((name) => Boolean(name)).map(canonical))];
    if (places.length)
        return places.length > 1 ? 'Across regions' : places[0];
    // Reuse only an identical reference point; do not infer ancient regions from proximity.
    const point = entity.point;
    const known = point && data.entities.find(e => e.id !== entity.id && e.point && e.point[0] === point[0] && e.point[1] === point[1] && (e.region || ['area', 'city', 'state'].includes(e.type)));
    return known ? canonical(known.region || known.title) : 'Location still being researched';
}
export function timelineLayout(focus, records, data, state) {
    const focusedRegion = regionFor(focus, data, state), groups = new Map();
    for (const e of records) {
        const name = regionFor(e, data, state);
        let group = groups.get(name);
        if (!group) {
            group = { name, entries: [], distance: Infinity };
            groups.set(name, group);
        }
        group.entries.push(e);
        group.distance = Math.min(group.distance, e.km ?? Infinity);
    }
    const ordered = [...groups.values()].sort((a, b) => (a.name === focusedRegion ? -1 : b.name === focusedRegion ? 1 : 0) || a.distance - b.distance || a.name.localeCompare(b.name));
    const first = ['area', 'state', 'city'].includes(focus.type) ? { ...focus, startYear: state.start, endYear: state.end } : focus;
    const groupsWithFocus = [{ name: 'Your focus', entries: [first], focus: true }, ...ordered];
    const lanes = groupsWithFocus.map(lane => {
        const occupied = [], items = [];
        for (const e of [...lane.entries].sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)) {
            if (e.endYear < state.start || e.startYear > state.end)
                continue;
            const single = state.start === state.end;
            const left = single ? 50 : 100 * position(Math.max(e.startYear, state.start), state.start, state.end);
            const right = single ? 50 : 100 * position(Math.min(e.endYear, state.end), state.start, state.end);
            // Reserve label space as well as the time span.
            const labelLeft = Math.min(left, 78), end = Math.max(right, labelLeft + 22);
            let row = occupied.findIndex(x => x + 2 <= labelLeft);
            if (row < 0)
                row = occupied.length;
            occupied[row] = end;
            items.push({ ...e, left, width: right - left, labelLeft, row, point: e.startYear === e.endYear, single, continuesBefore: e.startYear < state.start, continuesAfter: e.endYear > state.end });
        }
        return { ...lane, items, rows: Math.max(1, occupied.length) };
    });
    const span = ordinal(state.end) - ordinal(state.start);
    const ticks = span === 0 ? [state.start] : [...new Set(Array.from({ length: 6 }, (_, i) => historical(Math.round(ordinal(state.start) + span * i / 5))))];
    return { lanes, ticks };
}
export function laneView(lane, expanded = false) {
    const compact = !lane.focus && lane.rows > 3 && !expanded;
    return { ...lane, items: compact ? lane.items.filter(e => e.row < 3) : lane.items, rows: compact ? 3 : lane.rows, canCollapse: !lane.focus && lane.rows > 3, expanded: !compact, total: lane.items.length };
}
