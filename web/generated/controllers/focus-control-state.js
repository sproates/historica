import { ordinal, FIRST, LAST } from '../domain/timeline.js';
/** Synchronise form controls without replacing the generated history, timeline, map or evidence. */
export function syncFocusControls(root, state, envelope, canGoBack, year) {
    const node = (id) => {
        const value = root.getElementById(id);
        if (!value)
            throw new Error(`Missing focus control: ${id}`);
        return value;
    };
    node('back').disabled = !canGoBack;
    node('focus-picker').value = state.focus;
    node('kind').value = state.kind;
    node('area').value = state.area;
    for (const [id, value] of [['start', state.start], ['end', state.end]]) {
        const input = node(id);
        input.min = String(ordinal(envelope.start));
        input.max = String(ordinal(envelope.end));
        input.value = String(ordinal(value));
        input.setAttribute('aria-valuetext', year(value));
        node(`${id}-label`).textContent = year(value);
    }
    node('zoom-in').disabled = state.start === state.end;
    node('zoom-out').disabled = state.start === FIRST && state.end === LAST;
}
