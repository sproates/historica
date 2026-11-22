import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,temporalLabel,initialFocus,changeFocus,rankedContext,focusAssociations} from '../web/focus-model.js';
import {encodeView,decodeView} from '../web/view-url.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const exploration=read('web/data/reviewed-exploration.json');
const evidence=read('web/data/reviewed-evidence.json');
const data=buildFocusData(read('web/data/collection.json'),exploration);
test('Socrates can lead to Britain and Ireland without changing the visible dates',()=>{
 const state=changeFocus(data,initialFocus(data,'socrates'),'britain-ireland');
 assert.deepEqual([state.start,state.end],[-469,-399]);
 for(const id of ['danebury-life','broxmouth','ireland-iron-age']) assert.ok(rankedContext(data,state).some(e=>e.id===id));
 const filtered=rankedContext(data,{...state,area:'britain-ireland'});
 assert.deepEqual(filtered.map(e=>e.id).sort(),['broxmouth','danebury-life','doogarrymore-wheels','henllys-community','ireland-iron-age']);
 assert.ok(focusAssociations(data,state).some(a=>a.place==='danebury'));
 assert.deepEqual(decodeView(encodeView(state,decodeView('',data).view,data),data).state,state);
});
test('regional archaeology preserves uncertain dates and does not become exact-year events',()=>{
 for(const e of exploration.entities.filter(e=>e.type==='period')) {assert.equal(e.contextual,true);assert.ok(e.note);assert.ok(e.claimIds.length);}
 const broxmouth=exploration.entities.find(e=>e.id==='broxmouth');
 assert.deepEqual([broxmouth.startYear,broxmouth.endYear],[-640,210]);
 assert.equal(broxmouth.point,null);
 assert.match(broxmouth.note,/68% probability/);
 assert.ok(!rankedContext(data,{...initialFocus(data,'socrates'),kind:'event'}).some(e=>e.id==='broxmouth'));
 assert.ok(!focusAssociations(data,{...initialFocus(data,'britain-ireland'),start:100,end:100}).some(a=>a.place==='danebury'));
 assert.ok(!rankedContext(data,{...initialFocus(data,'socrates'),start:401,end:500}).some(e=>e.regionIds?.includes('britain-ireland')));
});
test('every regional assertion link resolves to reviewed evidence and every map point has provenance',()=>{
 const regional=read('research/evidence/britain-ireland-exploration.json');
 for(const key of ['entities','associations','relationships']) for(const item of regional[key])assert.ok(exploration[key].some(x=>JSON.stringify(x)===JSON.stringify(item))); 
 for(const e of exploration.entities){
  for(const id of e.claimIds)assert.equal(evidence.claims.find(c=>c.id===id)?.status,'accepted');
  if(e.point)assert.ok(e.claimIds.some(id=>{const c=evidence.claims.find(c=>c.id===id);return c.value.type==='point'&&JSON.stringify(c.value.coordinates)===JSON.stringify(e.point);}));
 }
 assert.equal(new Set(data.entities.map(e=>e.id)).size,data.entities.length);
});
test('uncertain Welsh occupation is possible in 399 BCE and absent before its date envelope',()=>{
 const e=data.entities.find(e=>e.id==='henllys-community');
 assert.equal(temporalLabel(e,{start:-399,end:-399}),'Possible overlap · dates uncertain');
 const state={...initialFocus(data,'britain-ireland'),area:'britain-ireland',start:-399,end:-399};
 assert.ok(rankedContext(data,state).some(r=>r.id===e.id));
 assert.ok(focusAssociations(data,state).some(a=>a.place==='castell-henllys'));
 assert.ok(!rankedContext(data,{...state,start:-469,end:-411}).some(r=>r.id===e.id));
 assert.ok(!focusAssociations(data,{...state,start:-469,end:-411}).some(a=>a.place==='castell-henllys'));
 assert.ok(!rankedContext(data,{...state,start:-189,end:-150}).some(r=>r.id===e.id));
});
test('later Irish roadway is excluded from Socrates and retains construction dating uncertainty',()=>{
 const s=initialFocus(data,'socrates');
 assert.ok(!rankedContext(data,s).some(e=>e.id==='corlea-construction'));
 const later={...s,start:-148,end:-147,area:'britain-ireland'};
 const road=rankedContext(data,later).find(e=>e.id==='corlea-construction');
 assert.ok(road);assert.equal(road.type,'event');
 assert.equal(focusAssociations(data,{...later,area:'all',focus:'corlea-construction'})[0].place,'corlea');
 assert.equal(temporalLabel(road,later),'Date uncertain within this range');
 assert.ok(focusAssociations(data,{...later,focus:'britain-ireland'}).some(a=>a.place==='corlea'));
 const wheels=data.entities.find(e=>e.id==='doogarrymore-wheels');
 assert.equal(temporalLabel(wheels,{start:-399,end:-399}),'Date uncertain within this range');
 assert.equal(wheels.point,null);
});
