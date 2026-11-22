import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,changeFocus,rankedContext,focusAssociations} from '../web/focus-model.js';
import {validateEvidence} from '../scripts/lib/evidence.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/global-overview-reviewed.json');
const adapter=read('research/evidence/global-overview-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('global overview preserves source-linked chronology and broad regional diversity',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 assert.ok(new Set(adapter.entities.map(e=>e.region).filter(Boolean)).size>=7);
 for(const e of adapter.entities.filter(e=>e.type==='period')){
  assert.ok(e.claimIds.length);assert.ok(e.note);assert.equal(e.contextual,true);
  assert.ok(e.startYear<e.endYear);
  assert.ok(e.claimIds.every(id=>pack.claims.some(c=>c.id===id&&c.subjectId===e.id)));
 }
 const whole=rankedContext(data,{...initialFocus(data,'global-overview'),start:-3000,end:200});
 for(const id of ['caral-context','indus-urban','western-han','kush-overview','olmec-gulf'])assert.ok(whole.some(e=>e.id===id));
 assert.ok(!rankedContext(data,{...initialFocus(data),start:10,end:24}).some(e=>['western-han','eastern-han'].includes(e.id)));
});
test('early regions preserve selected time and reviewed map references keep their dates',()=>{
 const early=initialFocus(data,'old-kingdom');
 const egypt=changeFocus(data,early,'egypt');
 assert.deepEqual([egypt.start,egypt.end],[-2649,-2130]);
 assert.ok(rankedContext(data,{...egypt,area:'egypt'}).some(e=>e.id==='khufu-reign'));
 assert.ok(focusAssociations(data,initialFocus(data,'caral-context')).some(a=>a.place==='caral-context'));
 assert.ok(!focusAssociations(data,initialFocus(data)).some(a=>a.place==='caral-context'));
});
