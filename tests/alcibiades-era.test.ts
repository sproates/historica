import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,changeFocus,rankedContext,relatedEntities,focusAssociations} from '../scripts/lib/focus-data.ts';
import {validateEvidence} from '../scripts/lib/evidence.ts';
import {searchEntities} from '../web/generated/domain/search.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/alcibiades-era-reviewed.json');
const adapter=read('research/evidence/alcibiades-era-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const links=id=>relatedEntities(data,initialFocus(data,id)).map(e=>e.id);
test('Alcibiades batch has evidence, linked entries and verified geographical references',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 assert.equal(adapter.entities.length,22);
 for(const e of adapter.entities){
  assert.ok(e.description.includes('\n\n'),e.id);
  assert.ok(links(e.id).some(id=>id!==e.id),e.id);
  assert.ok(e.claimIds.every(id=>pack.claims.some(c=>c.id===id&&c.subjectId===e.id)),e.id);
  if(e.point)assert.ok(e.claimIds.some(id=>pack.claims.some(c=>c.id===id&&c.value.type==='point'&&JSON.stringify(c.value.coordinates)===JSON.stringify(e.point))),e.id);
 }
 assert.equal(searchEntities(data.entities,'Alcibiades')[0].id,'alcibiades');
});
test('Alcibiades connects to Socrates, commanders, places and war; places preserve time',()=>{
 for(const id of ['socrates','pericles','nicias','sparta','athens','peloponnesian-war','sicilian-expedition'])assert.ok(links('alcibiades').includes(id),id);
 const s=initialFocus(data,'alcibiades');
 assert.deepEqual([s.start,s.end],[-450,-404]);
 for(const id of ['sparta','syracuse','athens']){const n=changeFocus(data,s,id);assert.deepEqual([n.start,n.end],[-450,-404]);}
 const n=changeFocus(data,s,'socrates');assert.deepEqual([n.start,n.end],[-469,-399]);
 assert.ok(links('socrates').includes('arginusae-trial'));
 assert.ok(links('athens-democracy-restored').includes('socrates-trial'));
});
test('war comparison includes global context and Egypt while keeping later events outside the window',()=>{
 const ids=rankedContext(data,initialFocus(data,'alcibiades')).map(e=>e.id);
 for(const id of ['socrates','peloponnesian-war','sicilian-expedition','darius-ii-reign','amyrtaeus-accession','eastern-zhou','danebury-life','chavin-context'])assert.ok(ids.includes(id),id);
 for(const id of ['socrates-trial','athens-democracy-restored','julius-caesar'])assert.ok(!ids.includes(id),id);
});
test('Alcibiades has dated Sparta and Athens episodes, not a fabricated continuous itinerary',()=>{
 const s=initialFocus(data,'alcibiades');
 assert.ok(focusAssociations(data,{...s,start:-415,end:-415}).some(a=>a.place==='sparta'));
 assert.ok(!focusAssociations(data,{...s,start:-407,end:-407}).some(a=>a.place==='sparta'));
 assert.ok(focusAssociations(data,{...s,start:-407,end:-407}).some(a=>a.place==='athens'));
 assert.deepEqual(focusAssociations(data,{...s,start:-420,end:-420}),[]);
});
test('city study windows now include their newly researched histories',()=>{
 assert.ok(rankedContext(data,initialFocus(data,'athens')).some(e=>e.id==='alcibiades'));
 assert.ok(rankedContext(data,initialFocus(data,'rome')).some(e=>e.id==='julius-caesar'));
 assert.ok(rankedContext(data,initialFocus(data,'persia')).some(e=>e.id==='darius-ii-reign'));
});
