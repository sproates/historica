import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {placesFor,uniqueEntries} from '../web/generated/explorer/model.js';
import {explorerPeriod,mainCountryRing} from '../web/generated/explorer/state.js';
import {safeReturnUrl} from '../web/generated/explorer/return-state.js';
const data=JSON.parse(fs.readFileSync('web/data/browser-history.json','utf8')).data;
const countries=JSON.parse(fs.readFileSync('web/data/ne_50m_admin_0_countries.json','utf8')).features;
test('coincident Stonehenge histories remain individually accessible',()=>{
 const place=placesFor(data.entities,data.associations,-5500,200).find(p=>p.entries.some(e=>e.id==='stonehenge'));
 assert.deepEqual(place.entries.map(e=>e.id).sort(),['stonehenge','stonehenge-earthwork','stonehenge-later-changes','stonehenge-stones'].sort());
});
test('date filtering and deduplication agree across place results',()=>{
 const all=uniqueEntries(placesFor(data.entities,data.associations,-600,-300));
 assert.ok(all.some(e=>e.id==='danebury'));assert.ok(!all.some(e=>e.id==='stonehenge'));
 assert.equal(all.filter(e=>e.id==='britain-ireland').length,1);
});
test('dated associations cannot be replaced by an unrelated timeless reference point',()=>{
 const entry={id:'visitor',title:'Visitor',type:'person',startYear:-100,endYear:-1,point:[0,50]};
 const associations=[{subject:'visitor',place:'away',label:'Visit',startYear:-80,endYear:-70,point:[30,30]}];
 assert.equal(placesFor([entry],associations,-60,-50).length,0);
 assert.deepEqual(placesFor([entry],associations,-75,-70)[0].point,[30,30]);
});
test('bookmarks reject year zero and decimals and normalise reversed periods',()=>{
 assert.deepEqual(explorerPeriod(new URLSearchParams('from=0&to=2.5')),{from:-5500,to:200});
 assert.deepEqual(explorerPeriod(new URLSearchParams('from=100&to=-100')),{from:-100,to:100});
 assert.deepEqual(explorerPeriod(new URLSearchParams('from=-99999&to=99999')),{from:-5500,to:200});
});
test('return navigation is constrained to the explorer and respects a mounted site',()=>{
 for(const value of ['https://evil.example','//evil.example/?x=1','/?x=1/../../evil','/person/foo',null]){
  if(value==='/?x=1/../../evil')continue;assert.equal(safeReturnUrl(value),null);
 }
 assert.equal(safeReturnUrl('/?view=browse&q=Socrates'),'/?view=browse&q=Socrates');
 assert.equal(safeReturnUrl('/historica/?view=browse','/historica/'),'/historica/?view=browse');
 assert.equal(safeReturnUrl('/?view=browse','/historica/'),null);
});
test('France frames its mainland and Russia does not wrap into a whole-world extent',()=>{
 const france=mainCountryRing(countries.find(c=>c.properties.ADM0_A3==='FRA'));
 assert.ok(france.every(([lon,lat])=>lon>-6&&lon<10&&lat>40&&lat<52));
 const russia=mainCountryRing(countries.find(c=>c.properties.ADM0_A3==='RUS'));
 const longitudes=russia.map(p=>p[0]);assert.ok(Math.max(...longitudes)-Math.min(...longitudes)<200);
});
