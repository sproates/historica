import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import {buildFocusData,initialFocus,rankedContext,relatedEntities,focusAssociations} from '../scripts/lib/focus-data.ts';
import {timelineLayout} from '../web/generated/domain/swimlane.js';
import {validateEvidence} from '../scripts/lib/evidence.ts';
const read=p=>JSON.parse(fs.readFileSync(p));
const adapter=read('research/evidence/early-world-exploration.json');
const evidence=read('research/evidence/early-world-reviewed.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('early world records retain evidence, regional context, connections and verified map points',()=>{
 assert.deepEqual(validateEvidence(evidence,{release:true}),[]);
 const authored=YAML.parse(fs.readFileSync('content/packs/early-world.yaml','utf8'));
 assert.deepEqual(adapter.entities.map(e=>e.id),authored.entities);
 for(const e of adapter.entities){
  assert.ok(e.region);assert.ok(e.description.includes('\n\n'));
  assert.ok(e.claimIds.every(id=>evidence.claims.some(c=>c.id===id&&c.subjectId===e.id)));
  assert.ok(relatedEntities(data,initialFocus(data,e.id)).some(r=>r.id!==e.id));
  if(e.point)assert.ok(e.claimIds.some(id=>evidence.claims.some(c=>c.id===id&&c.value.type==='point'&&JSON.stringify(c.value.coordinates)===JSON.stringify(e.point))));
 }
});
test('Khufu gains contemporary communities without later Kerma or earlier tomb construction',()=>{
 const state=initialFocus(data,'khufu-reign'),entries=rankedContext(data,state),ids=entries.map(e=>e.id);
 for(const id of ['avebury-building','skara-brae','liangzhu-city','pre-kerma','malta-temple-building'])assert.ok(ids.includes(id),id);
 for(const id of ['kerma-kingdom','boyne-passage-tombs','kuk-ditched-cultivation','watson-brake'])assert.ok(!ids.includes(id),id);
 const layout=timelineLayout(data.entities.find(e=>e.id==='khufu-reign'),entries,data,state);
 for(const region of ['China','Nubia','Malta'])assert.ok(layout.lanes.some(l=>l.name===region));
});
test('predynastic comparison includes early farming and Ubaid, with regional filters still valid',()=>{
 const s={...initialFocus(data,'predynastic-egypt'),start:-5000,end:-4500};
 const ids=rankedContext(data,s).map(e=>e.id);
 for(const id of ['ubaid-communities','yangshao-communities','kuk-mound-cultivation'])assert.ok(ids.includes(id));
 assert.ok(rankedContext(data,{...s,area:'china'}).some(e=>e.id==='yangshao-communities'));
 const b={...initialFocus(data,'britain-ireland'),start:-2551,end:-2528};
 for(const id of ['skara-brae','avebury-building'])assert.ok(focusAssociations(data,b).some(a=>a.subject===id));
});
