import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap} from '../web/generated/controllers/map-controls.js';
import {fitMapCamera} from '../web/generated/domain/map-camera.js';

class Control extends EventTarget {
  value='1';disabled=false;
  closest(){return null;}
}
class MapSurface extends Control {
  view='350 80 200 100';captures=new Set();properties=new Map();
  style={setProperty:(key,value)=>this.properties.set(key,value)};
  getAttribute(){return this.view;}
  setAttribute(key,value){if(key==='viewBox')this.view=value;}
  getBoundingClientRect(){return {left:0,top:0,width:720,height:360};}
  setPointerCapture(id){this.captures.add(id);}
  hasPointerCapture(id){return this.captures.has(id);}
  releasePointerCapture(id){this.captures.delete(id);}
}
const fire=(node,type,properties={})=>{const event=new Event(type,{cancelable:true});for(const [key,value] of Object.entries(properties))Object.defineProperty(event,key,{value});node.dispatchEvent(event);return event;};

test('map restoration and data updates stay silent while user controls report changes',()=>{
  const nodes=new Map(['map-in','map-out','map-world','map-fit','map-borders'].map(id=>[id,new Control()]));
  const svg=new MapSurface();let changes=0;
  const map=setupMap(svg,()=>changes++,{getElementById:id=>nodes.get(id)});
  assert.equal(svg.view,'350 80 200 100');
  const initialChanges=changes;
  const saved={x:330,y:70,w:180,borders:.4};map.restore(saved);map.update([[420,120]]);
  assert.deepEqual(map.getState(),saved);assert.equal(changes,initialChanges);
  assert.equal(svg.properties.get('--border-opacity'),'0.4');
  const points=[[400,100],[500,130]];map.fitOnNextUpdate();map.update(points);
  assert.deepEqual(map.getState(),{...fitMapCamera(points),borders:.4});assert.equal(changes,initialChanges);
  fire(nodes.get('map-world'),'click');assert.equal(map.getState().w,720);assert.equal(changes,initialChanges+1);
  fire(nodes.get('map-fit'),'click');assert.ok(map.getState().w<720);
  nodes.get('map-borders').value='0.75';fire(nodes.get('map-borders'),'input');assert.equal(map.getState().borders,.75);
  map.update([]);assert.equal(nodes.get('map-fit').disabled,true);
  map.dispose();
});

test('map keyboard controls retain bounded camera state and disposal releases gestures',()=>{
  const previous=globalThis.Element;globalThis.Element=Control;
  try{
    const nodes=new Map(['map-in','map-out','map-world','map-fit','map-borders'].map(id=>[id,new Control()]));
    const svg=new MapSurface(),map=setupMap(svg,()=>{},{getElementById:id=>nodes.get(id)});
    fire(svg,'keydown',{key:'ArrowRight'});assert.equal(map.getState().x,370);
    fire(svg,'keydown',{key:'+'});assert.equal(map.getState().w,140);
    fire(svg,'pointerdown',{button:0,pointerId:1,clientX:200,clientY:180});
    fire(svg,'pointerdown',{button:0,pointerId:2,clientX:400,clientY:180});
    assert.equal(svg.captures.size,2);
    map.dispose();assert.equal(svg.captures.size,0);
    const before=map.getState();fire(svg,'keydown',{key:'ArrowRight'});fire(nodes.get('map-world'),'click');
    assert.deepEqual(map.getState(),before);
  }finally{globalThis.Element=previous;}
});
