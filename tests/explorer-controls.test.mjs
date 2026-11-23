import test from 'node:test';
import assert from 'node:assert/strict';
import {bindExplorerControls} from '../web/generated/controllers/explorer-controls.js';
import {initialFocus,changeFocus,clampMoment,focusEnvelope} from '../web/generated/state/focus.js';
import {encodeView,decodeView} from '../web/generated/state/view-url.js';

const data={entities:[
  {id:'alexander',type:'person',startYear:-356,endYear:-323},
  {id:'egypt',type:'area',startYear:-3000,endYear:200},
  {id:'cross-era',type:'person',startYear:-2,endYear:2},
]};
function harness(){
  const nodes=new Map();
  for(const [tag,ids] of Object.entries({input:['start','end','year-enabled','year-cursor'],select:['kind','area'],button:['zoom-in','zoom-out','fit','year-prev','year-next','clear']})){
    for(const id of ids){const node=new EventTarget();Object.assign(node,{tagName:tag.toUpperCase(),value:'',checked:false});nodes.set(id,node);}
  }
  let state=initialFocus(data),moment=null,envelope=focusEnvelope(data,state),updates=0;
  const dispose=bindExplorerControls({getElementById:id=>nodes.get(id)}, {
    getData:()=>data,getState:()=>state,getMoment:()=>moment,
    setState(next,resize){state=next;if(resize)envelope=focusEnvelope(data,state);moment=clampMoment(moment,state);updates++;},
    setMoment(next){moment=clampMoment(next,state);updates++;},
  });
  return {nodes,dispose,read:()=>({state,moment,envelope,updates}),focus(id){state=changeFocus(data,state,id);},fire(id,event,value){const node=nodes.get(id);if(value!==undefined)node.value=value;node.dispatchEvent(new Event(event));}};
}

test('date controls preserve place windows and filter changes survive a bookmark round trip',()=>{
  const h=harness();
  h.fire('start','input','-339'); // Ordinal -339 is historical 340 BCE.
  assert.deepEqual([h.read().state.start,h.read().state.end],[-340,-323]);
  assert.equal(h.read().envelope.start,-356);
  h.focus('egypt');
  assert.deepEqual([h.read().state.start,h.read().state.end],[-340,-323]);
  h.fire('kind','change','person');h.fire('area','change','egypt');
  const {state,envelope}=h.read();
  const view={...decodeView('/area/egypt',data).view,envelope};
  assert.deepEqual(decodeView(encodeView(state,view,data),data).state,state);
  h.fire('fit','click');
  assert.deepEqual(h.read().state,{focus:'egypt',start:-3000,end:200,kind:'person',area:'egypt'});
  h.fire('clear','click');
  assert.deepEqual(h.read().state,{focus:'egypt',start:-3000,end:200,kind:'all',area:'all'});
  h.dispose();
});

test('year stepping crosses BCE to CE without year zero and clamps at the visible bounds',()=>{
  const h=harness();h.focus('cross-era');
  h.fire('year-cursor','input','0');assert.equal(h.read().moment,-1);
  h.fire('year-next','click');assert.equal(h.read().moment,1);
  h.fire('year-prev','click');assert.equal(h.read().moment,-1);
  h.fire('year-next','click');h.fire('year-next','click');h.fire('year-next','click');
  assert.equal(h.read().moment,2);
  h.nodes.get('year-enabled').checked=false;h.fire('year-enabled','change');
  assert.equal(h.read().moment,null);h.dispose();
});

test('zoom reads the current focus, keeps ordered nonzero dates, and handlers can be detached',()=>{
  const h=harness();h.focus('cross-era');
  h.fire('zoom-in','click');
  assert.deepEqual([h.read().state.start,h.read().state.end],[1,2]);
  h.fire('zoom-in','click');
  assert.deepEqual([h.read().state.start,h.read().state.end],[2,2]);
  h.nodes.get('year-enabled').checked=true;h.fire('year-enabled','change');
  assert.equal(h.read().moment,2);
  h.fire('zoom-out','click');
  assert.ok(h.read().state.start<0&&h.read().state.end>0);
  const before=structuredClone(h.read());h.dispose();h.fire('zoom-out','click');
  assert.deepEqual(h.read(),before);
});
