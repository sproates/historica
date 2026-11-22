import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateEvidence} from '../scripts/lib/evidence.js';
import {buildFocusData,initialFocus,relatedEntities,rankedContext,focusAssociations} from '../web/focus-model.js';
import {searchEntities} from '../web/search-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/connected-lives-reviewed.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('new biographies are sourced, searchable and connected to contemporary lives',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 for(const id of ['octavia-minor','livia','ban-zhao']){
  const e=data.entities.find(x=>x.id===id);assert.equal(e.type,'person');
  assert.ok(searchEntities(data.entities,e.title).some(x=>x.id===id));
  assert.ok(relatedEntities(data,initialFocus(data,id)).some(x=>x.id!==id));
 }
 const caesar=rankedContext(data,initialFocus(data,'julius-caesar'));
 assert.ok(caesar.some(x=>x.id==='livia'));assert.ok(caesar.some(x=>x.id==='octavia-minor'));assert.ok(!caesar.some(x=>x.id==='ban-zhao'));
 assert.ok(rankedContext(data,initialFocus(data,'ban-chao')).some(x=>x.id==='ban-zhao'));
});
test('dated travel does not become a lifetime location',()=>{
 const state=initialFocus(data,'octavia-minor');
 for(const year of [-36,-35,-34]){
  const matches=focusAssociations(data,{...state,start:year,end:year}).filter(x=>x.subject==='octavia-minor');
  assert.equal(matches.length,year===-35?1:0);
 }
 assert.equal(data.entities.find(x=>x.id==='octavia-minor').point,null);
});
test('conflicting lifespan dates remain explicit evidence rather than exact ages',()=>{
 const claim=pack.claims.find(x=>x.id==='connected-lives-ban-zhao-chronology');
 assert.equal(claim.certainty,'disputed');assert.deepEqual([claim.validity.start.earliest,claim.validity.start.latest],[45,48]);
 assert.deepEqual([claim.validity.end.earliest,claim.validity.end.latest],[116,117]);
 assert.match(data.entities.find(x=>x.id==='ban-zhao').note,/uncertain/);
});
