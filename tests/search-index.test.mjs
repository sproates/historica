import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSearchIndex,searchIndex,searchEntities} from '../web/generated/domain/search.js';
import {parseSearchIndex} from '../web/generated/content/search-index.js';
import {buildFocusData} from '../web/focus-model.js';
const reviewed=JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json'));
const {entities}=buildFocusData({},reviewed);
const index=parseSearchIndex(JSON.parse(fs.readFileSync('web/data/search-index.json')));
const ids=rows=>rows.map(row=>row.id);

test('generated index preserves every search result and its displayed dates',()=>{
 assert.deepEqual(index,createSearchIndex(entities));
 assert.deepEqual(index.entries.map(({id,type,title,startYear,endYear})=>({id,type,title,startYear,endYear})),entities.map(({id,type,title,startYear,endYear})=>({id,type,title,startYear,endYear})));
 const queries=new Set(['  PLATO ','monte alban','socrat','urban Indus','person','xyznohistory','   ']);
 for(const entity of entities){
  queries.add(entity.title);
  queries.add(entity.description.split(/\s+/).slice(0,3).join(' '));
  if(entity.region)queries.add(entity.region);
  if(entity.note)queries.add(entity.note.split(/\s+/).slice(0,3).join(' '));
 }
 for(const query of queries)assert.deepEqual(ids(searchIndex(index,query)),ids(searchEntities(entities,query)),query);
 for(const entry of index.entries)assert.deepEqual(Object.keys(entry).sort(),['id','type','title','startYear','endYear','text'].sort());
 assert.ok(fs.statSync('web/data/search-index.json').size<fs.statSync('web/data/reviewed-exploration.json').size);
});
test('index preserves accents, aliases, partial words and title priority',()=>{
 const records=[{...entities[0],id:'alias',title:'Álpha',aliases:['old name'],description:'beta reference',note:'unusual detail'},{...entities[0],id:'beta',title:'Beta',description:'alpha reference'}];
 for(const query of ['alpha','old name','unusual','bet','reference'])assert.deepEqual(ids(searchIndex(createSearchIndex(records),query)),ids(searchEntities(records,query)));
});
test('malformed search contracts are rejected before rendering results',()=>{
 for(const value of [null,{}, {version:2,entries:[]},{version:1,entries:[{}]}, {version:1,entries:[index.entries[0],index.entries[0]]}])assert.throws(()=>parseSearchIndex(value),/Invalid search/);
 for(const patch of [{id:'../escape'},{type:'unknown'},{startYear:0},{endYear:-999999},{text:null},{title:''}])assert.throws(()=>parseSearchIndex({version:1,entries:[{...index.entries[0],...patch}]}),/Invalid search/);
});
