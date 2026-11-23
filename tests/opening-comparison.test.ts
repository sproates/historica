import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,rankedContext,relatedEntities} from '../scripts/lib/focus-data.ts';
import {comparisonRecords,comparisonLayout,outsideVisiblePeriod} from '../web/generated/domain/comparison.js';
import {regionFor,timelineLayout} from '../web/generated/domain/swimlane.js';
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
test('introductory journeys answer Socrates and Caesar questions directly',()=>{
 for(const [id,expected,kind] of [['socrates',['peloponnesian-war','alcibiades'],'all'],['julius-caesar',['cleopatra-vii','augustus'],'person']]){
  const state={...initialFocus(data,id),kind},f=data.entities.find(e=>e.id===id);
  assert.deepEqual(comparisonRecords(f,rankedContext(data,state),data,state).map(e=>e.id),expected);
 }
 const html=fs.readFileSync('web/focus.html','utf8');
 assert.match(html,/data-focus="socrates">How did Socrates/);
 assert.match(html,/data-focus="julius-caesar" data-kind="person">Who/);
});

test('full comparison reveals different durations and retains the selected window',()=>{
 const state=initialFocus(data,'alexander'),f=data.entities.find(e=>e.id===state.focus),picks=comparisonRecords(f,rankedContext(data,state),data,state);
 const records=[f,...picks],shared=comparisonLayout(records,state),full=comparisonLayout(records,state,'full');
 assert.ok(shared.items.every(e=>e.width===100));
 assert.ok(full.items[0].width<full.items[1].width);assert.ok(full.items[1].width<full.items[2].width);
 assert.equal(full.items[0].left,full.selectedLeft);assert.equal(full.items[0].width,full.selectedWidth);
 assert.deepEqual([state.start,state.end],[-356,-323]);assert.ok(full.items.every(e=>!e.before&&!e.after));
});
test('comparison geometry handles single years and the BCE/CE boundary',()=>{
 const full=comparisonLayout([{startYear:-1,endYear:1}],{start:-1,end:1},'full');assert.equal(full.items[0].width,100);
 const point=comparisonLayout([{startYear:1,endYear:1}],{start:1,end:1},'full');assert.equal(point.items[0].left,50);assert.equal(point.items[0].width,0);
});
