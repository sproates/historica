import test from 'node:test';
import assert from 'node:assert/strict';
import {fitMapCamera} from '../web/generated/domain/map-camera.js';
import {setupMap} from '../web/focus-map.js';

test('fitted map includes every point and stays within the world',()=>{
  for(const points of [[],[[400,110]],[[360,80],[520,150]],[[0,0],[720,360]]]){
    const c=fitMapCamera(points);
    assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=720&&c.y+c.w/2<=360);
    for(const [x,y] of points)assert.ok(x>=c.x&&x<=c.x+c.w&&y>=c.y&&y<=c.y+c.w/2);
  }
  assert.ok(fitMapCamera([[400,110]]).w<720);
});

test('map enhancement preserves the pre-rendered camera before its data arrives',()=>{
  const before=globalThis.document;
  const controls=new Map();let view;
  globalThis.document={getElementById(id){if(!controls.has(id))controls.set(id,{value:1,addEventListener(){},removeEventListener(){}});return controls.get(id);}};
  try{
    setupMap({getAttribute:()=> '350 80 200 100',setAttribute(k,v){if(k==='viewBox')view=v;},style:{setProperty(){}},addEventListener(){}});
    assert.equal(view,'350 80 200 100');
  }finally{globalThis.document=before;}
});
