import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateEvidence} from '../scripts/lib/evidence.js';
import {buildFocusData,initialFocus,relatedEntities,focusAssociations,rankedContext,changeFocus} from '../web/focus-model.js';
import {searchEntities} from '../web/search-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const pack=read('research/evidence/qin-han-era-reviewed.json'),adapter=read('research/evidence/qin-han-era-exploration.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const links=id=>relatedEntities(data,initialFocus(data,id)).map(e=>e.id);
test('Qin and Han additions have valid evidence, connections and searchable unique identities',()=>{
 assert.deepEqual(validateEvidence(pack,{release:true}),[]);assert.equal(adapter.entities.length,9);
 assert.equal(data.entities.length,new Set(data.entities.map(e=>e.id)).size);
 for(const e of adapter.entities){assert.ok(e.claimIds.length>=2);assert.ok(links(e.id).length,e.id);assert.deepEqual(e.regionIds,['china']);}
 assert.ok(searchEntities(data.entities,'Qin Shi Huang').some(e=>e.id==='qin-shi-huang'));
 assert.ok(links('qin-empire').includes('western-han'));assert.ok(links('qin-empire').includes('maurya'));
 assert.ok(links('shiji-history').includes('han-wu-reign'));
});
test('burial location is dated, context overlaps correctly and area changes preserve the window',()=>{
 const state=initialFocus(data,'qin-shi-huang');
 assert.ok(rankedContext(data,state).some(e=>e.id==='qin-unification'));
 assert.ok(!rankedContext(data,state).some(e=>e.id==='ban-chao'));
 const burial=year=>focusAssociations(data,{...state,start:year,end:year}).filter(a=>a.subject==='qin-shi-huang');
 assert.equal(burial(-211).length,0);assert.equal(burial(-210).length,1);
 const next=changeFocus(data,state,'qin-mausoleum');assert.deepEqual([next.start,next.end],[state.start,state.end]);
 assert.equal(data.entities.find(e=>e.id==='shiji-history').type,'period');
});
