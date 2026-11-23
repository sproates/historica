import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canEnhanceStaticHistory} from '../web/generated/state/static-page.js';
import {decodeView} from '../web/generated/state/view-url.js';
import {buildFocusData} from '../web/focus-model.js';
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
const source=fs.readFileSync('web/focus-app.js','utf8');
const dependencies={};
for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';/gm)){
  const module=await import(new URL('../web/'+match[2],import.meta.url));
  for(const name of match[1].split(',').map(s=>s.trim()))dependencies[name]=module[name];
}
const body=source.replace(/^import .*;\n/gm,'');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function startup(id,address){
  const nodes=new Map(),writes=[],callbacks={},errors=[],history=[];
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
  const environment={document,location:{href:'https://historica.online'+address},history:{replaceState(_a,_b,url){history.push(url);},pushState(_a,_b,url){history.push(url);}},window:Object.assign(new EventTarget(),{matchMedia:()=>({matches:false})}),console:{error:e=>errors.push(e)},fetch:async url=>({ok:true,json:async()=>read(url.replace('data/','').replace('.json',''))})};
  const scope={...dependencies,...overrides,...environment};
  await new AsyncFunction(...Object.keys(scope),body)(...Object.values(scope));
  assert.deepEqual(errors,[]);
  return {nodes,writes,callbacks,history,get camera(){return camera;},get points(){return points;}};
}
const content=new Set(['focus-title','focus-description','comparison-bars','swimlanes','lanes','related','focus-map','map-places','evidence','regional-evidence']);

test('default startup preserves generated content and registers working navigation',async()=>{
  const h=await startup('alexander','/person/alexander');
  assert.deepEqual(h.writes.filter(w=>content.has(w.key)),[]);
  assert.equal(h.nodes.get('focus-picker').value,'alexander');
  assert.equal(h.nodes.get('start').value,'-355');
  assert.ok(h.points.length>0);
  assert.equal(h.camera.w,120,'generated camera is not reset to the world');
  h.callbacks.bindNavigationControls.focus('egypt');
  assert.ok(h.writes.some(w=>w.key==='focus-title'&&w.value==='Egypt'));
  assert.equal(h.nodes.get('start').value,'-355','place navigation keeps selected dates');
  h.callbacks.bindNavigationControls.back();
  assert.ok(h.history.at(-1).startsWith('/person/alexander'));
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
