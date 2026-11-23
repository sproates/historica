import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest,planPages} from '../scripts/lib/static-cache.mjs';
import {createHistoryPage} from '../web/generated/presentation/history-page.js';
import {buildFocusData} from '../web/focus-model.js';
const models=[{id:'a',route:'person/a',model:{title:'A'}},{id:'b',route:'person/b',model:{title:'B'}}];
const baseline=planPages(models,null,'code-v1',()=>null);
for(const value of Object.values(baseline.pages))value.output=digest('verified HTML');
const previous={pages:baseline.pages};

test('unchanged pages are reused only while their verified output remains intact',()=>{
 assert.deepEqual(planPages(models,previous,'code-v1',()=>Buffer.from('verified HTML')).unchanged,['a','b']);
 assert.deepEqual(planPages(models,previous,'code-v1',r=>r==='person/a'?null:'verified HTML').changed,['a']);
 assert.deepEqual(planPages(models,previous,'code-v1',r=>r==='person/b'?'damaged':'verified HTML').changed,['b']);
});

test('shared changes invalidate all routes and model changes invalidate only affected routes',()=>{
 assert.deepEqual(planPages(models,previous,'code-v2',()=> 'verified HTML').changed,['a','b']);
 const changed=structuredClone(models);changed[0].model.title='New A';
 assert.deepEqual(planPages(changed,previous,'code-v1',()=> 'verified HTML').changed,['a']);
 assert.deepEqual(planPages(models.slice(1),previous,'code-v1',()=> 'verified HTML').removed,['person/a']);
 const added=[...models,{id:'c',route:'event/c',model:{title:'C'}}];
 assert.deepEqual(planPages(added,previous,'code-v1',()=> 'verified HTML').changed,['c']);
});

test('history dependencies include nearby comparisons and connections, but exclude unrelated pages',()=>{
 const read=name=>JSON.parse(fs.readFileSync(`web/data/${name}.json`,'utf8'));
 const data=buildFocusData(read('collection'),read('reviewed-exploration')),evidence=read('reviewed-evidence');
 const ids=['socrates','alcibiades','alexander'];
 const pages=dataset=>ids.map(id=>({id,route:`person/${id}`,model:createHistoryPage(dataset,id,evidence,{features:[]})}));
 const initial=planPages(pages(data),null,'code',()=>null);
 for(const entry of Object.values(initial.pages))entry.output=digest('HTML');
 const edited=structuredClone(data);edited.entities.find(e=>e.id==='socrates').title='Socrates revised';
 const plan=planPages(pages(edited),initial,'code',()=> 'HTML');
 assert.deepEqual(plan.changed,['socrates','alcibiades']);
 assert.deepEqual(plan.unchanged,['alexander']);
 assert.ok(!('data' in pages(data)[0].model),'templates cannot access untracked collection data');
});
