import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

/** Check the actual portable artifact, independently of source templates or the preview server. */
export function verifyPages(output='release/pages-site'){
 const root=path.resolve(output),read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const manifest=JSON.parse(read('release-manifest.json'));
 assert.equal(manifest.renderer,'astro','Expected the Astro artifact');
 assert.match(manifest.base,/^\/(?:[a-zA-Z0-9_-]+\/)*$/);
 const files=new Set();
 for(const entry of manifest.files){
  assert.ok(!path.isAbsolute(entry.path)&&!entry.path.split(/[\\/]/).includes('..'),'Unsafe manifest path');
  assert.ok(!files.has(entry.path),'Duplicate manifest path');files.add(entry.path);
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,entry.path))).digest('hex'),entry.sha256,entry.path+' checksum');
 }
 const actual=fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(entry=>entry.isFile()).map(entry=>path.relative(root,path.join(entry.parentPath,entry.name))).filter(file=>file!=='release-manifest.json');
 assert.deepEqual([...actual].sort(),[...files].sort(),'Artifact inventory differs from manifest');
 const routes=JSON.parse(read('data/routes.json'));
 for(const route of routes){
  assert.match(route,/^\/(person|area|state|city|period|event)\/[a-z0-9-]+$/);
  assert.ok(read(route.slice(1)+'/index.html').includes(`data-static-history="${route.split('/').at(-1)}"`),route);
 }
 for(const [file,page] of [['index.html','home'],['about/index.html','about'],['about.html','about'],['coverage.html','coverage']])assert.ok(read(file).includes(`data-static-page="${page}"`),file);
 let links=0;
 for(const file of files){
  if(!file.endsWith('.html'))continue;
  const html=read(file);
  assert.ok(html.includes(`<base href="${manifest.base}">`),file+' mount');
  if(!manifest.production)assert.match(html,/<meta name="robots" content="noindex, nofollow">/,file+' indexing');
  for(const [,value] of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
   if(value.startsWith('#'))continue;
   const url=new URL(value.replaceAll('&amp;','&'),'https://artifact.invalid'+manifest.base);
   if(url.origin!=='https://artifact.invalid')continue;
   assert.ok(url.pathname.startsWith(manifest.base),file+' link outside mount: '+value);
   const relative=decodeURIComponent(url.pathname.slice(manifest.base.length)).replace(/\/$/,'');
   assert.ok(files.has(relative)||files.has((relative?relative+'/':'')+'index.html'),file+' missing link: '+value);
   links++;
  }
 }
 assert.ok(files.has('.nojekyll'));assert.ok(!files.has('CNAME'));
 return {routes:routes.length,files:files.size,links};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Verified Astro artifact:',verifyPages(process.argv[2]));
