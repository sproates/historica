import type {GeoPoint} from '../domain/history.js';
import {geometry} from './history-page.js';
export interface MapData {land: string; focusGeography: unknown[]; regionPoints: GeoPoint[]}
/** Static pages already reference the shared base map. Legacy pages need the original fallback. */
export async function loadMapData(root: Pick<Document,'querySelector'>, load: (url: string)=>Promise<unknown>): Promise<MapData> {
  const land=root.querySelector('#focus-map .modern-land');
  if(land?.childElementCount){
    const regions=await load('data/map-regions.json');
    if(!Array.isArray(regions))throw new Error('Invalid map regions');
    regions.forEach(geometry);
    return {land:land.innerHTML,focusGeography:regions,regionPoints:regionCoordinates(regions)};
  }
  const countries=await load('data/ne_50m_admin_0_countries.json') as {features: Array<{properties: {ADM0_A3: string}; geometry: unknown}>};
  const regions=countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry);
  return {regionPoints:regionCoordinates(regions),land:countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join(''),focusGeography:countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry)};
}

/** Extract the same coordinates used by the map paths, validating before fitting. */
function regionCoordinates(regions: unknown[]): GeoPoint[] {
 const points: GeoPoint[]=[];
 const visit=(value: unknown): void=>{
  if(!Array.isArray(value))throw new Error('Invalid region coordinates');
  if(typeof value[0]==='number'&&typeof value[1]==='number'){points.push([value[0],value[1]]);return;}
  value.forEach(visit);
 };
 for(const region of regions){geometry(region);visit((region as {coordinates: unknown}).coordinates);}
 return points;
}
