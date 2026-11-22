import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,changeFocus,focusAssociations,rankedContext,encodeFocus,decodeFocus} from '../web/focus-model.js';
const data=buildFocusData(JSON.parse(fs.readFileSync(new URL('../web/data/collection.json',import.meta.url))));
test('Alexander defaults to lifespan and people switch to their own lifespans',()=>{const s=initialFocus(data,'alexander');assert.deepEqual([s.start,s.end],[-356,-323]);const p=changeFocus(data,s,'philip');assert.deepEqual([p.start,p.end],[-382,-336]);assert.deepEqual([changeFocus(data,s,'ptolemy').start,changeFocus(data,s,'ptolemy').end],[-367,-283]);});
test('Egypt preserves the same visible period when changing focus',()=>{for(const s of [initialFocus(data,'alexander'),{...initialFocus(data,'alexander'),start:-331,end:-329}]){const e=changeFocus(data,s,'egypt');assert.equal(e.focus,'egypt');assert.deepEqual([e.start,e.end],[s.start,s.end]);}});
test('narrowing Alexander removes irrelevant map associations',()=>{const wide=focusAssociations(data,initialFocus(data,'alexander'));assert.ok(wide.some(a=>a.place==='egypt'));const narrow=focusAssociations(data,{...initialFocus(data,'alexander'),start:-329,end:-329});assert.ok(narrow.some(a=>a.place==='bactria'));assert.ok(!narrow.some(a=>a.place==='egypt'));});
test('Egypt associates Alexander and Ptolemy only within dated windows',()=>{const s={...initialFocus(data,'egypt'),start:-331,end:-331};assert.deepEqual(focusAssociations(data,s).map(a=>a.subject),['alexander']);assert.deepEqual(focusAssociations(data,{...s,start:-310,end:-310}).map(a=>a.subject),['ptolemy']);});
test('distance ranking uses overlapping dates and unknown locations remain unknown',()=>{const s={...initialFocus(data,'alexander'),start:-329,end:-329};const ranked=rankedContext(data,s);assert.equal(ranked[0].id,'stage-bactria');assert.equal(ranked.find(r=>r.id==='period').km,null);});
test('all six focus types exist; filters do not change focus; shared wider ranges survive',()=>{assert.equal(new Set(data.entities.map(e=>e.type)).size,6);const s={focus:'egypt',start:-356,end:-280,kind:'event',area:'egypt'};assert.deepEqual(decodeFocus(encodeFocus(s),data),s);rankedContext(data,s);assert.equal(s.focus,'egypt');});
test('expanded collection has unique sourced records and resolvable connections',()=>{
 const ids=new Set(data.entities.map(e=>e.id));assert.equal(ids.size,data.entities.length);
 for(const e of data.entities){assert.ok(e.url?.startsWith('https://')||e.url?.startsWith('http://'),e.id);assert.ok(e.startYear<=e.endYear,e.id);}
 for(const a of data.associations){assert.ok(ids.has(a.subject),a.subject);assert.ok(ids.has(a.place),a.place);assert.ok(a.source,a.subject);}
 for(const r of data.relationships){assert.ok(ids.has(r.a),r.a);assert.ok(ids.has(r.b),r.b);}
});
test('regional exploration keeps dates and new filters survive a shared URL',()=>{
 const s=changeFocus(data,initialFocus(data,'alexander'),'china');assert.deepEqual([s.start,s.end],[-356,-323]);
 const filtered={...s,area:'qin',kind:'period'};assert.deepEqual(decodeFocus(encodeFocus(filtered),data),filtered);
 assert.ok(rankedContext(data,filtered).some(e=>e.id==='qin-reforms'));
 assert.ok(!rankedContext(data,{...filtered,start:-300,end:-290}).some(e=>e.id==='qin-reforms'));
});
test('world collection reveals later history and contemporary lives',()=>{
 const s=initialFocus(data,'world-400-250');const rows=rankedContext(data,s);
 for(const id of ['first-punic','ashoka-edicts','chu-silk','olympias'])assert.ok(rows.some(e=>e.id===id),id);
 const people=rankedContext(data,{...initialFocus(data,'alexander'),kind:'person'});assert.ok(people.some(e=>e.id==='mencius'));assert.ok(people.every(e=>e.type==='person'));
});
