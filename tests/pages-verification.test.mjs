import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyPages} from '../scripts/verify-pages.mjs';

function fixture(t,base='/historica/'){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-artifact-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const files={
  '.nojekyll':'', 'data/routes.json':'["/person/example"]', 'style.css':'body{}',
  'index.html':'data-static-page="home"', 'about/index.html':'data-static-page="about"',
  'about.html':'data-static-page="about"', 'coverage.html':'data-static-page="coverage"',
  'person/example/index.html':'data-static-history="example"'
 };
 for(const [file,content] of Object.entries(files)){
  fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
  fs.writeFileSync(path.join(root,file),file.endsWith('.html')?`<base href="${base}"><meta name="robots" content="noindex, nofollow"><link href="style.css"><main ${content}><a href="${base}person/example">Example</a><a href="https://example.com">Source</a></main>`:content);
 }
 const refresh=()=>fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify({renderer:'astro',base,production:false,files:Object.keys(files).map(file=>({path:file,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}))}));
 refresh();
 return {root,refresh,change:(file,from,to)=>fs.writeFileSync(path.join(root,file),fs.readFileSync(path.join(root,file),'utf8').replace(from,to))};
}

test('portable Astro artifact resolves root and repository-mounted links',t=>{
 for(const base of ['/','/historica/']){
  const {root}=fixture(t,base);
  assert.deepEqual(verifyPages(root),{routes:1,files:8,links:15});
 }
});
test('changed, missing and unexpected files fail final package verification',t=>{
 const {root,refresh}=fixture(t);
 fs.appendFileSync(path.join(root,'style.css'),'changed');
 assert.throws(()=>verifyPages(root),/checksum/);
 refresh();fs.writeFileSync(path.join(root,'extra.txt'),'unexpected');
 assert.throws(()=>verifyPages(root),/inventory/);
 fs.rmSync(path.join(root,'extra.txt'));fs.rmSync(path.join(root,'style.css'));
 assert.throws(()=>verifyPages(root),/ENOENT/);
});
test('checksummed HTML still fails for broken links, wrong pages or mount escapes',t=>{
 const {root,refresh,change}=fixture(t);
 change('index.html','style.css','missing.css');refresh();
 assert.throws(()=>verifyPages(root),/missing link/);
 change('index.html','missing.css','/style.css');refresh();
 assert.throws(()=>verifyPages(root),/outside mount/);
 change('index.html','/style.css','style.css');
 change('person/example/index.html','data-static-history="example"','data-static-history="wrong"');refresh();
 assert.throws(()=>verifyPages(root),/person\/example/);
});
test('staging pages must remain excluded from indexing',t=>{
 const {root,refresh,change}=fixture(t);
 change('about.html','noindex, nofollow','index, follow');refresh();
 assert.throws(()=>verifyPages(root),/indexing/);
});
