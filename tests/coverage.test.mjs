import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoverage, overview, splitRegion} from '../web/coverage-model.js';
const registry = JSON.parse(fs.readFileSync('research/programme/coverage.json'));
test('registry is complete and the preview matches the research queue',()=>{
 assert.deepEqual(validateCoverage(registry),[]);
 assert.deepEqual(JSON.parse(fs.readFileSync('web/data/coverage.json')),registry);
 assert.equal(overview(registry).originalTotal,364);
});
const unresearched = structuredClone(registry);
for (const p of unresearched.packages) p.workflow='unresearched';
const children = [{id:'britain',name:'Britain',extent:'The island of Great Britain.'},{id:'ireland',name:'Ireland',extent:'The island of Ireland.'}];
test('splits preserve parent history and cannot manufacture completed coverage',()=>{
 const next=splitRegion(unresearched,'britain-ireland',children);
 assert.equal(overview(next).active.length,377);
 assert.equal(overview(next).originalTotal,364);
 assert.equal(overview(next).completeOriginal,0);
 assert.equal(next.queueRevision,2);
 const first=next.packages.find(p=>p.regionId==='britain');
 first.workflow='accepted';first.evidenceStatus='limited';first.accountIds=['reviewed-account'];
 assert.equal(overview(next).limited,1);
 assert.equal(overview(next).completeOriginal,0);
 const second=next.packages.find(p=>p.regionId==='ireland'&&p.windowId===first.windowId);
 second.workflow='accepted';second.evidenceStatus='substantive';second.accountIds=['another-account'];
 assert.equal(overview(next).completeOriginal,1);
 assert.equal(registry.regions.find(r=>r.id==='britain-ireland').subregions.length,0);
});
test('invalid splits and unsupported acceptance are rejected',()=>{
 assert.throws(()=>splitRegion(unresearched,'britain-ireland',[children[0],children[0]]));
 const broken=structuredClone(registry);broken.packages[0].workflow='accepted';
 assert.ok(validateCoverage(broken).some(e=>e.includes('Acceptance')));
 assert.throws(()=>splitRegion(broken,'egypt',children),/migration/);
 const missing=structuredClone(registry);missing.packages.pop();assert.ok(validateCoverage(missing).some(e=>e.includes('Missing package')));
});
test('research drafts remain outside the accepted data build',async()=>{
 const {validateEvidence}=await import('../scripts/lib/evidence.js');
 const batch=JSON.parse(fs.readFileSync('research/batches/britain-ireland-500-251.json'));
 assert.deepEqual(validateEvidence(batch),[]);
 assert.ok(validateEvidence(batch,{release:true}).length>0);
 assert.equal(batch.claims.length,13);
 assert.deepEqual(JSON.parse(fs.readFileSync('web/data/coverage-research.json')),[batch]);
 const accepted=JSON.parse(fs.readFileSync('web/data/reviewed-evidence.json'));
 assert.ok(batch.claims.every(c=>!accepted.claims.some(a=>a.id===c.id)));
 assert.equal(registry.packages.find(p=>p.id===batch.batch.packageId).workflow,'checking');
});
