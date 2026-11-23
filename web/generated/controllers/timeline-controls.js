import { yearAtFraction } from '../domain/timeline.js';
export function bindTimelineControls(root, app) {
    const lanes = root.getElementById('swimlanes'), jump = root.getElementById('jump-timeline'), heading = root.getElementById('swim-heading');
    if (!lanes || !jump || !heading)
        throw new Error('Missing timeline controls');
    const disposers = [];
    const pointers = new Set();
    const listen = (node, name, action) => { node.addEventListener(name, action); disposers.push(() => node.removeEventListener(name, action)); };
    const select = (event) => {
        // Rendering replaces the axis, so read the current element on each movement.
        const axis = lanes.querySelector('.swim-dates');
        if (!axis)
            return;
        const rect = axis.getBoundingClientRect();
        if (rect.width > 0)
            app.selectYear(yearAtFraction(app.getWindow(), (event.clientX - rect.left) / rect.width));
    };
    listen(lanes, 'pointerdown', event => {
        if (!(event.target instanceof Element) || !event.target.closest('.swim-dates'))
            return;
        const pointer = event;
        event.preventDefault();
        lanes.setPointerCapture(pointer.pointerId);
        pointers.add(pointer.pointerId);
        select(pointer);
    });
    listen(lanes, 'pointermove', event => {
        const pointer = event;
        if (pointer.buttons && lanes.hasPointerCapture(pointer.pointerId))
            select(pointer);
    });
    const release = (id) => { if (lanes.hasPointerCapture(id))
        lanes.releasePointerCapture(id); pointers.delete(id); };
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
        listen(lanes, name, event => release(event.pointerId));
    listen(lanes, 'click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-lane]') : null;
        const key = button?.dataset['lane'];
        if (!key)
            return;
        app.toggleLane(key);
        const replacement = [...lanes.querySelectorAll('[data-lane]')].find(node => node.dataset['lane'] === key);
        replacement?.focus({ preventScroll: true });
    });
    listen(jump, 'click', () => { heading.scrollIntoView({ behavior: 'smooth', block: 'start' }); heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); });
    return () => { for (const dispose of disposers)
        dispose(); for (const id of pointers)
        release(id); };
}
