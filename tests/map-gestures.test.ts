import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap} from '../web/generated/controllers/map-controls.js';
test('map supports anchored pinch, two-finger pan, lifting a finger and trackpad gestures',()=>{
 const controls=new Map();const handlers={};let view;
 const oldDocument=globalThis.document;
 globalThis.document={getElementById(id){if(!controls.has(id))controls.set(id,{value:1,addEventListener(){},removeEventListener(){}});return controls.get(id);}};
 const svg={setAttribute(k,v){if(k==='viewBox')view=v.split(' ').map(Number);},style:{setProperty(){}},getBoundingClientRect:()=>({left:0,top:0,width:720,height:360}),setPointerCapture(){},addEventListener(k,fn){handlers[k]=fn;}};
 const pointer=(id,x,y)=>({button:0,pointerId:id,clientX:x,clientY:y});
 try{
 setupMap(svg);
 handlers.pointerdown(pointer(1,260,180));handlers.pointerdown(pointer(2,460,180));
 handlers.pointermove(pointer(2,660,180));
 assert.equal(view[2],360);assert.equal(view[0],130); // pinch anchor follows moving midpoint
 handlers.pointermove(pointer(1,300,180));handlers.pointermove(pointer(2,700,180));
 assert.equal(view[2],360);assert.equal(view[0],110); // two fingers translate without changing scale
 handlers.pointerup(pointer(2,700,180));handlers.pointermove(pointer(1,320,180));
 assert.equal(view[0],100); // remaining finger continues smoothly
 handlers.pointercancel(pointer(1,320,180));
 let stopped=false;handlers.click({stopPropagation(){stopped=true;}});assert.equal(stopped,true);
 const wheel={deltaMode:0,deltaX:20,deltaY:10,clientX:360,clientY:180,preventDefault(){}};
 const before=[...view];handlers.wheel(wheel);assert.equal(view[2],before[2]);assert.equal(view[0],before[0]+10);
 const anchor=view[0]+view[2]/2;handlers.wheel({...wheel,ctrlKey:true,deltaY:-40});
 assert.ok(view[2]<360);assert.ok(Math.abs(view[0]+view[2]/2-anchor)<.00001);
 handlers.wheel({...wheel,ctrlKey:true,deltaY:100000});assert.ok(view[2]<=720);assert.ok(view[0]>=0);
 }finally{globalThis.document=oldDocument;}
});
