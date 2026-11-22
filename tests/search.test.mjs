import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchEntities} from '../web/search-model.js';
import {buildFocusData,initialFocus,changeFocus} from '../web/focus-model.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('search prioritises titles and accepts accents, case and partial words',()=>{
 assert.equal(searchEntities(data.entities,'  PLATO ')[0].id,'plato');
 assert.ok(searchEntities(data.entities,'monte alban').some(e=>e.title==='Monte Albán'));
 assert.equal(searchEntities(data.entities,'socrat')[0].id,'socrates');
 assert.deepEqual(searchEntities(data.entities,'   '),[]);
 assert.deepEqual(searchEntities(data.entities,'xyznohistory'),[]);
});
test('search spans dates and descriptions while focus changes retain their semantics',()=>{
 assert.ok(searchEntities(data.entities,'urban Indus').some(e=>e.id==='indus-urban'));
 const state=initialFocus(data);
 const early=searchEntities(data.entities,'Khufu')[0];
 assert.equal(changeFocus(data,state,early.id).start,-2551);
 const egypt=searchEntities(data.entities,'Egypt')[0];
 assert.equal(egypt.id,'egypt');
 assert.deepEqual([changeFocus(data,state,egypt.id).start,changeFocus(data,state,egypt.id).end],[state.start,state.end]);
});
