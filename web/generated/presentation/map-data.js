import { geometry } from './history-page.js';
/** Static pages already carry the complete base map. Legacy pages need the original fallback. */
export async function loadMapData(root, load) {
    const land = root.querySelector('#focus-map .modern-land');
    if (land?.childElementCount) {
        const regions = await load('data/map-regions.json');
        if (!Array.isArray(regions))
            throw new Error('Invalid map regions');
        regions.forEach(geometry);
        return { land: land.innerHTML, focusGeography: regions };
    }
    const countries = await load('data/ne_50m_admin_0_countries.json');
    return { land: countries.features.map(f => `<path d="${geometry(f.geometry)}"/>`).join(''), focusGeography: countries.features.filter(f => ['GBR', 'IRL', 'IMN'].includes(f.properties.ADM0_A3)).map(f => f.geometry) };
}
