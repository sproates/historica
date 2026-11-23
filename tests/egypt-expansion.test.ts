import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,changeFocus,rankedContext,relatedEntities} from '../scripts/lib/focus-data.ts';
import {validateEvidence} from '../scripts/lib/evidence.ts';
const read=p=>JSON.parse(fs.readFileSync(p));
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('Egypt preserves an incoming window and offers the full study period',()=>{
 const incoming=changeFocus(data,initialFocus(data),'egypt');
 assert.deepEqual([incoming.start,incoming.end],[-356,-323]);
 const full=initialFocus(data,'egypt');assert.deepEqual([full.start,full.end],[-3100,200]);
 const relations=relatedEntities(data,full).map(e=>e.id);
 for(const id of ['memphis','thebes-egypt','hatshepsut-reign','roman-egypt'])assert.ok(relations.includes(id));
 const context=rankedContext(data,{...full,start:-1450,end:-1440,area:'egypt'}).map(e=>e.id);
 assert.ok(context.includes('thutmose-three-reign'));
 for(const id of ['hatshepsut-reign','ramesses-two-reign','roman-egypt'])assert.ok(!context.includes(id));
});
test('new batches retain claim links and reigns cannot become artificial lifespans',()=>{
 for(const name of ['egypt-expansion','ancient-connections']){
  const p=read(`research/evidence/${name}-reviewed.json`),a=read(`research/evidence/${name}-exploration.json`);
  assert.deepEqual(validateEvidence(p,{release:true}),[]);
  for(const e of a.entities){
   assert.ok(e.claimIds.length);
   assert.ok(e.claimIds.every(id=>p.claims.some(c=>c.id===id&&c.subjectId===e.id)));
   if(e.id.endsWith('-reign')){assert.equal(e.type,'period');assert.match(e.note,/not a lifespan/);}
  }
 }
});
test('Khufu connects to succession and dynasty with labels correct in both directions',()=>{
 const related=id=>new Map(relatedEntities(data,initialFocus(data,id)).map(e=>[e.id,e.relation]));
 assert.equal(related('khufu-reign').get('snefru-reign'),'Father and predecessor');
 assert.equal(related('snefru-reign').get('khufu-reign'),'Son and successor');
 assert.equal(related('khufu-reign').get('djedefre-reign'),'Successor');
 assert.equal(related('djedefre-reign').get('khufu-reign'),'Predecessor');
 assert.equal(related('khufu-reign').get('fourth-dynasty-egypt'),'Dynasty');
 assert.ok(related('fourth-dynasty-egypt').has('khufu-reign'));
 assert.equal(changeFocus(data,initialFocus(data,'khufu-reign'),'djedefre-reign').start,-2528);
});
test('Stonehenge overview overlaps Khufu but its later stone settings do not',()=>{
 const ids=rankedContext(data,initialFocus(data,'khufu-reign')).map(e=>e.id);
 assert.ok(ids.includes('stonehenge'));
 assert.ok(!ids.includes('stonehenge-stones'));
 assert.ok(rankedContext(data,{...initialFocus(data,'khufu-reign'),start:-2500,end:-2500}).some(e=>e.id==='stonehenge-stones'));
 assert.deepEqual(validateEvidence(read('research/evidence/stonehenge-reviewed.json'),{release:true}),[]);
});
