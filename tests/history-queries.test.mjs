import test from 'node:test';
import assert from 'node:assert/strict';
import {focusAssociations,rankedContext,relatedEntities,temporalLabel} from '../web/generated/domain/history-queries.js';
const entity=(id,type,startYear,endYear,point=null)=>({id,title:id,type,startYear,endYear,point,description:'',url:'https://example.org/history'});
const association=(subject,place,startYear,endYear,point)=>({subject,place,startYear,endYear,point,label:place,source:'https://example.org/source'});
const state={focus:'traveller',start:-400,end:-300,area:'all',kind:'all'};

test('distance ranking uses locations from the overlapping dates, not the whole journey',()=>{
  const data={entities:[entity('traveller','person',-400,-300),entity('early','event',-380,-380,[100,0]),entity('late','event',-320,-320,[0,0])],associations:[association('traveller','west',-400,-360,[0,0]),association('traveller','east',-340,-300,[100,0])],relationships:[]};
  const before=structuredClone(data);
  const ranked=rankedContext(data,state);
  assert.equal(ranked.length,2);
  for(const row of ranked)assert.ok(row.km>10000,row.id);
  assert.deepEqual(focusAssociations(data,{...state,start:-350,end:-330}),[data.associations[1]]);
  assert.deepEqual(data,before);
});

test('missing coordinates remain unknown and do not erase an association or invent distance',()=>{
  const data={entities:[entity('traveller','person',-400,-300),entity('other','person',-390,-320)],associations:[association('traveller','west',-400,-300,null),association('other','east',-390,-320,null)],relationships:[]};
  assert.equal(rankedContext(data,state)[0].km,null);
  assert.equal(focusAssociations(data,state)[0].point,null);
  data.associations[0].point=[0,0];
  assert.equal(rankedContext(data,state)[0].km,null);
  data.associations[1].point=[1,0];
  assert.ok(rankedContext(data,state)[0].km>100);
});

test('relationship labels are directional and preserve overlap information',()=>{
  const data={entities:[entity('traveller','person',-400,-300),entity('parent','person',-450,-410)],associations:[],relationships:[{a:'traveller',b:'parent',label:'Family',labelFromA:'Parent',labelFromB:'Child'}]};
  assert.deepEqual(relatedEntities(data,state).map(e=>[e.id,e.relation,e.inWindow]),[['parent','Parent',false]]);
  assert.deepEqual(relatedEntities(data,{...state,focus:'parent'}).map(e=>[e.id,e.relation,e.inWindow]),[['traveller','Child',true]]);
});

test('uncertain outer dates do not become a claim of continuous activity',()=>{
  const record={uncertainty:{start:[-400,-380],end:[-330,-300]}};
  assert.equal(temporalLabel(record,{start:-395,end:-390}),'Possible overlap · dates uncertain');
  assert.equal(temporalLabel(record,{start:-370,end:-350}),'Broad context · dates uncertain');
  assert.equal(temporalLabel({temporalKind:'dated-evidence'},{start:-370,end:-350}),'Date uncertain within this range');
});
