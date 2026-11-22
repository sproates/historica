import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildFocusData,initialFocus,relatedEntities,focusAssociations} from '../web/focus-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const d=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const additions=read('research/evidence/connected-browsing-exploration.json');
test('every focus has an onward connection to a different record',()=>{
 for(const e of d.entities)assert.ok(relatedEntities(d,initialFocus(d,e.id)).some(x=>x.id!==e.id),e.id);
});
test('new connections are reciprocal, sourced and do not duplicate existing pairs',()=>{
 for(const r of additions.relationships){
  assert.equal(d.relationships.filter(x=>[x.a,x.b].includes(r.a)&&[x.a,x.b].includes(r.b)).length,1,`${r.a}/${r.b}`);
  assert.ok(r.sourceUrls.length);assert.ok(r.sourceUrls.every(u=>u.startsWith('https://')));
  assert.ok(relatedEntities(d,initialFocus(d,r.a)).some(e=>e.id===r.b));
  assert.ok(relatedEntities(d,initialFocus(d,r.b)).some(e=>e.id===r.a));
 }
});
test('Egyptian city references are evidenced and visible on their maps',()=>{
 const evidence=read('web/data/reviewed-evidence.json');
 for(const id of ['memphis','thebes-egypt']){
  const e=d.entities.find(e=>e.id===id);
  assert.ok(e.point);assert.ok(e.claimIds.some(cid=>{const c=evidence.claims.find(x=>x.id===cid);return c?.value.type==='point'&&JSON.stringify(c.value.coordinates)===JSON.stringify(e.point);}));
  assert.ok(focusAssociations(d,initialFocus(d,id)).some(a=>a.place===id));
 }
});
