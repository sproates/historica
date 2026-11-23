/** Fit projected map points with the same padding at build time and in the browser. */
export function fitMapCamera(points) {
    if (!points.length)
        return { x: 0, y: 0, w: 720 };
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const w = Math.min(720, Math.max(60, (right - left + 30) * 1.2, (bottom - top + 30) * 2.4));
    return { x: Math.max(0, Math.min(720 - w, (left + right - w) / 2)),
        y: Math.max(0, Math.min(360 - w / 2, (top + bottom - w / 2) / 2)), w };
}
