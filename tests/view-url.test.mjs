import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData} from '../web/focus-model.js';
import {encodeView,decodeView} from '../web/view-url.js';
const data=buildFocusData(JSON.parse(fs.readFileSync(new URL('../web/data/collection.json',import.meta.url))));
test('empty and unknown focus links open Socrates while older explicit links survive',()=>{
 for(const hash of ['', '#focus=missing'])assert.equal(decodeView(hash,data).state.focus,'socrates');
 assert.deepEqual([decodeView('',data).state.start,decodeView('',data).state.end],[-469,-399]);
 const old=decodeView('#focus=alexander&from=-331&to=-329&kind=event&area=egypt',data);
 assert.deepEqual(old.state,{focus:'alexander',start:-331,end:-329,kind:'event',area:'egypt'});
 assert.equal(old.view.map.w,720);
});
test('bookmark round trip includes map, borders, expanded list, evidence and slider bounds',()=>{
 const state={focus:'socrates',start:-450,end:-410,kind:'person',area:'athens'};
 const view={map:{x:350.25,y:80.125,w:100,borders:.35},expanded:true,evidence:true,envelope:{start:-500,end:-350}};
 assert.deepEqual(decodeView(encodeView(state,view),data),{state,view});
});
test('malformed bookmarks fall back to safe dates and bounded camera',()=>{
 const result=decodeView('#focus=socrates&from=0&to=Infinity&w=-3&x=Infinity&y=999&borders=9&rangeFrom=NaN&rangeTo=0',data);
 assert.deepEqual([result.state.start,result.state.end],[-469,-399]);
 assert.deepEqual(result.view.map,{w:30,x:0,y:345,borders:1});
 assert.deepEqual(result.view.envelope,{start:-469,end:-399});
});
