import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {placesFor,uniqueEntries,ordinal,calendar,type Entry,type Association} from './model.ts';
const data=JSON.parse(readFileSync(new URL('../../web/data/browser-history.json',import.meta.url),'utf8')).data as {entities:Entry[];associations:Association[]};
test('Stonehenge exposes all four entries sharing its location',()=>{
 const places=placesFor(data.entities,data.associations,-5500,200);
 const stonehenge=places.find(p=>p.entries.some(e=>e.id==='stonehenge'))!;
 assert.deepEqual(stonehenge.entries.map(e=>e.id).sort(),['stonehenge','stonehenge-earthwork','stonehenge-later-changes','stonehenge-stones'].sort());
});
test('date filtering removes Stonehenge but retains Iron Age Danebury',()=>{
 const entries=uniqueEntries(placesFor(data.entities,data.associations,-600,-300));
 assert.ok(entries.some(e=>e.id==='danebury'));assert.ok(!entries.some(e=>e.id==='stonehenge'));
});
test('dated travel evidence does not fall back to a timeless location',()=>{
 const person:Entry={id:'traveller',title:'Traveller',type:'person',startYear:-100,endYear:-1,point:[0,50]};
 const associations:Association[]=[{subject:'traveller',place:'away',label:'Visit',startYear:-80,endYear:-70,point:[30,30]}];
 assert.equal(placesFor([person],associations,-60,-50).length,0);
 assert.deepEqual(placesFor([person],associations,-75,-70)[0]!.point,[30,30]);
});
test('the same record at multiple locations is listed once',()=>{
 const all=placesFor(data.entities,data.associations,-5500,200);const entries=uniqueEntries(all);
 assert.equal(entries.filter(e=>e.id==='britain-ireland').length,1);
});
test('BCE to CE calculations have no year zero',()=>{
 assert.equal(ordinal(1)-ordinal(-1),1);assert.equal(calendar(0),-1);assert.equal(calendar(1),1);
});
