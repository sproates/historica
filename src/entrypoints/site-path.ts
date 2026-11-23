// Derive the mount point from this module, not the current history route.
// File imports in Node use the root default; tests can pass an explicit base.
export const siteBase = import.meta.url.startsWith('file:') ? '/' : new URL('../../', import.meta.url).pathname;
export function sitePath(path: string, base = siteBase) {
  return base + path.replace(/^\//, '');
}
export function unmountPath(path: string, base = siteBase) {
  return path.startsWith(base) ? '/' + path.slice(base.length) : path;
}
