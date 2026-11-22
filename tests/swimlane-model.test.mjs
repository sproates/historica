import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineLayout} from '../web/swimlane-model.js';
const data={entities:[],associations:[]};
const f={id:'focus',title:'Focus',type:'person',region:'Egypt',startYear:-100,endYear:100};
test('timeline clips bars and marks continuation without a year zero',()=>{
 const {lanes,ticks}=timelineLayout(f,[{...f,id:'other',region:'Britain'}],data,{start:-50,end:50});
 assert.equal(lanes[0].items[0].width,100);
 assert.ok(lanes[0].items[0].continuesBefore&&lanes[0].items[0].continuesAfter);
 assert.ok(!ticks.includes(0));assert.equal(ticks[0],-50);assert.equal(ticks.at(-1),50);
});
test('overlapping labels get separate tracks and focus region is first',()=>{
 const records=[{...f,id:'a',km:0,region:'Britain'},{...f,id:'b',km:null},{...f,id:'c',startYear:-50,endYear:20}];
 const result=timelineLayout(f,records,data,{start:-100,end:100});
 assert.equal(result.lanes[1].name,'Egypt');assert.equal(result.lanes[1].rows,2);
});
test('single-year windows and area focus remain visible',()=>{
 const {lanes,ticks}=timelineLayout({...f,type:'area'},[{...f,id:'event',type:'event',startYear:1,endYear:1}],data,{start:1,end:1});
 assert.deepEqual(ticks,[1]);assert.equal(lanes[0].items[0].left,50);assert.equal(lanes[1].items[0].point,true);
});
test('crowded lanes show three rows and can reveal every entry',async()=>{
 const {laneView}=await import('../web/swimlane-model.js');
 const lane={name:'Athens',rows:9,items:Array.from({length:9},(_,row)=>({id:String(row),row}))};
 const compact=laneView(lane);assert.equal(compact.rows,3);assert.equal(compact.items.length,3);assert.equal(compact.total,9);assert.equal(compact.expanded,false);
 assert.deepEqual(laneView(lane,true).items,lane.items);
 assert.equal(laneView({...lane,focus:true}).items.length,9);
});
