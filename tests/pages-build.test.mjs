import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildPages} from '../scripts/build-pages.mjs';
import {changeScope} from '../scripts/change-scope.mjs';
import {sitePath,unmountPath} from '../web/site-path.js';

test('Pages build serves every current route without Apache and confines staging links to its mount',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-pages-')),output=path.join(root,'site');
 try {
  buildPages({output,base:'/historica/'});
  const routes=JSON.parse(fs.readFileSync('web/data/routes.json'));
  for(const route of routes){
   const html=fs.readFileSync(path.join(output,route,'index.html'),'utf8');
   assert.match(html,/<h1 id="focus-title">[^<]+<\/h1>/);
   assert.match(html,/<base href="\/historica\/">/);
   assert.match(html,/content="noindex, nofollow"/);
   for(const [,link] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g))assert.ok(link.startsWith('/historica/'),link);
  }
  assert.ok(fs.existsSync(path.join(output,'about/index.html')));
  assert.ok(fs.existsSync(path.join(output,'404.html')));
  assert.ok(!fs.existsSync(path.join(output,'.htaccess')));
  assert.ok(!fs.existsSync(path.join(output,'CNAME')));
  fs.writeFileSync(path.join(output,'stale.html'),'old');
  buildPages({output,production:true});
  assert.ok(!fs.existsSync(path.join(output,'stale.html')));
  assert.match(fs.readFileSync(path.join(output,'person/alexander/index.html'),'utf8'),/content="index, follow/);
  assert.match(fs.readFileSync(path.join(output,'robots.txt'),'utf8'),/Sitemap:/);
  assert.throws(()=>buildPages({output,base:'../'}));
  assert.throws(()=>buildPages({output:'web'}));
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test('internal documentation is the only shortcut; content and unknown changes run site checks',()=>{
 assert.equal(changeScope(['project/roadmap.md','README.md']),'docs');
 for(const files of [[],['content/people/alexander.md'],['research/sources/a.md'],['README.md','web/home.js'],['.github/workflows/verify.yml']])assert.equal(changeScope(files),'site');
});
test('mounted paths keep root deployment and GitHub project deployment consistent',()=>{
 assert.equal(sitePath('/person/socrates','/historica/'),'/historica/person/socrates');
 assert.equal(unmountPath('/historica/person/socrates/','/historica/'),'/person/socrates/');
 assert.equal(sitePath('/about','/'),'/about');
});

test('Astro packaging includes static histories and shared assets, with no legacy route copies',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-static-package-'));
 const output=path.join(root,'site'),staticSource=path.join(root,'astro');
 const routes=JSON.parse(fs.readFileSync('web/data/routes.json'));
 try{
  for(const route of routes){
   const target=path.join(staticSource,route,'index.html');
   fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,`<html><head><base href="/"><meta name="robots" content="noindex, follow"></head><body data-static-history="${route.split('/').at(-1)}"><a href="/person/socrates">Socrates</a><script src="focus-app.js"></script></body></html>`);
  }
  buildPages({output,staticSource,base:'/historica/'});
  for(const route of routes){
   const html=fs.readFileSync(path.join(output,route,'index.html'),'utf8');
   assert.match(html,/data-static-history=/);
   assert.match(html,/<base href="\/historica\/">/);
   assert.match(html,/href="\/historica\/person\/socrates"/);
   assert.match(html,/content="noindex, nofollow"/);
  }
  for(const file of ['index.html','about/index.html','coverage.html','focus-app.js','generated/browser/explorer.js','data/browser-chronology.json','data/evidence/socrates.json','focus.css','404.html','.nojekyll'])assert.ok(fs.existsSync(path.join(output,file)),file);
  assert.ok(!fs.existsSync(path.join(output,'pages')));
  const manifest=JSON.parse(fs.readFileSync(path.join(output,'release-manifest.json')));
  assert.equal(manifest.renderer,'astro');
  assert.equal(manifest.files.filter(f=>/^(person|area|state|city|period|event)\/.+\/index.html$/.test(f.path)).length,routes.length);
  buildPages({output,staticSource,production:true});
  assert.match(fs.readFileSync(path.join(output,'person/socrates/index.html'),'utf8'),/content="index, follow"/);
  assert.throws(()=>buildPages({output:staticSource,staticSource}),/separate/);
  fs.rmSync(path.join(staticSource,'person/socrates/index.html'));
  assert.throws(()=>buildPages({output,staticSource}),/ENOENT/);
  assert.ok(fs.existsSync(path.join(output,'person/socrates/index.html')),'incomplete input leaves the previous package intact');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
