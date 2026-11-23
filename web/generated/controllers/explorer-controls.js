import { historical, ordinal } from '../domain/timeline.js';
import { initialFocus, isContextKind, midpoint, zoomFocus } from '../state/focus.js';
/** Attach input behaviour without owning page rendering, browser history or application state. */
export function bindExplorerControls(root, app) {
    const disposers = [];
    const element = (id, tag) => {
        const node = root.getElementById(id);
        if (!node || node.tagName.toLowerCase() !== tag)
            throw new Error(`Missing ${tag} control: ${id}`);
        return node;
    };
    const listen = (node, event, action) => {
        node.addEventListener(event, action);
        disposers.push(() => node.removeEventListener(event, action));
    };
    const button = (id, action) => listen(element(id, 'button'), 'click', action);
    const input = (id) => element(id, 'input');
    const start = input('start'), end = input('end'), enabled = input('year-enabled'), cursor = input('year-cursor');
    const kind = element('kind', 'select'), area = element('area', 'select');
    listen(start, 'input', () => {
        const state = app.getState();
        app.setState({ ...state, start: Math.min(historical(Number(start.value)), state.end) }, false);
    });
    listen(end, 'input', () => {
        const state = app.getState();
        app.setState({ ...state, end: Math.max(historical(Number(end.value)), state.start) }, false);
    });
    button('zoom-in', () => app.setState(zoomFocus(app.getState(), .5), true));
    button('zoom-out', () => app.setState(zoomFocus(app.getState(), 2), true));
    button('fit', () => {
        const state = app.getState(), full = initialFocus(app.getData(), state.focus);
        app.setState({ ...state, start: full.start, end: full.end }, true);
    });
    listen(enabled, 'change', () => app.setMoment(enabled.checked ? midpoint(app.getState()) : null));
    listen(cursor, 'input', () => app.setMoment(historical(Number(cursor.value))));
    for (const [id, step] of [['year-prev', -1], ['year-next', 1]])
        button(id, () => {
            const moment = app.getMoment();
            if (moment !== null)
                app.setMoment(historical(ordinal(moment) + step));
        });
    listen(kind, 'change', () => {
        if (isContextKind(kind.value))
            app.setState({ ...app.getState(), kind: kind.value }, false);
    });
    listen(area, 'change', () => {
        if (area.value === 'all' || app.getData().entities.some(e => e.id === area.value && ['area', 'state', 'city'].includes(e.type))) {
            app.setState({ ...app.getState(), area: area.value }, false);
        }
    });
    button('clear', () => app.setState({ ...app.getState(), kind: 'all', area: 'all' }, false));
    return () => { for (const dispose of disposers)
        dispose(); };
}
