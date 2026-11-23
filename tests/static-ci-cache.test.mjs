import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import {pagesNeedingChecks} from '../scripts/lib/static-cache.mjs';
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
 assert.equal(restore.if,"steps.changes.outputs.scope == 'site'");
 assert.match(save.if,/success\(\)/);assert.match(save.if,/github.event_name == 'push'/);assert.match(save.if,/github.ref == 'refs\/heads\/main'/);
 assert.equal(save.with.path,'release/static-incremental/');
 const verify=steps.find(s=>s.name==='Generate and verify the site');
 const scripts=JSON.parse(fs.readFileSync('package.json')).scripts;
 assert.ok(scripts.test.startsWith('npm run build:web'));
 assert.ok(scripts['build:web'].includes('node scripts/verify-static-incremental.mjs'));
 assert.ok(scripts['build:web'].indexOf('verify-static-incremental.mjs')<scripts['build:web'].indexOf('export-static-web.mjs'));
 assert.ok(verify.run.includes('npm test'));
 assert.ok(verify.run.includes('node scripts/build-pages.mjs --static-source release/static-incremental'));
 assert.ok(verify.run.includes('node scripts/verify-pages.mjs'));
 assert.ok(verify.run.indexOf('npm test')<verify.run.indexOf('build-pages.mjs'));
 assert.ok(verify.run.indexOf('build-pages.mjs')<verify.run.indexOf('verify-pages.mjs'));
 assert.ok(steps.indexOf(save)>steps.indexOf(verify));
 assert.ok(steps.indexOf(restore)<steps.indexOf(verify));
});
