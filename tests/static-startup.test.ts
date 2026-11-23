import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canEnhanceStaticHistory} from '../web/generated/state/static-page.js';
import {decodeView} from '../web/generated/state/view-url.js';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
const read=name=>JSON.parse(fs.readFileSync(`web/data/${name}.json`,'utf8'));
const data=buildFocusData(read('collection'),read('reviewed-exploration'));

test('static reuse accepts only matching content, while allowing camera and disclosure bookmarks',()=>{
  for(const entity of data.entities){
    const address=`/${entity.type}/${entity.id}`;
    assert.ok(canEnhanceStaticHistory(entity.id,data,decodeView(address,data)),entity.id);
    assert.ok(canEnhanceStaticHistory(entity.id,data,decodeView(address+'?x=200&w=100&borders=0&panel=browse-panel&evidence=1&rangeFrom=-10000',data)),entity.id);
  }
  for(const query of ['from=-340&to=-330','kind=person','area=egypt','year=-330','person=philip&person=ptolemy','comparison=full','expanded=1','lane=Macedonia']){
    assert.equal(canEnhanceStaticHistory('alexander',data,decodeView('/person/alexander?'+query,data)),false,query);
  }
  assert.equal(canEnhanceStaticHistory(undefined,data,decodeView('/person/alexander',data)),false);
  assert.equal(canEnhanceStaticHistory('socrates',data,decodeView('/person/alexander',data)),false);
});

// Execute the real entry point with deterministic network and DOM boundaries.
// Content setters record replacements; controller callbacks remain available for navigation checks.
const source=fs.readFileSync('web/generated/browser/explorer.js','utf8');
const dependencies={};
for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';/gm)){
  const module=await import(new URL('../web/generated/browser/'+match[2],import.meta.url));
  for(const specifier of match[1].split(',').map(s=>s.trim())){const [name,alias=name]=specifier.split(/\s+as\s+/);dependencies[alias]=module[name];}
}
const body=source.replace(/^import .*;\n/gm,'').replace('export async function startExplorer','async function startExplorer')+'\nawait startExplorer(base);';
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function startup(id,address,base='/'){
  const nodes=new Map(),writes=[],callbacks={},errors=[],history=[],requests=[],listeners={},failedUrls=new Set();
  const node=key=>{
    if(!nodes.has(key)){
      const el=new EventTarget();
      Object.assign(el,{value:'',open:false,hidden:false,disabled:false,dataset:{descriptionFocus:id},attributes:{},setAttribute(name,value){this.attributes[name]=value;}});
      for(const property of ['innerHTML','textContent'])Object.defineProperty(el,property,{set(value){writes.push({key,property,value});},get(){return '';}});
      nodes.set(key,el);
    }
    return nodes.get(key);
  };
  const document={body:{dataset:{staticHistory:id}},getElementById:node,querySelector:node,title:''};
  let camera={x:300,y:50,w:120,borders:1},points=[];
  const overrides={setupMap:()=>({getState:()=>camera,restore(saved){camera=saved;},update(next){points=next;},fitOnNextUpdate(){}})};
  for(const name of Object.keys(dependencies).filter(n=>n.startsWith('bind')))overrides[name]=(_root,app)=>{callbacks[name]=app;};
  const environment={document,location:{href:'https://historica.online'+address},history:{replaceState(_a,_b,url){history.push(url);},pushState(_a,_b,url){history.push(url);}},window:{addEventListener(name,handler){listeners[name]=handler;},matchMedia:()=>({matches:false})},console:{error:e=>errors.push(e)},fetch:async url=>{requests.push(url);return {ok:!failedUrls.has(url),json:async()=>read(url.replace('data/','').replace('.json',''))};}};
  const scope={...dependencies,...overrides,...environment,base};
  await new AsyncFunction(...Object.keys(scope),body)(...Object.values(scope));
  assert.deepEqual(errors,[]);
  return {nodes,writes,callbacks,history,requests,failedUrls,async restoreAddress(address,event='popstate'){environment.location.href='https://historica.online'+address;await listeners[event]();},get camera(){return camera;},get points(){return points;}};
}
const content=new Set(['focus-title','focus-description','comparison-bars','swimlanes','lanes','related','focus-map','map-places','evidence','regional-evidence']);

