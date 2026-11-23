import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateEvidence} from '../scripts/lib/evidence.js';
import {buildFocusData,initialFocus,rankedContext,relatedEntities,focusAssociations,changeFocus} from '../web/focus-model.js';
import {searchEntities} from '../web/generated/domain/search.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/maurya-era-reviewed.json'),adapter=read('research/evidence/maurya-era-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const links=id=>relatedEntities(data,initialFocus(data,id)).map(e=>e.id);
test('Mauryan batch contains sourced connected histories, with reigns distinct from lives',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);assert.equal(adapter.entities.length,12);
 for(const e of adapter.entities){assert.ok(e.claimIds.length>=2);assert.ok(links(e.id).length,e.id);assert.ok(e.description.includes('\n\n'));}
 for(const id of ['chandragupta-reign','bindusara-reign','ashoka-rule'])assert.equal(data.entities.find(e=>e.id===id).type,'period');
 assert.ok(searchEntities(data.entities,'Ashoka').some(e=>e.id==='ashoka-rule'));
 assert.equal(data.entities.length,new Set(data.entities.map(e=>e.id)).size);
 assert.ok(links('seleucus').includes('alexander'));assert.ok(links('seleucus').includes('ptolemy'));
 assert.ok(links('maurya').includes('sanchi-early'));assert.ok(links('chandragupta-reign').includes('bindusara-reign'));
});
test('new context respects time windows and records only sourced visits',()=>{
 const alex=initialFocus(data,'alexander'),ashoka=initialFocus(data,'ashoka-rule');
 assert.ok(rankedContext(data,alex).some(e=>e.id==='alexander-taxila'));
 assert.ok(!rankedContext(data,alex).some(e=>e.id==='ashoka-lumbini'));
 assert.ok(focusAssociations(data,{...alex,start:-326,end:-326}).some(a=>a.place==='taxila'));
 assert.ok(!focusAssociations(data,{...alex,start:-325,end:-325}).some(a=>a.place==='taxila'));
 assert.ok(focusAssociations(data,{...ashoka,start:-249,end:-249}).some(a=>a.subject==='ashoka-rule'&&a.place==='lumbini'));
 assert.ok(!focusAssociations(data,{...ashoka,start:-250,end:-250}).some(a=>a.subject==='ashoka-rule'&&a.place==='lumbini'));
 const next=changeFocus(data,ashoka,'lumbini');assert.deepEqual([next.start,next.end],[ashoka.start,ashoka.end]);
});
