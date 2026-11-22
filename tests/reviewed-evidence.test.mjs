import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateEvidence} from '../scripts/lib/evidence.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
test('reviewed source package passes acceptance and matches the manually built web asset',()=>{
 const p=read('../research/evidence/socrates-reviewed.json');assert.deepEqual(validateEvidence(p,{release:true}),[]);
 const combined=read('../web/data/reviewed-evidence.json');assert.deepEqual(validateEvidence(combined,{release:true}),[]);
 for(const c of p.claims)assert.deepEqual(combined.claims.find(x=>x.id===c.id),c);
 assert.equal(p.claims.length,4);assert.ok(p.reviews.every(r=>r.reviewer.includes('AI-assisted')));
});
test('prototype audit inventories all entities without treating source URLs as verified claims',()=>{
 const p=read('../research/evidence/audit/inventory.json');assert.equal(p.entityCount,68);assert.equal(p.itemCount,p.items.length);
 assert.equal(new Set(p.items.map(i=>i.id)).size,p.items.length);assert.ok(p.items.every(i=>i.status==='unchecked'));
 for(const field of ['association','relationship','geometry'])assert.ok(p.items.some(i=>i.field===field));
});
