import test from 'node:test';import assert from 'node:assert/strict';
import {ageAt,peopleAt,compareLives,dateMeaning,clampMoment} from '../web/generated/domain/exploration.js';
import {encodeView,decodeView} from '../web/generated/state/view-url.js';
const a={id:'a',title:'A',type:'person',startYear:-10,endYear:10},b={id:'b',title:'B',type:'person',startYear:20,endYear:80},data={entities:[a,b]};
test('year-level ages cross BCE/CE without a year zero and never manufacture ages outside life',()=>{
 assert.equal(ageAt(a,1),'9–10 years');assert.equal(ageAt(a,-10),'0 years');assert.equal(ageAt(a,-11),'Not yet born');assert.equal(ageAt(a,11),'After recorded lifespan');
 assert.equal(ageAt({...a,type:'period'},1),null);
});
test('uncertain birth ranges produce approximate age ranges',()=>{
 const e={...a,claimIds:['a-chronology'],note:'Birth uncertain'};
 const ev={claims:[{id:'a-chronology',validity:{start:{earliest:-12,latest:-10}}}]};
 assert.equal(ageAt(e,1,ev),'About 9–12 years');
});
test('two lives can overlap or be separated without changing their dates',()=>{
 assert.deepEqual(compareLives(a,b),{overlap:false});assert.deepEqual(compareLives(a,{...b,startYear:5}),{overlap:true,start:5,end:10});
 assert.deepEqual(peopleAt([a,b],1),[a]);assert.equal(clampMoment(-12,{start:-10,end:10}),-10);assert.equal(clampMoment(null,{start:-10,end:10}),null);
});
test('date labels distinguish reigns, lives, archaeological snapshots and editorial windows',()=>{
 assert.equal(dateMeaning(a),'Lifespan');assert.equal(dateMeaning({...a,note:'Birth approximate'}),'Approximate lifespan');
 assert.equal(dateMeaning({type:'period',title:'Ashoka’s reign',note:''}),'Reign');
 assert.equal(dateMeaning({type:'period',title:'Laundry',dateLabel:'Archaeological snapshot'}),'Archaeological snapshot');
 assert.equal(dateMeaning({type:'period',title:'Context',note:'Editorial study window'}),'Context window');
});
test('year and two-person selection survive canonical bookmarks; malformed values are rejected',()=>{
 const decoded=decodeView('/person/a?year=1&person=a&person=b',data);
 assert.equal(decoded.view.moment,1);assert.deepEqual(decoded.view.people,['a','b']);assert.equal(encodeView(decoded.state,decoded.view,data),'/person/a/?year=1&person=a&person=b');
 assert.equal(decodeView('/person/a?year=0',data).view.moment,null);
 assert.deepEqual(decodeView('/person/a?person=a&person=a',data).view.people,[]);
 assert.equal(decodeView('/person/a?year=100',data).view.moment,10);
});
