import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {startHome} from '../web/generated/browser/home.js';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
import {searchEntities} from '../web/generated/domain/search.js';
const exploration=JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json'));
const index=JSON.parse(fs.readFileSync('web/data/search-index.json'));
class Node extends EventTarget {
 children=[];value='';hidden=false;disabled=false;textContent='';focused=false;
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 querySelector(){return this.children[0]?.children[0]??null;}
 focus(){this.focused=true;}
}
function setup({base='/',hash='',load=async()=>index}={}){
 const input=new Node(),results=new Node(),status=new Node(),requests=[],redirects=[];
 const document={getElementById:id=>({'home-query':input,'home-results':results,'home-search-status':status})[id],createElement:()=>new Node(),createTextNode:text=>({textContent:text})};
 const ready=startHome(base,{document,location:{hash,replace:url=>redirects.push(url)},fetch:async url=>{requests.push(url);return {ok:true,json:load};}});
 return {input,results,status,requests,redirects,ready,search(query){input.value=query;input.dispatchEvent(new Event('input'));},key(key){const event=new Event('keydown',{cancelable:true});Object.assign(event,{key});input.dispatchEvent(event);return event;}};
}
test('home search retains results for every history and uses the deployment mount',async()=>{
 const app=setup({base:'/historica/'});await app.ready;
 const data=buildFocusData({},exploration);
 for(const entity of data.entities){
  app.search(entity.title);
  const expected=searchEntities(data.entities,entity.title).slice(0,12);
  assert.deepEqual(app.results.children.map(li=>li.children[0].href),expected.map(e=>`/historica/${e.type}/${encodeURIComponent(e.id)}`),entity.id);
 }
 assert.deepEqual(app.requests,['/historica/data/search-index.json']);
 assert.equal(app.input.disabled,false);
});
test('home search caps results, handles no matches and supports keyboard navigation',async()=>{
 const app=setup();await app.ready;
 app.search('person');assert.equal(app.results.children.length,12);assert.match(app.status.textContent,/showing the first 12/);
 const first=app.results.querySelector('a');assert.equal(app.key('ArrowDown').defaultPrevented,true);assert.equal(first.focused,true);
 app.key('Escape');assert.equal(app.input.value,'');assert.equal(app.results.hidden,true);assert.equal(app.results.children.length,0);
 app.search('zzzznonexistent');assert.match(app.status.textContent,/No matches/);
});
test('a query entered during loading is answered when records arrive',async()=>{
 let resolve;const pending=new Promise(done=>{resolve=done;});const app=setup({load:()=>pending});
 app.search('Socrates');assert.match(app.status.textContent,/Loading/);
 resolve(index);await app.ready;
 assert.equal(app.results.children[0].children[0].href,'/person/socrates');
});
test('network and malformed data failures leave featured histories as the fallback',async()=>{
 for(const load of [async()=>{throw Error('offline');},async()=>({entities:[]})]){
  const app=setup({load});await app.ready;
  assert.equal(app.input.disabled,true);assert.match(app.status.textContent,/featured history/);
 }
});
test('legacy home fragments retain their staging mount on redirect',async()=>{
 const app=setup({base:'/historica/',hash:'#focus=socrates'});await app.ready;
 assert.deepEqual(app.redirects,['/historica/focus.html#focus=socrates']);
});
