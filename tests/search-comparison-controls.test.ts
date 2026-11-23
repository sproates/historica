import test from 'node:test';
import assert from 'node:assert/strict';
import {bindComparisonControls} from '../web/generated/controllers/comparison-controls.js';
import {bindSearchControls} from '../web/generated/controllers/search-controls.js';

class Control extends EventTarget {
  value='';innerHTML='';textContent='';hidden=false;dataset={};focused=false;
  focus(){this.focused=true;}
  closest(){return this.dataset.searchFocus?this:null;}
  querySelector(){return this.innerHTML.includes('<button')?this.result:null;}
}
const entities=[
  {id:'alexander',title:'Alexander',type:'person',startYear:-356,endYear:-323,description:'Macedonia'},
  {id:'philip',title:'Philip <II>',type:'person',startYear:-382,endYear:-336,description:'A king & father'},
  {id:'egypt',title:'Egypt',type:'area',startYear:-3000,endYear:200,description:'Nile'},
];
const fire=(node,type,properties={})=>{const event=new Event(type,{cancelable:true});for(const [key,value]of Object.entries(properties))Object.defineProperty(event,key,{value});node.dispatchEvent(event);return event;};

test('comparison choices reject duplicate people, preserve incomplete choices and detach cleanly',()=>{
  const nodes=new Map(['compare-first','compare-second','compare-reset','comparison-shared','comparison-full'].map(id=>[id,new Control()]));
  const changes=[],scales=[];let resets=0;
  const dispose=bindComparisonControls({getElementById:id=>nodes.get(id)},{getEntities:()=>entities,selectPeople:(...args)=>changes.push(args),selectScale:mode=>scales.push(mode),reset:()=>resets++});
  const first=nodes.get('compare-first'),second=nodes.get('compare-second');
  assert.ok(first.innerHTML.includes('Philip &lt;II&gt;'));assert.ok(!first.innerHTML.includes('Egypt'));
  first.value='alexander';fire(first,'change');assert.deepEqual(changes.at(-1),[['alexander',''],false]);
  second.value='alexander';fire(second,'change');assert.deepEqual(changes.at(-1),[['alexander',''],true]);assert.equal(second.value,'');
  second.value='philip';fire(second,'change');assert.deepEqual(changes.at(-1),[['alexander','philip'],false]);
  fire(nodes.get('comparison-full'),'click');fire(nodes.get('comparison-shared'),'click');assert.deepEqual(scales,['full','shared']);
  fire(nodes.get('compare-reset'),'click');assert.equal(resets,1);
  dispose();fire(nodes.get('compare-reset'),'click');assert.equal(resets,1);
});

test('search supports keyboard focus, selection, escaping, empty results and cleanup',()=>{
  const oldElement=globalThis.Element;globalThis.Element=Control;
  try{
    const nodes=new Map(['history-search','search-panel','search-clear','search-results','search-count'].map(id=>[id,new Control()]));
    const container=new Control(),selected=[];
    const results=nodes.get('search-results'),input=nodes.get('history-search');
    const button=new Control();button.dataset.searchFocus='philip';results.result=button;
    const dispose=bindSearchControls({getElementById:id=>nodes.get(id),querySelector:()=>container},{getEntities:()=>entities,formatDates:(a,b)=>`${a} to ${b}`,select:id=>selected.push(id)});
    input.value='philip';fire(input,'input');
    assert.equal(nodes.get('search-panel').hidden,false);assert.ok(results.innerHTML.includes('Philip &lt;II&gt;'));
    assert.ok(results.innerHTML.includes('A king &amp; father'));
    const event=fire(input,'keydown',{key:'ArrowDown'});assert.equal(event.defaultPrevented,true);assert.equal(button.focused,true);
    fire(results,'click',{target:button});assert.deepEqual(selected,['philip']);assert.equal(input.value,'');assert.equal(nodes.get('search-panel').hidden,true);
    input.value='nothingmatches';fire(input,'input');assert.match(nodes.get('search-count').textContent,/No matches/);
    fire(container,'keydown',{key:'Escape'});assert.equal(input.value,'');assert.equal(input.focused,true);
    input.value='egypt';fire(input,'input');assert.match(results.innerHTML,/Egypt/);
    fire(nodes.get('search-clear'),'click');assert.equal(results.innerHTML,'');
    dispose();input.value='philip';fire(input,'input');assert.equal(results.innerHTML,'');
  }finally{globalThis.Element=oldElement;}
});
