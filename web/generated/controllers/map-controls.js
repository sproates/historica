import { fitMapCamera } from '../domain/map-camera.js';
// Camera changes are independent of the selected entity and time window.
export function setupMap(svg, onChange = () => { }, root = document) {
    const button = (id) => {
        const node = root.getElementById(id);
        if (!node)
            throw new Error(`Missing map control: ${id}`);
        return node;
    };
    const zoomIn = button('map-in'), zoomOut = button('map-out'), world = button('map-world'), fitButton = button('map-fit');
    const borderInput = root.getElementById('map-borders');
    if (!borderInput)
        throw new Error('Missing map borders control');
    const disposers = [];
    function listen(name, handler, options) {
        svg.addEventListener(name, handler, options);
        disposers.push(() => svg.removeEventListener(name, handler, options));
    }
    const control = (node, name, handler) => {
        node.addEventListener(name, handler);
        disposers.push(() => node.removeEventListener(name, handler));
    };
    const initial = svg.getAttribute?.('viewBox')?.split(/\s+/).map(Number);
    let camera = initial?.length === 4 && initial.every(Number.isFinite) && initial[2] >= 30 && initial[2] <= 720 ? { x: initial[0], y: initial[1], w: initial[2] } : { x: 0, y: 0, w: 720 };
    let points = [], drag = null, suppressClick = false;
    const pointers = new Map();
    let silent = false, fitPending = false;
    function draw() {
        const h = camera.w / 2;
        camera.x = Math.max(0, Math.min(720 - camera.w, camera.x));
        camera.y = Math.max(0, Math.min(360 - h, camera.y));
        svg.setAttribute('viewBox', `${camera.x} ${camera.y} ${camera.w} ${h}`);
        zoomIn.disabled = camera.w <= 30;
        zoomOut.disabled = camera.w >= 720;
        if (!silent)
            onChange();
    }
    function zoom(factor) { const w = Math.max(30, Math.min(720, camera.w * factor)); camera.x += (camera.w - w) / 2; camera.y += (camera.w - w) / 4; camera.w = w; draw(); }
    control(zoomIn, 'click', () => zoom(.7));
    control(zoomOut, 'click', () => zoom(1 / .7));
    control(world, 'click', () => { camera = { x: 0, y: 0, w: 720 }; draw(); });
    function fit() {
        if (!points.length)
            return;
        camera = fitMapCamera(points);
        draw();
    }
    control(fitButton, 'click', fit);
    const borders = () => svg.style.setProperty('--border-opacity', borderInput.value);
    control(borderInput, 'input', () => { borders(); onChange(); });
    // Convert screen coordinates through the SVG's centred, aspect-preserving viewport.
    function local(x, y, c = camera) { const r = svg.getBoundingClientRect(), scale = Math.min(r.width / c.w, r.height / (c.w / 2)); return { x: (x - r.left - (r.width - c.w * scale) / 2) / scale, y: (y - r.top - (r.height - c.w / 2 * scale) / 2) / scale }; }
    function gesture() { const p = [...pointers.values()]; return { x: p.reduce((n, v) => n + v.x, 0) / p.length, y: p.reduce((n, v) => n + v.y, 0) / p.length, d: p.length > 1 ? Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y) : 0 }; }
    function rebase() { drag = pointers.size ? { ...gesture(), camera: { ...camera } } : null; }
    listen('wheel', e => {
        e.preventDefault();
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? svg.getBoundingClientRect().height : 1;
        if (e.ctrlKey) {
            const anchor = local(e.clientX, e.clientY), old = camera.w;
            camera.w = Math.max(30, Math.min(720, old * Math.exp(Math.max(-1, Math.min(1, e.deltaY * unit * .01)))));
            camera.x += anchor.x * (1 - camera.w / old);
            camera.y += anchor.y * (1 - camera.w / old);
        }
        else {
            const r = svg.getBoundingClientRect(), scale = Math.min(r.width / camera.w, r.height / (camera.w / 2));
            camera.x += e.deltaX * unit / scale;
            camera.y += e.deltaY * unit / scale;
        }
        draw();
    }, { passive: false });
    listen('pointerdown', e => {
        if (e.button !== 0)
            return;
        if (!pointers.size)
            suppressClick = false;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size > 1) {
            suppressClick = true;
            for (const id of pointers.keys())
                svg.setPointerCapture(id);
        }
        rebase();
    });
    listen('pointermove', e => {
        if (!pointers.has(e.pointerId) || !drag)
            return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const current = gesture();
        if (pointers.size === 1 && !suppressClick && Math.hypot(current.x - drag.x, current.y - drag.y) < 5)
            return;
        suppressClick = true;
        svg.setPointerCapture(e.pointerId);
        const anchor = local(drag.x, drag.y, drag.camera);
        camera.w = Math.max(30, Math.min(720, drag.camera.w * (drag.d > 0 && current.d > 0 ? drag.d / current.d : 1)));
        const now = local(current.x, current.y, camera);
        camera.x = drag.camera.x + anchor.x - now.x;
        camera.y = drag.camera.y + anchor.y - now.y;
        draw();
    });
    function finish(e) { if (!pointers.has(e.pointerId))
        return; pointers.delete(e.pointerId); rebase(); }
    listen('pointerup', finish);
    listen('pointercancel', finish);
    listen('lostpointercapture', finish);
    listen('click', e => { if (suppressClick) {
        e.stopPropagation();
        suppressClick = false;
    } }, true);
    listen('keydown', e => {
        const marker = e.target instanceof Element ? e.target.closest('[data-focus]') : null;
        if (marker && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            return;
        }
        const step = camera.w * .1;
        if (e.key === '+' || e.key === '=')
            zoom(.7);
        else if (e.key === '-')
            zoom(1 / .7);
        else if (e.key === 'ArrowLeft')
            camera.x -= step;
        else if (e.key === 'ArrowRight')
            camera.x += step;
        else if (e.key === 'ArrowUp')
            camera.y -= step;
        else if (e.key === 'ArrowDown')
            camera.y += step;
        else
            return;
        e.preventDefault();
        draw();
    });
    draw();
    borders();
    return { getState() { return { ...camera, borders: Number(borderInput.value) }; }, restore(saved, fitInitially = false) { fitPending = fitInitially; silent = true; camera = { x: saved.x, y: saved.y, w: saved.w }; borderInput.value = String(saved.borders); draw(); borders(); silent = false; }, fitOnNextUpdate() { fitPending = true; }, update(next) { points = next; fitButton.disabled = !points.length; silent = true; if (fitPending && points.length) {
            fitPending = false;
            fit();
        }
        else
            draw(); silent = false; }, dispose() {
            for (const dispose of disposers)
                dispose();
            for (const id of pointers.keys())
                if (svg.hasPointerCapture(id))
                    svg.releasePointerCapture(id);
            pointers.clear();
            drag = null;
        } };
}
