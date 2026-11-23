import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('preview refresh prunes retired generated files without touching other preview assets',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-preview-sync-'));
 const home=path.join(root,'home'),project=path.join(root,'project');
 const runtime=path.join(home,'Library/Application Support/Historica/preview');
 const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);};
 try{
  write(path.join(project,'web/privacy.html'),'Privacy');
  write(path.join(project,'scripts/sync-preview.py'),fs.readFileSync('scripts/sync-preview.py'));
  write(path.join(project,'scripts/preview-server.py'),'# server fixture');
  for(const folder of ['pages','generated','data/evidence']){
   write(path.join(project,'web',folder,'current.txt'),'new');
   write(path.join(runtime,'web',folder,'current.txt'),'old');
   write(path.join(runtime,'web',folder,'retired.txt'),'retired');
  }
  write(path.join(runtime,'web/unrelated.txt'),'keep');
  for(const name of ['campaign.html','app.js','focus-app.js','style.css'])write(path.join(runtime,'web',name),'obsolete');
  const run=spawnSync('python3',['-c','import pathlib,runpy,sys; from unittest.mock import patch\nwith patch.object(pathlib.Path,"home",return_value=pathlib.Path(sys.argv[1])): runpy.run_path(sys.argv[2],run_name="__main__")',home,path.join(project,'scripts/sync-preview.py')],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  for(const folder of ['pages','generated','data/evidence']){
   assert.equal(fs.readFileSync(path.join(runtime,'web',folder,'current.txt'),'utf8'),'new');
   assert.equal(fs.existsSync(path.join(runtime,'web',folder,'retired.txt')),false);
  }
  assert.equal(fs.readFileSync(path.join(runtime,'web/unrelated.txt'),'utf8'),'keep');
  for(const name of ['campaign.html','app.js','focus-app.js','style.css'])assert.equal(fs.existsSync(path.join(runtime,'web',name)),false);
  assert.equal(fs.readFileSync(path.join(runtime,'preview-server.py'),'utf8'),'# server fixture');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
