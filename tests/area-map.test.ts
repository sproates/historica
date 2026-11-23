import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData,initialFocus,focusAssociations} from '../scripts/lib/focus-data.ts';
const read=p=>JSON.parse(fs.readFileSync(p));
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
test('area maps include regional sites only when their dated records overlap',()=>{
 const state={...initialFocus(data,'britain-ireland'),start:-2551,end:-2528};
 const ids=focusAssociations(data,state).map(a=>a.subject);
 assert.ok(ids.includes('stonehenge'));
 assert.ok(!ids.includes('stonehenge-stones'));
 assert.ok(!ids.includes('chavin-context'));
 assert.deepEqual(focusAssociations(data,{...state,start:-10000,end:-9000}),[]);
});
