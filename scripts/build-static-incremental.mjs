import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {historyEntities,historyPage,dates} from './static/history-page.mjs';
import {digest,planPages} from './lib/static-cache.mjs';
const output='release/static-incremental',manifest=output+'/manifest.json';
const walk=root=>fs.statSync(root).isDirectory()?fs.readdirSync(root).sort().flatMap(name=>walk(path.join(root,name))):[root];
const files=['src','scripts/static','scripts/lib/static-cache.mjs','scripts/build-static-incremental.mjs','scripts/build-client.mjs','scripts/verify-static-incremental.mjs','tests/static','astro.config.mjs','package.json','package-lock.json','tsconfig.json','tsconfig.astro.json','web/focus.html','web/focus.css','web/branding.css',...fs.readdirSync('web').filter(f=>f.endsWith('.js')).map(f=>'web/'+f)].flatMap(walk);
const shared=digest([process.version,...files.map(file=>[file,digest(fs.readFileSync(file))]),digest(fs.readFileSync('web/data/ne_50m_admin_0_countries.json'))]);
let previous;try{previous=JSON.parse(fs.readFileSync(manifest,'utf8'));}catch{}
if(previous?.version!==1)previous=undefined;
const models=historyEntities().map(e=>({id:e.id,route:`${e.type}/${e.id}`,model:historyPage(e.id,{geography:false})}));
const htmlPath=(dir,route)=>path.join(dir,route,'index.html');
const plan=planPages(models,previous,shared,route=>{try{return fs.readFileSync(htmlPath(output,route));}catch{return null;}});
const run=(cmd,args,env={})=>{const result=spawnSync(cmd,args,{stdio:'inherit',env:{...process.env,...env}});if(result.status!==0)throw new Error(`${cmd} failed`);};
fs.mkdirSync('release',{recursive:true});
const work=fs.mkdtempSync('release/static-work-');
try{
 if(plan.changed.length){
  if(previous?.shared!==shared)run('npm',['run','check:static']);
  const selection=path.resolve(work,'selection.json');fs.writeFileSync(selection,JSON.stringify(plan.changed));
  const built=path.resolve(work,'pages');
  const bin=JSON.parse(fs.readFileSync('node_modules/astro/package.json')).bin.astro;
  run(process.execPath,[path.join('node_modules/astro',bin),'build'],{HISTORICA_STATIC_SELECTION:selection,HISTORICA_STATIC_OUTPUT:built});
  const required=[...fs.readFileSync('web/focus.html','utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  // Verify the staged pages before changing the last successful output or manifest.
  for(const entry of models.filter(e=>plan.changed.includes(e.id))){
   const html=fs.readFileSync(htmlPath(built,entry.route),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
   assert.equal(new Set(ids).size,ids.length,entry.route+' duplicate IDs');
   assert.deepEqual(new Set(ids),new Set(required),entry.route+' controller hooks');
   assert.ok(html.includes(`data-static-history="${entry.id}"`),entry.route);
   assert.ok(html.includes(`href="https://historica.online/${entry.route}"`),entry.route);
   assert.ok(html.includes(dates(entry.model.state.start,entry.model.state.end)),entry.route);
   assert.ok(!/(?:NaN|Infinity)(?:%|px)/.test(html),entry.route);
   for(const statement of entry.model.checked)for(const source of statement.citations)assert.ok(html.includes(source.url.replaceAll('&','&amp;')),entry.route+' source');
  }
  for(const entry of models.filter(e=>plan.changed.includes(e.id))){
   const target=htmlPath(output,entry.route);fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.copyFileSync(htmlPath(built,entry.route),target);
  }
 }
 for(const route of plan.removed){
  if(!/^(person|area|state|city|period|event)\/[a-z0-9-]+$/.test(route))throw new Error('Invalid cached route');
  fs.rmSync(path.join(output,route),{recursive:true,force:true});
 }
 for(const [route,page] of Object.entries(plan.pages))page.output=digest(fs.readFileSync(htmlPath(output,route)));
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(manifest+'.tmp',JSON.stringify({version:1,shared,pages:plan.pages},null,2)+'\n');
 fs.renameSync(manifest+'.tmp',manifest);
 console.log(`Static pages: ${plan.changed.length} built and checked, ${plan.unchanged.length} reused, ${plan.removed.length} removed. Production unchanged.`);
}finally{fs.rmSync(work,{recursive:true,force:true});}
