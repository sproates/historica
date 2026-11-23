import { initialFocus } from '../state/focus.js';
import { rankedContext, focusAssociations, relatedEntities } from '../domain/history-queries.js';
import { comparisonRecords, comparisonLayout, comparisonExplanation } from '../domain/comparison.js';
import { timelineLayout } from '../domain/swimlane.js';
export const year = (y) => `${Math.abs(y).toLocaleString('en-GB')} ${y < 0 ? 'BCE' : 'CE'}`;
export const dates = (a, b) => a === b ? year(a) : `${year(a)} – ${year(b)}`;
export const href = (e) => `/${e.type}/${e.id}`;
export const xy = (p) => [(p[0] + 180) * 2, 180 - p[1] * 2];
function object(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`Invalid ${label}`);
    return value;
}
function array(value, label) {
    if (!Array.isArray(value))
        throw new Error(`Invalid ${label}`);
    return value;
}
function text(value, label) {
    if (typeof value !== 'string')
        throw new Error(`Invalid ${label}`);
    return value;
}
function optionalText(value, label) { return value == null ? '' : text(value, label); }
/** Validate coordinates at the JSON boundary before projecting polygon paths. */
export function geometry(value) {
    const g = object(value, 'geometry');
    const ring = (value) => array(value, 'polygon ring').map((value, i) => {
        const point = array(value, 'coordinate');
        const x = point[0], y = point[1];
        if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y))
            throw new Error('Invalid coordinate');
        return `${i ? 'L' : 'M'}${xy([x, y]).join(',')}`;
    }).join('') + 'Z';
    if (g['type'] === 'Polygon')
        return array(g['coordinates'], 'polygon').map(ring).join('');
    if (g['type'] === 'MultiPolygon')
        return array(g['coordinates'], 'multipolygon').flatMap(p => array(p, 'polygon').map(ring)).join('');
    return '';
}
/** Resolve checked statements once, so templates never perform unchecked reference lookups. */
function checkedStatements(value, focus) {
    const evidence = object(value, 'evidence pack');
    const claims = array(evidence['claims'], 'claims').map(c => object(c, 'claim'));
    const passages = array(evidence['evidence'], 'evidence').map(e => object(e, 'evidence record'));
    const sources = array(evidence['sources'], 'sources').map(s => object(s, 'source'));
    return claims.filter(c => (c['subjectId'] === focus.id || focus.claimIds?.includes(String(c['id']))) && c['status'] === 'accepted').map(c => ({
        statement: text(c['statement'], 'statement'),
        citations: array(c['evidenceIds'], 'evidence IDs').map(id => {
            const passage = passages.find(e => e['id'] === id);
            if (!passage)
                throw new Error(`Missing evidence: ${String(id)}`);
            const source = sources.find(s => s['id'] === passage['sourceId']);
            if (!source)
                throw new Error(`Missing source: ${String(passage['sourceId'])}`);
            return { url: text(source['url'], 'source URL'), title: text(source['title'], 'source title'), creator: optionalText(source['creator'], 'source creator'), locator: optionalText(passage['locator'], 'evidence locator'), note: optionalText(passage['note'], 'evidence note') };
        }),
    }));
}
export function createHistoryPage(data, id, evidence, countries) {
    const focus = data.entities.find(e => e.id === id);
    if (!focus)
        throw new Error(`Unknown static history: ${id}`);
    const state = initialFocus(data, id), ranked = rankedContext(data, state);
    const picks = comparisonRecords(focus, ranked, data, state), associations = focusAssociations(data, state);
    const located = associations.filter((a) => a.point !== null);
    const places = [...new Map(located.map(a => [`${a.point.join(',')}:${a.label}`, a])).values()];
    const features = array(object(countries, 'countries')['features'], 'country features');
    const region = focus.id === 'britain-ireland' ? features.filter(f => ['GBR', 'IRL', 'IMN'].includes(String(object(object(f, 'country')['properties'], 'country properties')['ADM0_A3']))) : [];
    const regionPoints = [];
    const collect = (value) => {
        const values = array(value, 'region coordinates');
        if (typeof values[0] === 'number' && typeof values[1] === 'number')
            regionPoints.push([values[0], values[1]]);
        else
            values.forEach(collect);
    };
    for (const feature of region)
        collect(object(object(feature, 'country')['geometry'], 'region geometry')['coordinates']);
    let bactriaOutline = null;
    if (places.some(a => a.place === 'bactria')) {
        const overlays = array(object(data.collection, 'collection')['historicalOverlays'], 'historical overlays');
        bactriaOutline = geometry(object(overlays[0], 'Bactria overlay')['geometry']);
    }
    return { data, focus, state, ranked, places, focusPoint: ['area', 'city', 'state'].includes(focus.type) ? focus.point : null, checked: checkedStatements(evidence, focus),
        comparisons: comparisonLayout([focus, ...picks], state), explanation: comparisonExplanation(picks, state),
        timeline: timelineLayout(focus, ranked, data, state), related: relatedEntities(data, state).filter(e => e.type !== 'event'),
        regionPaths: region.map(f => geometry(object(f, 'country')['geometry'])), regionPoints,
        land: features.map(f => geometry(object(f, 'country feature')['geometry'])),
        references: [...new Set([focus.url, ...associations.map(a => a.source)].filter(Boolean))], bactriaOutline };
}
