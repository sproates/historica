import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,rankedContext,focusAssociations} from '../web/focus-model.js';
import {searchEntities} from '../web/generated/domain/search.js';
import {validateEvidence} from '../scripts/lib/evidence.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/world-lifeways-reviewed.json');
const exploration=read('research/evidence/world-lifeways-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('world lifeways entries have reviewed evidence and source-backed map references',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 for(const e of exploration.entities){
  assert.ok(e.claimIds.length && e.note);
  for(const id of e.claimIds)assert.equal(pack.claims.find(c=>c.id===id)?.subjectId,e.id);
  if(e.point)assert.ok(e.claimIds.some(id=>{const c=pack.claims.find(c=>c.id===id);return c.value.type==='point'&&JSON.stringify(c.value.coordinates)===JSON.stringify(e.point);}));
 }
 assert.equal(pack.accounts.length,0); // Introductory records do not certify full regional coverage.
});
test('new histories appear only within their published periods and remain searchable',()=>{
 const s={...initialFocus(data,'socrates'),start:-399,end:-399};
 const ids=rankedContext(data,s).map(e=>e.id);
 for(const id of ['korean-dolmens','arnhem-rock-art','chavin-context'])assert.ok(ids.includes(id));
 for(const id of ['northern-jomon','lapita-settlement','poverty-point','teotihuacan-context'])assert.ok(!ids.includes(id));
 const p={...initialFocus(data,'global-overview'),start:-1600,end:-1500};
 assert.ok(focusAssociations(data,p).some(a=>a.place==='poverty-point'));
 assert.ok(!focusAssociations(data,s).some(a=>a.place==='poverty-point'));
 assert.equal(searchEntities(data.entities,'sammallahdenmaki')[0].id,'sammallahdenmaki');
 assert.equal(searchEntities(data.entities,'jomon')[0].id,'northern-jomon');
 assert.equal(initialFocus(data).focus,'alexander');
});
