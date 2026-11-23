import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildFocusData,initialFocus,focusAssociations,changeFocus} from '../scripts/lib/focus-data.ts';
const read=p=>JSON.parse(fs.readFileSync(p));
const evidence=read('web/data/reviewed-evidence.json');
const data=buildFocusData(read('web/data/collection.json'),read('web/data/reviewed-exploration.json'));
const expected={pataliputra:[85+11/60+6.04/3600,25+35/60+58.95/3600],'han-changan':[108+51/60+26/3600,34+18/60+16/3600],'han-luoyang':[112+37/60+17/3600,34+43/60+52/3600]};
test('all three cities have sourced site coordinates and visible map associations',()=>{
 for(const [id,point] of Object.entries(expected)){
  const e=data.entities.find(e=>e.id===id);assert.deepEqual(e.point,point);
  const c=evidence.claims.find(c=>c.id===`city-references-${id}-point`);assert.deepEqual(c.value.coordinates,point);assert.ok(e.claimIds.includes(c.id));
  assert.ok(focusAssociations(data,initialFocus(data,id)).some(a=>a.subject===id&&JSON.stringify(a.point)===JSON.stringify(point)));
  assert.match(e.note,/site reference/);
 }
});
test('site data neither moves people nor changes date-preserving city navigation',()=>{
 for(const id of Object.keys(expected)){
  const associations=data.associations.filter(a=>a.claimIds?.includes(`city-references-${id}-point`));
  assert.ok(associations.every(a=>a.subject===id&&a.place===id));
  const prior=initialFocus(data,'alexander'),next=changeFocus(data,prior,id);
  assert.deepEqual([next.start,next.end],[prior.start,prior.end]);
 }
});
