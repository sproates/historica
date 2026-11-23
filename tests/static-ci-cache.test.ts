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

test('CI restores only for site work and publishes verified caches only from main pushes',()=>{
 const workflow=YAML.parse(fs.readFileSync('.github/workflows/verify.yml','utf8'));
 const steps=workflow.jobs.verify.steps;
 const restore=steps.find(s=>s.uses?.startsWith('actions/cache/restore@'));
 const save=steps.find(s=>s.uses?.startsWith('actions/cache/save@'));
 assert.match(restore.uses,/@[a-f0-9]{40}$/);
 assert.equal(restore.if,"steps.plan.outputs.mode == 'full'");
 assert.match(save.if,/success\(\)/);assert.match(save.if,/github.event_name == 'push'/);assert.match(save.if,/github.ref == 'refs\/heads\/main'/);
 assert.equal(save.with.path,'release/static-incremental/');
 const verify=steps.find(s=>s.name==='Generate and verify the site');
 const scripts=JSON.parse(fs.readFileSync('package.json')).scripts;
 assert.ok(scripts.test.startsWith('npm run build:web'));
 assert.ok(scripts['build:web'].includes('node scripts/verify-static-incremental.ts'));
 assert.ok(scripts['build:web'].indexOf('verify-static-incremental.ts')<scripts['build:web'].indexOf('export-static-web.ts'));
 assert.ok(verify.run.includes('npm test'));
 assert.equal(verify.if,"steps.plan.outputs.mode == 'full'");
 assert.equal(steps.find(s=>s.name==='Install locked build tools').if,verify.if);
 assert.equal(steps.find(s=>s.name==='Prepare production release').if,verify.if);
 assert.ok(steps.find(s=>s.id==='reuse').if.includes("refs/heads/main"));
 assert.ok(steps.find(s=>s.id==='baseline').if.includes("scope == 'sharing'"));
 assert.ok(steps.find(s=>s.name==='Bundle the verified PR output').run.includes('static-incremental'));
 assert.ok(steps.indexOf(save)>steps.indexOf(verify));
 assert.ok(steps.indexOf(restore)<steps.indexOf(verify));
});
