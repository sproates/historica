import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as model from '../web/generated/domain/coverage.js';
import {escapeHtml} from '../web/generated/presentation/html.js';
const source=fs.readFileSync('web/generated/browser/coverage.js','utf8').replace(/^import .*;\n/gm,'').replace('export async function startCoverage','async function startCoverage')+'\nawait startCoverage();';
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
class Node extends EventTarget {
 value='all';checked=false;hidden=true;open=false;innerHTML='';textContent='';options=[{value:'all'}];dataset={};
 add(option){this.options.push(option);}
 closest(){return this.dataset.package?this:null;}
 setAttribute(){}
}
async function startup(search='',fail=''){
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
 const plan=node('plan'),document=new EventTarget(),urls=[];
 Object.assign(document,{getElementById:node,querySelector:()=>plan,querySelectorAll:()=>[]});
 const scope={...model,esc:escapeHtml,document,location:{pathname:'/coverage.html',search,hash:''},history:{replaceState:(_a,_b,url)=>urls.push(url)},Element:Node,Option:class{constructor(text,value){this.text=text;this.value=value;}},fetch:async url=>({ok:url!==fail,json:async()=>JSON.parse(fs.readFileSync('web/'+url))})};
 await new AsyncFunction(...Object.keys(scope),source)(...Object.values(scope));
 return {node,plan,urls,select(id,value){node(id).value=value;node(id).dispatchEvent(new Event('change'));},choose(id){const event=new Event('click');const target=new Node();target.dataset.package=id;Object.defineProperty(event,'target',{value:target});document.dispatchEvent(event);}};
}
test('coverage startup keeps checked statements distinct from complete research packages',async()=>{
 const app=await startup();
 assert.match(app.node('checked-total').textContent,/333 statements/);
 assert.match(app.node('revision').textContent,/0 \/ 364/);
 assert.match(app.node('match-count').textContent,/364 of 364/);
 assert.match(app.node('research-findings').innerHTML,/13 candidate statements/);
 assert.match(app.node('research-findings').innerHTML,/drafts, not accepted timeline facts/);
 assert.equal(app.urls.at(-1),'/coverage.html');
 assert.equal(app.node('error').hidden,true);
});
test('coverage restores filters and selections, including the Egyptian introduction',async()=>{
 const app=await startup('?package=egypt-predynastic-introduction&group=Africa&workflow=unresearched&evidence=unknown&pilot=1');
 assert.equal(app.plan.open,true);assert.equal(app.node('group').value,'Africa');assert.equal(app.node('pilot').checked,true);
 assert.match(app.node('package-detail').innerHTML,/5500 BCE – 3001 BCE/);
 assert.equal(app.node('research-findings').innerHTML,'');
 assert.match(app.urls.at(-1),/package=egypt-predynastic-introduction/);
 app.choose('britain-ireland__bce-500-251');
 assert.match(app.node('package-detail').innerHTML,/Britain and Ireland/);
 assert.match(app.node('research-findings').innerHTML,/13 candidate statements/);
 assert.match(app.urls.at(-1),/package=britain-ireland__bce-500-251/);
});
test('coverage filters do not change global totals and support empty results',async()=>{
 const app=await startup('?package=britain-ireland__bce-500-251');const totals=app.node('totals').innerHTML;
 app.select('workflow','accepted');
 assert.match(app.node('match-count').textContent,/0 of 364/);assert.match(app.node('match-count').textContent,/Try widening/);
 assert.equal(app.node('totals').innerHTML,totals);assert.match(app.urls.at(-1),/workflow=accepted/);
 app.plan.open=false;app.plan.dispatchEvent(new Event('toggle'));assert.equal(app.urls.at(-1),'/coverage.html');
});
test('coverage reports unavailable inputs and does not render misleading totals',async()=>{
 for(const file of ['data/coverage.json','data/coverage-research.json']){
  const app=await startup('',file);assert.equal(app.node('error').hidden,false);assert.match(app.node('error').textContent,/could not be loaded/);assert.equal(app.node('totals').innerHTML,'');
 }
});