test('default startup preserves generated content and registers working navigation',async()=>{
  const h=await startup('alexander','/person/alexander');
  assert.deepEqual(h.writes.filter(w=>content.has(w.key)),[]);
  assert.equal(h.nodes.get('focus-picker').value,'alexander');
  assert.equal(h.nodes.get('start').value,'-355');
  assert.ok(h.points.length>0);
  assert.equal(h.camera.w,120,'generated camera is not reset to the world');
  await h.callbacks.bindNavigationControls.focus('egypt');
  assert.ok(h.writes.some(w=>w.key==='focus-title'&&w.value==='Egypt'));
  assert.equal(h.nodes.get('start').value,'-355','place navigation keeps selected dates');
  await h.callbacks.bindNavigationControls.back();
  assert.ok(h.history.at(-1).startsWith('/person/alexander'));
  assert.deepEqual(h.requests.filter(p=>p.startsWith('data/evidence/')),['data/evidence/alexander.json','data/evidence/egypt.json']);
  assert.ok(!h.requests.includes('data/browser-evidence.json'));
  await h.callbacks.bindNavigationControls.wholePeriod();
  assert.ok(h.history.at(-1).startsWith('/area/global-overview'));
  assert.equal(h.nodes.get('start').value,'-2999');
  assert.equal(h.nodes.get('end').value,'200');
});

test('camera and panel bookmarks enhance content without replacing it',async()=>{
  const h=await startup('socrates','/person/socrates?x=100&w=200&borders=0&panel=timeline-options&evidence=1');
  assert.deepEqual(h.writes.filter(w=>content.has(w.key)),[]);
  assert.equal(h.camera.x,100);assert.equal(h.camera.w,200);assert.equal(h.camera.borders,0);
  assert.equal(h.nodes.get('.timeline-options').open,true);
  assert.equal(h.nodes.get('.geography details').open,true);
});

test('custom and legacy pages still render their restored view',async()=>{
  for(const [id,address] of [['alexander','/person/alexander?from=-340&to=-330'],[undefined,'/person/alexander'],['socrates','/person/socrates?year=-420']]){
    const h=await startup(id,address);
    assert.ok(h.writes.some(w=>w.key==='swimlanes'),address);
    assert.ok(h.writes.some(w=>w.key==='focus-map'),address);
    if(address.includes('from='))assert.equal(h.nodes.get('start').value,'-339');
  }
});


test('browser history restores bookmarks under the GitHub Pages mount point',async()=>{
 const h=await startup('alexander','/historica/person/alexander','/historica/');
 await h.callbacks.bindNavigationControls.focus('egypt');
 assert.ok(h.history.at(-1).startsWith('/historica/area/egypt'));
 await h.restoreAddress('/historica/person/socrates?from=-431&to=-404&year=-420&panel=timeline-options');
 assert.equal(h.nodes.get('focus-picker').value,'socrates');
 assert.equal(h.nodes.get('start').value,'-430');
 assert.equal(h.nodes.get('end').value,'-403');
 assert.equal(h.nodes.get('year-cursor').value,'-419');
 assert.equal(h.nodes.get('.timeline-options').open,true);
 await h.restoreAddress('/historica/person/alexander');
 assert.equal(h.nodes.get('focus-picker').value,'alexander');
 assert.equal(h.nodes.get('back').disabled,true);
 assert.ok(h.history.at(-1).startsWith('/historica/person/alexander'));
});

test('failed navigation preserves the current focus and can be retried',async()=>{
 const h=await startup('socrates','/person/socrates');
 h.failedUrls.add('data/evidence/stonehenge.json');
 assert.equal(await h.callbacks.bindNavigationControls.focus('stonehenge'),false);
 assert.equal(h.nodes.get('focus-picker').value,'socrates');
 assert.equal(h.nodes.get('error').hidden,false);
 h.failedUrls.clear();
 assert.equal(await h.callbacks.bindNavigationControls.focus('stonehenge'),true);
 assert.equal(h.nodes.get('focus-picker').value,'stonehenge');
 assert.equal(h.nodes.get('error').hidden,true);
});
