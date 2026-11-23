import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateEvidence} from '../scripts/lib/evidence.js';
import {buildFocusData,initialFocus,relatedEntities,rankedContext,focusAssociations} from '../web/focus-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));const pack=read('research/evidence/everyday-evidence-reviewed.json');
const d=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('everyday-life additions have evidence and onward links',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 for(const e of read('research/evidence/everyday-evidence-exploration.json').entities)assert.ok(relatedEntities(d,initialFocus(d,e.id)).some(x=>x.id!==e.id),e.id);
 assert.ok(relatedEntities(d,initialFocus(d,'ramesses-two-reign')).some(x=>x.id==='deir-attendance'));
 assert.ok(relatedEntities(d,initialFocus(d,'livia')).some(x=>x.id==='pompeii'));
});
test('Pompeii snapshots remain in 79 CE, not invented workshop lifespans',()=>{
 for(const id of ['pompeii-fullery','pompeii-food-shop','vesuvius-eruption']){
  const e=d.entities.find(x=>x.id===id);assert.deepEqual([e.startYear,e.endYear],[79,79]);
  assert.ok(focusAssociations(d,initialFocus(d,id)).some(x=>x.place==='pompeii'));
  assert.ok(!rankedContext(d,{...initialFocus(d,'ban-zhao'),start:80,end:80}).some(x=>x.id===id));
 }
 assert.ok(rankedContext(d,initialFocus(d,'ban-zhao')).some(x=>x.id==='vesuvius-eruption'));
});
test('attendance register chronology conflict remains disclosed',()=>{
 const c=pack.claims.find(x=>x.id==='everyday-evidence-deir-attendance-chronology');assert.equal(c.certainty,'disputed');
 const e=d.entities.find(x=>x.id==='deir-attendance');assert.match(e.note,/280 days/);assert.match(e.note,/discrepancy/);assert.equal(e.point,null);
});
