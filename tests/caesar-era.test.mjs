import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,changeFocus,rankedContext,relatedEntities,focusAssociations} from '../web/focus-model.js';
import {validateEvidence} from '../scripts/lib/evidence.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/caesar-era-reviewed.json');
const adapter=read('research/evidence/caesar-era-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const links=id=>relatedEntities(data,initialFocus(data,id)).map(e=>e.id);
test('Caesar era has evidence and navigable connections for every entry',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);
 assert.equal(adapter.entities.length,18);
 for(const e of adapter.entities){
  assert.ok(e.description.includes('\n\n'),e.id);
  assert.ok(e.claimIds.every(id=>pack.claims.some(c=>c.id===id&&c.subjectId===e.id)),e.id);
  assert.ok(links(e.id).some(id=>id!==e.id),e.id);
 }
});
test('Caesar connects through Cleopatra to Ptolemaic and Roman Egypt',()=>{
 assert.ok(links('julius-caesar').includes('cleopatra-vii'));
 for(const id of ['macedonian-ptolemaic-egypt','cleopatra-vii-reign','egypt-roman-annexation'])assert.ok(links('cleopatra-vii').includes(id));
 assert.ok(links('egypt-roman-annexation').includes('roman-egypt'));
 const s=initialFocus(data,'julius-caesar');
 const egypt=changeFocus(data,s,'egypt');assert.deepEqual([egypt.start,egypt.end],[-100,-44]);
 const cleopatra=changeFocus(data,s,'cleopatra-vii');assert.deepEqual([cleopatra.start,cleopatra.end],[-69,-30]);
 assert.deepEqual([initialFocus(data,'cleopatra-vii-reign').start,initialFocus(data,'cleopatra-vii-reign').end],[-51,-30]);
 assert.equal(initialFocus(data,'augustus').start,-63);assert.equal(initialFocus(data,'augustus-reign').start,-27);
});
test('Caesar timeline has global contemporaries but excludes later Actium and annexation',()=>{
 const ids=rankedContext(data,initialFocus(data,'julius-caesar')).map(e=>e.id);
 for(const id of ['cleopatra-vii','pompey','cicero','mark-antony','augustus','western-han','parthian-context','sanchi-gateways','ireland-iron-age','jenne-jeno-early'])assert.ok(ids.includes(id),id);
 for(const id of ['actium','egypt-roman-annexation','augustus-reign'])assert.ok(!ids.includes(id),id);
});
test('Caesar’s Egyptian association disappears outside 48–47 BCE',()=>{
 const s=initialFocus(data,'julius-caesar');
 assert.ok(focusAssociations(data,{...s,start:-48,end:-47}).some(a=>a.place==='egypt'));
 assert.ok(!focusAssociations(data,{...s,start:-59,end:-59}).some(a=>a.place==='egypt'));
 assert.ok(focusAssociations(data,{...s,start:-59,end:-59}).some(a=>a.place==='rome'));
});
