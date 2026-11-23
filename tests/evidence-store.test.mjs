import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createEvidenceStore} from '../web/generated/content/evidence-store.js';
import {evidenceForFocus,browserChronology} from '../web/generated/content/browser-evidence.js';
import {createHistoryPage} from '../web/generated/presentation/history-page.js';
import {ageAt} from '../web/generated/domain/exploration.js';
import {buildFocusData} from '../web/focus-model.js';
const read=name=>JSON.parse(fs.readFileSync(`web/data/${name}.json`,'utf8'));
const full=read('reviewed-evidence'),data=buildFocusData(read('collection'),read('reviewed-exploration'));
const empty={claims:[],sources:[],evidence:[]};

test('per-history downloads retain exactly the focused statements and citations',()=>{
 assert.equal(fs.readdirSync('web/data/evidence').filter(f=>f.endsWith('.json')).length,data.entities.length);
 for(const entity of data.entities){
  const pack=read(`evidence/${entity.id}`);
  assert.deepEqual(pack,evidenceForFocus(full,entity),entity.id);
  assert.deepEqual(createHistoryPage(data,entity.id,pack,{features:[]}).checked,createHistoryPage(data,entity.id,full,{features:[]}).checked,entity.id);
  assert.deepEqual(pack.claims.map(c=>c.id),full.claims.filter(c=>c.subjectId===entity.id||entity.claimIds?.includes(c.id)).map(c=>c.id));
 }
});

test('shared chronology preserves all age estimates without unrelated source records',()=>{
 const chronology=read('browser-chronology');
 assert.deepEqual(chronology,browserChronology(full));
 assert.ok(fs.statSync('web/data/browser-chronology.json').size<10000);
 for(const entity of data.entities.filter(e=>e.type==='person'))for(let y=entity.startYear;y<=entity.endYear;y++)if(y!==0)assert.equal(ageAt(entity,y,chronology),ageAt(entity,y,full),entity.id);
});

test('evidence requests share in-flight work, cache success and retry failures',async()=>{
 let calls=0,fail=true;
 const store=createEvidenceStore(async url=>{calls++;assert.equal(url,'data/evidence/socrates.json');if(fail)throw Error('offline');return empty;});
 await assert.rejects(store.get('socrates'));fail=false;
 const first=store.get('socrates');assert.equal(store.get('socrates'),first);await first;
 await store.get('socrates');assert.equal(calls,2);
});

test('only the latest selected history can commit, including a cached Back destination',async()=>{
 const pending=new Map(),applied=[],failures=[];
 const store=createEvidenceStore(url=>new Promise((resolve,reject)=>pending.set(url,{resolve,reject})));
 const a=store.select('alexander',()=>applied.push('alexander'),()=>failures.push('a'));
 const b=store.select('socrates',()=>applied.push('socrates'),()=>failures.push('b'));
 pending.get('data/evidence/socrates.json').resolve(empty);await b;
 pending.get('data/evidence/alexander.json').resolve(empty);assert.equal(await a,false);
 assert.deepEqual(applied,['socrates']);
 const c=store.select('egypt',()=>applied.push('egypt'),()=>failures.push('c'));
 await store.select('socrates',()=>applied.push('back'),()=>failures.push('back'));
 pending.get('data/evidence/egypt.json').reject(Error('offline'));await c;
 assert.deepEqual(applied,['socrates','back']);assert.deepEqual(failures,[]);
});
