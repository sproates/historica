import { escapeHtml as esc } from '../presentation/html.js';
export function bindComparisonControls(root, app) {
    const first = root.getElementById('compare-first');
    const second = root.getElementById('compare-second');
    const reset = root.getElementById('compare-reset'), shared = root.getElementById('comparison-shared'), full = root.getElementById('comparison-full');
    if (!first || !second || !reset || !shared || !full)
        throw new Error('Missing comparison controls');
    const options = '<option value="">Choose a person</option>' + app.getEntities().filter(e => e.type === 'person').sort((a, b) => a.title.localeCompare(b.title)).map(e => `<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('');
    first.innerHTML = options;
    second.innerHTML = options;
    const disposers = [];
    const listen = (node, event, action) => { node.addEventListener(event, action); disposers.push(() => node.removeEventListener(event, action)); };
    const change = () => {
        const a = first.value, b = second.value, duplicate = Boolean(a && b && a === b);
        if (duplicate)
            second.value = '';
        app.selectPeople([a, duplicate ? '' : b], duplicate);
    };
    listen(first, 'change', change);
    listen(second, 'change', change);
    listen(reset, 'click', () => app.reset());
    listen(shared, 'click', () => app.selectScale('shared'));
    listen(full, 'click', () => app.selectScale('full'));
    return () => { for (const dispose of disposers)
        dispose(); };
}
