import test from 'node:test';
import assert from 'node:assert/strict';
import {ordinal,historical,windowAround,shiftWindow,zoomWindow,readTimeline,appendTimeline,overlaps,FIRST,LAST} from '../web/timeline-model.js';
test('time arithmetic crosses BCE to CE without a year zero',()=>{assert.equal(historical(ordinal(-1)+1),1);assert.deepEqual(windowAround(-1,2),{start:-2,end:1});});
test('zoom keeps the selected moment and expands to the complete scope',()=>{let s={start:-336,end:-323,moment:-329,selection:'life-alexander'};for(let i=0;i<8;i++){s=zoomWindow(s,1);assert.ok(s.start<=s.moment&&s.end>=s.moment);}assert.equal(s.start,FIRST);assert.equal(s.end,LAST);assert.equal(s.moment,-329);});
test('panning at the edges keeps range and marker within supported history',()=>{let s={...windowAround(LAST,99),moment:LAST};s=shiftWindow(s,1);assert.equal(s.end,LAST);assert.equal(s.moment,LAST);const back=shiftWindow(s,-1);assert.equal(ordinal(back.end)-ordinal(back.start),99);assert.ok(back.moment<=back.end);});
test('timeline URL shares period, moment and story alongside map state',()=>{const s={start:-1000,end:500,moment:-329,selection:'china-warring'};const hash=appendTimeline('#year=-329&mode=explore',s);assert.deepEqual(readTimeline(hash),s);assert.ok(hash.includes('mode=explore'));});
test('invalid ranges fall back and out of range moments are constrained',()=>{assert.equal(readTimeline('#from=0&to=3').start,-400);assert.equal(readTimeline('#from=-336&to=-323&moment=1900').moment,-323);});
test('period filtering includes intervals and only in-range dated events',()=>{assert.ok(overlaps({startYear:-403,endYear:-221},-336,-323));assert.ok(!overlaps({date:{year:329,era:'BCE'}},-328,-323));});
