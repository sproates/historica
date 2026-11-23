import { isContextKind } from '../state/focus.js';
export function bindNavigationControls(root, app) {
    const picker = root.getElementById('focus-picker');
    const main = root.querySelector('main'), whole = root.getElementById('whole-period'), more = root.getElementById('more-context'), back = root.getElementById('back');
    if (!picker || !main || !whole || !more || !back)
        throw new Error('Missing navigation controls');
    const disposers = [];
    const listen = (node, name, action) => { node.addEventListener(name, action); disposers.push(() => node.removeEventListener(name, action)); };
    listen(picker, 'change', () => app.focus(picker.value));
    listen(main, 'click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-focus],[data-filter]') : null;
        if (!button || button.hasAttribute('disabled'))
            return;
        const id = button.dataset['focus'], area = button.dataset['filter'], kind = button.dataset['kind'];
        if (id)
            app.focus(id, isContextKind(kind) ? kind : 'all');
        else if (area)
            app.filter(area);
    });
    listen(whole, 'click', () => app.wholePeriod());
    listen(more, 'click', () => app.toggleContext());
    listen(back, 'click', () => app.back());
    return () => { for (const dispose of disposers)
        dispose(); };
}
