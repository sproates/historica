import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData} from '../web/focus-model.js';
import {encodeView,decodeView} from '../web/view-url.js';
const data=buildFocusData(JSON.parse(fs.readFileSync(new URL('../web/data/collection.json',import.meta.url))));
test('empty and unknown focus links open Alexander while older explicit links survive',()=>{
 for(const hash of ['', '/', '#focus=missing'])assert.equal(decodeView(hash,data).state.focus,'alexander');
 assert.equal(decodeView('/person/socrates',data).state.focus,'socrates');
 assert.deepEqual([decodeView('',data).state.start,decodeView('',data).state.end],[-356,-323]);
 const old=decodeView('#focus=alexander&from=-331&to=-329&kind=event&area=egypt',data);
 assert.deepEqual(old.state,{focus:'alexander',start:-331,end:-329,kind:'event',area:'egypt'});
 assert.equal(old.view.map.w,720);
});
test('bookmark round trip includes map, borders, expanded list, evidence and slider bounds',()=>{
 const state={focus:'socrates',start:-450,end:-410,kind:'person',area:'athens'};
 const view={lanes:['Athens','Persia'],panels:['timeline-options','connections-panel'],comparison:'full',map:{x:350.25,y:80.125,w:100,borders:.35},expanded:true,evidence:true,envelope:{start:-500,end:-350}};
 assert.deepEqual(decodeView(encodeView(state,view,data),data),{state,view});
});
test('malformed bookmarks fall back to safe dates and bounded camera',()=>{
 const result=decodeView('#focus=socrates&from=0&to=Infinity&w=-3&x=Infinity&y=999&borders=9&rangeFrom=NaN&rangeTo=0',data);
 assert.deepEqual([result.state.start,result.state.end],[-469,-399]);
 assert.deepEqual(result.view.map,{w:30,x:0,y:345,borders:1});
 assert.deepEqual(result.view.envelope,{start:-469,end:-399});
});

test('canonical paths omit every default and preserve changed dates',()=>{
 const original=decodeView('/person/alexander',data);
 assert.equal(original.state.focus,'alexander');
 assert.equal(encodeView(original.state,original.view,data),'/person/alexander');
 const changed=decodeView('/person/alexander?from=-340&to=-330',data);
 assert.deepEqual([changed.state.start,changed.state.end],[-340,-330]);
 assert.equal(encodeView(changed.state,changed.view,data),'/person/alexander?from=-340&to=-330');
 for(const e of data.entities){const path=`/${e.type}/${e.id}`;const decoded=decodeView(path,data);assert.equal(decoded.state.focus,e.id);assert.equal(encodeView(decoded.state,decoded.view,data),path);}
});

test('reported Khufu fragment becomes a clean path without losing its time window',()=>{
 const complete=buildFocusData(JSON.parse(fs.readFileSync('web/data/collection.json')),JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json')));
 const old=decodeView('http://historica.online/#focus=khufu-reign&from=-2551&to=-2528&kind=all&area=all&v=1&x=0&y=0&w=720&borders=1&expanded=0&evidence=0&rangeFrom=-2551&rangeTo=-2528',complete);
 assert.equal(encodeView(old.state,old.view,complete),'/period/khufu-reign');
});

test('comparison scale is bookmarked without changing the selected years',()=>{
 const original=decodeView('/person/alexander?comparison=full',data);
 assert.equal(original.view.comparison,'full');assert.equal(original.state.start,-356);assert.equal(original.state.end,-323);
 assert.equal(encodeView(original.state,original.view,data),'/person/alexander?comparison=full');
 assert.equal(decodeView('/person/alexander?comparison=invalid',data).view.comparison,'shared');
});

 test('expanded regions and controls use bounded, deduplicated bookmark values',()=>{
 const restored=decodeView('/person/socrates?lane=Athens&lane=Athens&lane=&lane='+ 'x'.repeat(101)+'&panel=unknown&panel=connections-panel&panel=connections-panel',data);
 assert.deepEqual(restored.view.lanes,['Athens']);
 assert.deepEqual(restored.view.panels,['connections-panel']);
 assert.equal(encodeView(restored.state,restored.view,data),'/person/socrates?lane=Athens&panel=connections-panel');
 const defaults=decodeView('/person/socrates',data);
 assert.deepEqual(defaults.view.lanes,[]);assert.deepEqual(defaults.view.panels,[]);
 });
