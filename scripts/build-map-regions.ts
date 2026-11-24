import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {geometry} from '../web/generated/presentation/history-page.js';
import {mainCountryRing,type Country} from '../src/explorer/state.ts';
const countries: {features:Array<{properties:{ADM0_A3:string};geometry:unknown}>}=JSON.parse(fs.readFileSync('web/data/ne_50m_admin_0_countries.json','utf8'));
const regions=countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry);
if(regions.length!==3)throw new Error('Missing Britain and Ireland map geography');
fs.writeFileSync('web/data/map-regions.json',JSON.stringify(regions)+'\n');

// One cacheable base map, rather than a copy inside every history document.
const land=countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg"><g id="land">${land}</g></svg>`;
const filename=`world-map-${createHash('sha256').update(svg).digest('hex').slice(0,12)}.svg`;
for(const old of fs.readdirSync('web/data').filter(name=>/^world-map-[a-f0-9]+\.svg$/.test(name)&&name!==filename))fs.unlinkSync('web/data/'+old);
fs.writeFileSync('web/data/'+filename,svg);
fs.writeFileSync('web/data/map-assets.json',JSON.stringify({land:`data/${filename}#land`})+'\n');
// Search needs a name and the framing bounds, not all border coordinates.
const index=countries.features.map(feature=>{
 const country=feature as Country,ring=mainCountryRing(country);
 if(!ring.length)throw new Error(`No bounds for ${country.properties.ADM0_A3}`);
 return {name:country.properties.NAME,code:country.properties.ADM0_A3,bounds:[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))]};
});
fs.writeFileSync('web/data/country-search.json',JSON.stringify(index)+'\n');
