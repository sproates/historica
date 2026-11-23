/** Cache successful requests, share in-flight work, and allow failed downloads to be retried. */
export function createEvidenceStore(load) {
    const cache = new Map();
    let latest = 0;
    const get = (id) => {
        let request = cache.get(id);
        if (!request) {
            request = load(`data/evidence/${encodeURIComponent(id)}.json`).catch(error => { cache.delete(id); throw error; });
            cache.set(id, request);
        }
        return request;
    };
    return { get, async select(id, apply, fail) {
            const request = ++latest;
            try {
                const pack = await get(id);
                if (request !== latest)
                    return false;
                apply(pack);
                return true;
            }
            catch {
                if (request === latest)
                    fail();
                return false;
            }
        } };
}
