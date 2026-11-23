import test from 'node:test';
import assert from 'node:assert/strict';
import {createHistoryPage,geometry} from '../web/generated/presentation/history-page.js';
const focus={id:'example',type:'person',title:'Example',startYear:-400,endYear:-300,description:'A history',point:null,url:'https://example.org/history'};
const data={entities:[focus],associations:[],relationships:[]};
const countries={features:[]};
const pack=()=>({claims:[{id:'claim',subjectId:'example',status:'accepted',statement:'A checked statement',evidenceIds:['passage']}],evidence:[{id:'passage',sourceId:'source',locator:'Page 1',note:'Scope'}],sources:[{id:'source',url:'https://example.org/source',title:'Source',creator:'Author'}]});

test('page model resolves evidence before templates render and rejects broken references',()=>{
  const evidence=pack();
  const page=createHistoryPage(data,'example',evidence,countries);
  assert.deepEqual(page.checked,[{statement:'A checked statement',citations:[{url:'https://example.org/source',title:'Source',creator:'Author',locator:'Page 1',note:'Scope'}]}]);
  evidence.sources=[];
  assert.throws(()=>createHistoryPage(data,'example',evidence,countries),/Missing source: source/);
  evidence.evidence=[];
  assert.throws(()=>createHistoryPage(data,'example',evidence,countries),/Missing evidence: passage/);
});

test('unlocated associations retain their source without generating a map marker',()=>{
  const history={...data,associations:[{subject:'example',place:'example',label:'Location not known',startYear:-400,endYear:-300,point:null,source:'https://example.org/place'}]};
  const page=createHistoryPage(history,'example',pack(),countries);
  assert.deepEqual(page.places,[]);
  assert.ok(page.references.includes('https://example.org/place'));
});

test('geometry boundary rejects invalid coordinates instead of emitting a broken SVG path',()=>{
  assert.equal(geometry({type:'Polygon',coordinates:[[[0,0],[1,1],[0,0]]]}),'M360,180L362,178L360,180Z');
  assert.throws(()=>geometry({type:'Polygon',coordinates:[[[null,1]]]}),/Invalid coordinate/);
  assert.throws(()=>geometry({type:'Polygon',coordinates:'invalid'}),/Invalid polygon/);
});
