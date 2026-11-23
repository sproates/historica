import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import {pagesNeedingChecks} from '../scripts/lib/static-cache.ts';
const manifest={shared:'code-and-tests-v1',pages:{'person/a':{id:'a',fingerprint:'a1',output:'html-a'},'person/b':{id:'b',fingerprint:'b1',output:'html-b'}}};

test('static tests run on cold caches, changed shared code and unverified page outputs',()=>{
 assert.deepEqual(pagesNeedingChecks(manifest,undefined),['a','b']);
 assert.deepEqual(pagesNeedingChecks(manifest,structuredClone(manifest)),[]);
 const old=structuredClone(manifest);old.shared='old-code';
 assert.deepEqual(pagesNeedingChecks(manifest,old),['a','b']);
 const previous=structuredClone(manifest);previous.pages['person/a'].fingerprint='before-failed-test';
 assert.deepEqual(pagesNeedingChecks(manifest,previous),['a']);
 previous.pages['person/a']=manifest.pages['person/a'];previous.pages['person/b'].output='other-html';
 assert.deepEqual(pagesNeedingChecks(manifest,previous),['b']);
 delete previous.pages['person/a'];assert.deepEqual(pagesNeedingChecks(manifest,previous),['a','b']);
});

test('CI checks PRs once, reuses matching packages on main and retains incremental caches',()=>{
 const steps=YAML.parse(fs.readFileSync('.github/workflows/verify.yml','utf8')).jobs.verify.steps;
 const verify=steps.find(s=>s.name==='Generate and verify the site');
 assert.equal(verify.run,'npm test');
 assert.equal(verify.if,"steps.plan.outputs.mode == 'full'");
 for(const name of ['Install locked build tools','Prepare production release'])assert.equal(steps.find(s=>s.name===name).if,verify.if);
 assert.ok(steps.find(s=>s.id==='reuse').if.includes("refs/heads/main"));
 assert.ok(steps.find(s=>s.id==='baseline').if.includes("restored != 'true'"));
 const bundle=steps.find(s=>s.name==='Compress the verified release and page cache together');
 assert.ok(bundle.run.includes('static-incremental'));assert.ok(bundle.run.includes('--long=27'));
 const retained=steps.find(s=>s.name==='Keep the verified PR package and incremental page cache');
 assert.equal(retained.with.path,'release/retained/site.tar.zst');assert.equal(retained.with['compression-level'],0);
 assert.ok(steps.indexOf(bundle)>steps.indexOf(verify));
 assert.ok(steps.indexOf(steps.find(s=>s.id==='baseline'))<steps.indexOf(verify));
});
