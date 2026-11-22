import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,rankedContext,relatedEntities} from '../web/focus-model.js';
import {comparisonRecords,outsideVisiblePeriod} from '../web/comparison-model.js';
import {regionFor,timelineLayout} from '../web/swimlane-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('opening comparisons are drawn only from the visible filtered context',()=>{
 for(const id of ['alexander','stonehenge','alcibiades','julius-caesar']){
  const s=initialFocus(data,id),f=data.entities.find(e=>e.id===id),ranked=rankedContext(data,s),picked=comparisonRecords(f,ranked,data,s);
  assert.equal(picked.length,2);assert.ok(picked.every(e=>ranked.some(r=>r.id===e.id)));
  const filtered=rankedContext(data,{...s,kind:'person'});assert.ok(comparisonRecords(f,filtered,data,s).every(e=>e.type==='person'));
  assert.deepEqual(comparisonRecords(f,[],data,s),[]);
 }
});
test('place study windows never imply that the place was absent',()=>{
 const s=initialFocus(data,'stonehenge'),place=relatedEntities(data,s).find(e=>e.id==='britain-ireland');
 assert.equal(place.inWindow,false);assert.equal(outsideVisiblePeriod(place),false);
 assert.equal(outsideVisiblePeriod({type:'person',inWindow:false}),true);
});
test('Alexander lanes combine Macedonia and use already recorded geography',()=>{
 const s=initialFocus(data,'alexander'),f=data.entities.find(e=>e.id===s.focus),records=rankedContext(data,s),layout=timelineLayout(f,records,data,s);
 assert.equal(layout.lanes.filter(l=>l.name==='Macedonia').length,1);
 assert.ok(!layout.lanes.some(l=>l.name==='Kingdom of Macedonia'));
 for(const id of ['philip-reign','chaeronea','ptolemy-egypt','ptolemy-rule'])assert.notEqual(regionFor(data.entities.find(e=>e.id===id),data,s),'Location still being researched');
 assert.equal(regionFor({id:'unknown'},data,s),'Location still being researched');
});
