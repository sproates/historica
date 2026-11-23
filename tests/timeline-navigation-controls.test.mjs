import test from 'node:test';
import assert from 'node:assert/strict';
import {bindTimelineControls} from '../web/generated/controllers/timeline-controls.js';
import {bindNavigationControls} from '../web/generated/controllers/navigation-controls.js';
import {yearAtFraction} from '../web/generated/domain/timeline.js';

class Control extends EventTarget {
  dataset={};attributes=new Map();captures=new Set();focused=false;value='';axis=false;
  closest(selector){if(selector==='.swim-dates')return this.axis?this:null;if(selector==='[data-lane]')return this.dataset.lane?this:null;return this.dataset.focus||this.dataset.filter?this:null;}
  hasAttribute(name){return this.attributes.has(name);}
  setAttribute(name,value){this.attributes.set(name,value);}
  focus(){this.focused=true;}
  scrollIntoView(){this.scrolled=true;}
  setPointerCapture(id){this.captures.add(id);}
  hasPointerCapture(id){return this.captures.has(id);}
  releasePointerCapture(id){this.captures.delete(id);}
  getBoundingClientRect(){return {left:100,width:200};}
}
function fire(node,name,properties={}){const event=new Event(name,{cancelable:true});for(const [key,value] of Object.entries(properties))Object.defineProperty(event,key,{value});node.dispatchEvent(event);return event;}

test('date-axis selection omits year zero and clamps to the visible window',()=>{
  assert.equal(yearAtFraction({start:-2,end:2},0),-2);
  assert.equal(yearAtFraction({start:-2,end:2},.5),1);
  assert.equal(yearAtFraction({start:-2,end:2},1),2);
  assert.equal(yearAtFraction({start:-2,end:2},-5),-2);
  assert.equal(yearAtFraction({start:-2,end:2},5),2);
  assert.equal(yearAtFraction({start:-329,end:-329},.75),-329);
});

test('timeline dragging follows the current window, releases capture and restores lane focus',()=>{
  const previous=globalThis.Element;globalThis.Element=Control;
  try{
    const lanes=new Control(),jump=new Control(),heading=new Control(),axis=new Control();axis.axis=true;
    let replacement=new Control();replacement.dataset.lane='["alexander","Egypt"]';
    lanes.querySelector=()=>axis;lanes.querySelectorAll=()=>[replacement];
    let window={start:-2,end:2};const years=[],keys=[];
    const dispose=bindTimelineControls({getElementById:id=>({'swimlanes':lanes,'jump-timeline':jump,'swim-heading':heading}[id])},{getWindow:()=>window,selectYear:y=>years.push(y),toggleLane:key=>{keys.push(key);replacement=new Control();replacement.dataset.lane=key;}});
    const entry=new Control();entry.dataset.focus='philip';
    assert.equal(fire(lanes,'pointerdown',{target:entry,pointerId:1,clientX:150}).defaultPrevented,false);
    assert.equal(years.length,0);
    fire(lanes,'pointerdown',{target:axis,pointerId:1,clientX:100});assert.equal(years.at(-1),-2);
    fire(lanes,'pointermove',{pointerId:1,buttons:1,clientX:200});assert.equal(years.at(-1),1);
    window={start:10,end:20};fire(lanes,'pointermove',{pointerId:1,buttons:1,clientX:200});assert.equal(years.at(-1),15);
    fire(lanes,'pointercancel',{pointerId:1});assert.equal(lanes.hasPointerCapture(1),false);
    const length=years.length;fire(lanes,'pointermove',{pointerId:1,buttons:1,clientX:300});assert.equal(years.length,length);
    fire(lanes,'click',{target:replacement});assert.deepEqual(keys,['["alexander","Egypt"]']);assert.equal(replacement.focused,true);
    fire(jump,'click');assert.equal(heading.focused,true);assert.equal(heading.scrolled,true);
    fire(lanes,'pointerdown',{target:axis,pointerId:2,clientX:100});dispose();assert.equal(lanes.hasPointerCapture(2),false);
    const final=years.length;fire(lanes,'pointerdown',{target:axis,pointerId:2,clientX:300});assert.equal(years.length,final);
  }finally{globalThis.Element=previous;}
});

test('navigation distinguishes focus from filtering and preserves journey kinds',()=>{
  const previous=globalThis.Element;globalThis.Element=Control;
  try{
    const nodes=new Map(['focus-picker','whole-period','more-context','back','main'].map(id=>[id,new Control()]));
    const calls=[];
    const dispose=bindNavigationControls({getElementById:id=>nodes.get(id),querySelector:()=>nodes.get('main')},{focus:(...args)=>calls.push(['focus',...args]),filter:id=>calls.push(['filter',id]),wholePeriod:()=>calls.push(['whole']),toggleContext:()=>calls.push(['context']),back:()=>calls.push(['back'])});
    const target=new Control();target.dataset={focus:'julius-caesar',kind:'person'};
    fire(nodes.get('main'),'click',{target});assert.deepEqual(calls.at(-1),['focus','julius-caesar','person']);
    target.dataset={filter:'egypt'};fire(nodes.get('main'),'click',{target});assert.deepEqual(calls.at(-1),['filter','egypt']);
    target.dataset={focus:'alexander'};target.setAttribute('disabled','');const before=calls.length;fire(nodes.get('main'),'click',{target});assert.equal(calls.length,before);
    nodes.get('focus-picker').value='philip';fire(nodes.get('focus-picker'),'change');assert.deepEqual(calls.at(-1),['focus','philip']);
    for(const id of ['whole-period','more-context','back'])fire(nodes.get(id),'click');
    assert.deepEqual(calls.slice(-3),[['whole'],['context'],['back']]);
    dispose();const count=calls.length;fire(nodes.get('back'),'click');assert.equal(calls.length,count);
  }finally{globalThis.Element=previous;}
});
