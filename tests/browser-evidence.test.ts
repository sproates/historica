import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {browserEvidence} from '../web/generated/content/browser-evidence.js';
import {createHistoryPage} from '../web/generated/presentation/history-page.js';
import {ageAt} from '../web/generated/domain/exploration.js';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
const read=name=>JSON.parse(fs.readFileSync(`web/data/${name}.json`,'utf8'));
const full=read('reviewed-evidence'),compact=read('browser-evidence');
const data=buildFocusData(read('collection'),read('reviewed-exploration'));

test('browser evidence is deterministic, smaller and retains all claim and citation identities',()=>{
 assert.deepEqual(compact,browserEvidence(full));
 assert.ok(fs.statSync('web/data/browser-evidence.json').size<fs.statSync('web/data/reviewed-evidence.json').size*.45);
 assert.deepEqual(Object.keys(compact).sort(),['claims','evidence','sources']);
 for(const key of ['claims','evidence','sources'])assert.deepEqual(compact[key].map(e=>e.id),full[key].map(e=>e.id));
 for(const claim of compact.claims)for(const id of claim.evidenceIds){
  const evidence=compact.evidence.find(e=>e.id===id);
  assert.ok(evidence);assert.ok(compact.sources.some(s=>s.id===evidence.sourceId));
 }
});

test('every history retains identical checked statements, source links and caveats',()=>{
 for(const entity of data.entities){
  const expected=createHistoryPage(data,entity.id,full,{features:[]}).checked;
  const actual=createHistoryPage(data,entity.id,compact,{features:[]}).checked;
  assert.deepEqual(actual,expected,entity.id);
 }
});

test('age estimates and uncertainty remain identical across every recorded life',()=>{
 for(const entity of data.entities.filter(e=>e.type==='person')){
  for(let year=entity.startYear-1;year<=entity.endYear+1;year++){
   if(year===0)continue;
   assert.equal(ageAt(entity,year,compact),ageAt(entity,year,full),`${entity.id}: ${year}`);
  }
 }
});

test('projection does not mutate the complete research record or lose absent optional fields',()=>{
 const record={claims:[{id:'c',status:'pending',statement:'Uncertain',evidenceIds:[]}],sources:[],evidence:[]};
 const before=structuredClone(record),result=browserEvidence(record);
 assert.deepEqual(record,before);assert.deepEqual(result,record);
 result.claims[0].evidenceIds.push('new');assert.deepEqual(record,before);
});
