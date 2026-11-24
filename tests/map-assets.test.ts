import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {mainCountryRing} from '../src/explorer/state.ts';
import {geometry} from '../web/generated/presentation/history-page.js';
const countries=JSON.parse(fs.readFileSync('web/data/ne_50m_admin_0_countries.json','utf8')).features;
test('country search preserves mainland framing without shipping border geometry',()=>{
 const index=JSON.parse(fs.readFileSync('web/data/country-search.json','utf8'));
 assert.equal(index.length,countries.length);
 for(const country of countries){
  const item=index.find(c=>c.code===country.properties.ADM0_A3),ring=mainCountryRing(country);
  assert.equal(item.name,country.properties.NAME);
  assert.deepEqual(item.bounds,[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))]);
 }
 assert.ok(fs.statSync('web/data/country-search.json').size<40_000);
});
test('shared SVG retains every country and path with a bounded coordinate precision',()=>{
 const asset=JSON.parse(fs.readFileSync('web/data/map-assets.json','utf8')).land;
 assert.match(asset,/^data\/world-map-[a-f0-9]{12}\.svg#land$/);
 const svg=fs.readFileSync('web/'+asset.split('#')[0],'utf8');
 assert.equal((svg.match(/<path /g)||[]).length,countries.length);
 for(const country of countries)assert.ok(svg.includes(`d="${geometry(country.geometry)}"`));
 assert.ok(gzipSync(svg).length<500_000);
 assert.equal(geometry({type:'Polygon',coordinates:[[[1.123456,2.234567],[2,3],[1.123456,2.234567]]]}),'M362.25,175.53L364,174L362.25,175.53Z');
});
