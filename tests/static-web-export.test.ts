import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {exportStaticWeb} from '../scripts/export-static-web.ts';
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-web-export-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const source=path.join(root,'static'),output=path.join(root,'web');
 const write=(dir,file,text)=>{fs.mkdirSync(path.dirname(path.join(dir,file)),{recursive:true});fs.writeFileSync(path.join(dir,file),text);};
 write(output,'data/routes.json','["/person/example"]');
 for(const [file,marker] of [['index.html','data-static-page="home"'],['about/index.html','data-static-page="about"'],['coverage/index.html','data-static-page="coverage"'],['privacy/index.html','data-static-page="privacy"'],['person/example/index.html','data-static-history="example"']])write(source,file,`<head><meta name="robots" content="noindex, follow"></head><body ${marker}>Readable page</body>`);
 write(output,'pages/retired.html','old');write(output,'pages/keep.txt','keep');write(output,'index.html','old home');write(output,'focus.html','runtime fallback');
 return {source,output};
}
test('Astro export supplies compatibility addresses, preserves assets and prunes retired pages',t=>{
 const options=fixture(t);
 assert.deepEqual(exportStaticWeb(options),{pages:5});
 for(const file of ['index.html','about.html','coverage.html','privacy.html','pages/example.html']){
  const html=fs.readFileSync(path.join(options.output,file),'utf8');
  assert.ok(html.includes('Readable page'));assert.ok(html.includes('content="index, follow"'));
 }
 assert.ok(fs.readFileSync(path.join(options.source,'index.html'),'utf8').includes('noindex'));
 assert.equal(fs.existsSync(path.join(options.output,'pages/retired.html')),false);
 assert.equal(fs.readFileSync(path.join(options.output,'pages/keep.txt'),'utf8'),'keep');
 assert.equal(fs.readFileSync(path.join(options.output,'focus.html'),'utf8'),'runtime fallback');
});
test('incomplete or incorrect Astro input cannot replace the current pages',t=>{
 const options=fixture(t),history=path.join(options.source,'person/example/index.html');
 fs.writeFileSync(history,'wrong page');
 assert.throws(()=>exportStaticWeb(options),/Missing static page marker/);
 assert.equal(fs.readFileSync(path.join(options.output,'index.html'),'utf8'),'old home');
 assert.ok(fs.existsSync(path.join(options.output,'pages/retired.html')));
 fs.rmSync(history);assert.throws(()=>exportStaticWeb(options),/ENOENT/);
 assert.equal(fs.readFileSync(path.join(options.output,'index.html'),'utf8'),'old home');
});
test('export rejects overlapping directories and unsafe routes',t=>{
 const options=fixture(t);
 assert.throws(()=>exportStaticWeb({source:options.output,output:options.output}),/separate/);
 fs.writeFileSync(path.join(options.output,'data/routes.json'),'["/person/../escape"]');
 assert.throws(()=>exportStaticWeb(options),/Unsafe route/);
});
