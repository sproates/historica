import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMapData} from '../web/generated/presentation/map-data.js';
import {geometry} from '../web/generated/presentation/history-page.js';
const read=path=>JSON.parse(fs.readFileSync(`web/${path}`,'utf8'));
const countries=read('data/ne_50m_admin_0_countries.json');
const regions=countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry);

test('static pages reuse their existing outlines and request only regional geography',async()=>{
 const requests=[];
 const land=countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join('');
 const result=await loadMapData({querySelector:()=>({childElementCount:countries.features.length,innerHTML:land})},async path=>{requests.push(path);return read(path);});
 assert.deepEqual(requests,['data/map-regions.json']);
 assert.equal(result.land,land);
 assert.deepEqual(result.focusGeography,regions);
 assert.ok(fs.statSync('web/data/map-regions.json').size<fs.statSync('web/data/ne_50m_admin_0_countries.json').size*.1);
});

test('legacy pages still load full geography and produce the same base map',async()=>{
 for(const element of [null,{childElementCount:0,innerHTML:''}]){
  const requests=[];
  const result=await loadMapData({querySelector:()=>element},async path=>{requests.push(path);return read(path);});
  assert.deepEqual(requests,['data/ne_50m_admin_0_countries.json']);
  assert.equal(result.land,countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join(''));
  assert.deepEqual(result.focusGeography,regions);
 }
});

test('invalid regional geometry fails instead of silently removing the highlight',async()=>{
 await assert.rejects(loadMapData({querySelector:()=>({childElementCount:1,innerHTML:'<path/>'})},async()=>({})),/Invalid map regions/);
 await assert.rejects(loadMapData({querySelector:()=>({childElementCount:1,innerHTML:'<path/>'})},async()=>[{type:'Polygon',coordinates:[[['bad',0]]]}]),/Invalid coordinate/);
});
