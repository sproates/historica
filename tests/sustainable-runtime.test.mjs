import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseBrowserHistory} from '../web/generated/content/browser-history.js';
import {buildFocusData} from '../web/focus-model.js';
import {geometry} from '../web/generated/presentation/history-page.js';
import {nextFocus} from '../web/generated/state/navigation.js';
import {decodeView,encodeView} from '../web/generated/state/view-url.js';
import {startTheme,resolvedTheme} from '../web/generated/browser/theme.js';
import {startAnalytics} from '../web/generated/browser/analytics.js';
const read=file=>JSON.parse(fs.readFileSync('web/data/'+file));

test('browser data retains all records and the Bactria outline without the prototype collection',()=>{
 const pack=parseBrowserHistory(read('browser-history.json')),full=buildFocusData(read('collection.json'),read('reviewed-exploration.json'));
 for(const key of ['entities','associations','relationships'])assert.deepEqual(pack.data[key],full[key]);
 assert.equal(pack.data.collection,undefined);
 assert.equal(pack.bactriaOutline,geometry(read('collection.json').historicalOverlays[0].geometry));
 assert.throws(()=>parseBrowserHistory({version:2}),/Invalid/);
 assert.throws(()=>parseBrowserHistory({version:1,bactriaOutline:'',data:{}}),/history|entities/);
});
test('focus transitions preserve area dates and comparisons while isolating Back snapshots',()=>{
 const {data}=parseBrowserHistory(read('browser-history.json'));
 const original=decodeView('https://historica.online/person/alexander?year=-340&person=alexander&person=philip&lane=Macedonia&expanded=1',data);
 const copy=structuredClone(original),egypt=nextFocus(data,original,'egypt');
 assert.deepEqual(original,copy);assert.equal(egypt.state.start,-356);assert.equal(egypt.state.end,-323);
 assert.deepEqual(egypt.view.people,original.view.people);assert.deepEqual(egypt.view.lanes,[]);assert.equal(egypt.view.expanded,false);
 const socrates=nextFocus(data,egypt,'socrates');assert.equal(socrates.state.start,-469);assert.equal(socrates.state.end,-399);assert.equal(socrates.view.moment,-399);
 assert.deepEqual(decodeView(encodeView(socrates.state,socrates.view,data),data),socrates);
 egypt.view.people.push('changed');assert.deepEqual(original,copy);
 const world=nextFocus(data,original,'global-overview','all',{start:-3000,end:200});assert.equal(world.state.start,-3000);assert.equal(world.view.envelope.end,200);
});
test('theme follows the system until overridden, persists and tolerates blocked storage',()=>{
 class Control extends EventTarget {value='system';}
 const control=new Control(),system=new EventTarget();system.matches=true;
 const root={documentElement:{dataset:{}},querySelectorAll:()=>[control]};let saved=null;
 startTheme(root,{getItem:()=>saved,setItem:(_,value)=>{saved=value;}},system);
 assert.equal(root.documentElement.dataset.theme,'dark');control.value='light';control.dispatchEvent(new Event('change'));assert.equal(saved,'light');assert.equal(root.documentElement.dataset.theme,'light');
 system.matches=false;system.dispatchEvent(new Event('change'));assert.equal(root.documentElement.dataset.theme,'light');
 control.value='system';control.dispatchEvent(new Event('change'));system.matches=true;system.dispatchEvent(new Event('change'));assert.equal(root.documentElement.dataset.theme,'dark');
 assert.equal(resolvedTheme('dark',false),'dark');
 assert.doesNotThrow(()=>startTheme(root,{getItem:()=>{throw Error();},setItem:()=>{throw Error();}},system));
});
test('analytics is restricted to configured production and initializes only once',()=>{
 const added=[],root={querySelector:selector=>selector.startsWith('meta')?{content:'a'.repeat(32)}:added[0],createElement:()=>({dataset:{}}),head:{append:node=>added.push(node)}};
 for(const host of ['localhost','ians-macbook-pro.local','sproates.github.io'])startAnalytics(root,host);
 assert.equal(added.length,0);startAnalytics(root,'historica.online');startAnalytics(root,'historica.online');assert.equal(added.length,1);
 assert.equal(JSON.parse(added[0].dataset.cfBeacon).spa,false);
});
