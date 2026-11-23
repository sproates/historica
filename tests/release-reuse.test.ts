import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {changeScope} from '../scripts/change-scope.ts';
import {eligibleArtifact} from '../scripts/restore-verified.ts';
import {checkSharePng,updateSharingPackage} from '../scripts/update-sharing-package.ts';

test('artwork and URL-only metadata changes use focused checks; code or layout changes cannot',()=>{
 const files=['web/share-historica-new.png','scripts/build-share-image.swift','src/presentation/metadata.ts','web/focus.html','tests/metadata.test.ts','README.md'];
 const read=(file:string,revision:string)=>revision==='base'?"image='share-historica.png'":"image='share-historica-new.png'";
 assert.equal(changeScope(files,read),'sharing');
 assert.equal(changeScope(files,()=>{throw Error('Missing revision');}),'site');
 assert.equal(changeScope(files,(file,revision)=>read(file,revision)+(revision==='head'?' changed logic':'')),'site');
 assert.equal(changeScope([...files,'src/browser/explorer.ts'],read),'site');
 assert.equal(changeScope(['web/share-historica-new.png']),'sharing');
 assert.equal(changeScope(['README.md','project/notes.md']),'docs');
 assert.equal(changeScope(['CONTRIBUTION.md','CONTRIBUTORS.md','content/README.md','research/evidence/FORMAT.md','project/adding-facts.md']),'docs');
 assert.equal(changeScope(['CONTRIBUTION.md','content/histories/socrates.md']),'site');
 assert.equal(changeScope(['research/evidence/FORMAT.md','research/evidence/socrates-reviewed.json']),'site');
 assert.equal(changeScope([]),'site');
});
test('reusing a PR requires a successful verification of the same source tree',()=>{
 const tree='a'.repeat(40),name='historica-verified-'+tree;
 const artifact={name,expired:false,workflow_run:{id:42}};
 const run={id:42,conclusion:'success',event:'pull_request',path:'.github/workflows/verify.yml',head_branch:'feature/example',head_sha:'b'.repeat(40)};
 assert.equal(eligibleArtifact(artifact,run,name,'tree',tree,tree),true);
 for(const changed of [{conclusion:'failure'},{conclusion:''},{path:'.github/workflows/other.yml'},{event:'workflow_dispatch'},{id:43}])assert.equal(eligibleArtifact(artifact,{...run,...changed},name,'tree',tree,tree),false);
 assert.equal(eligibleArtifact({...artifact,expired:true},run,name,'tree',tree,tree),false);
 assert.equal(eligibleArtifact(artifact,run,name,'tree',tree,'c'.repeat(40)),false);
 assert.equal(eligibleArtifact(artifact,run,name,'tree',tree),false);
 const baseline={...run,event:'push',head_branch:'main'};
 assert.equal(eligibleArtifact(artifact,baseline,name,'base',baseline.head_sha),true);
 assert.equal(eligibleArtifact(artifact,baseline,name,'base','c'.repeat(40)),false);
 assert.equal(eligibleArtifact(artifact,{...baseline,head_branch:'other'},name,'base',baseline.head_sha),false);
});
test('sharing patch changes images and metadata while preserving app, data and page content',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-sharing-')),output=path.join(root,'site'),source=path.join(root,'web'),metadata=path.join(root,'metadata.ts');
 const write=(file:string,data:string|Buffer)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);};
 try{
  const old='share-historica.png',next='share-historica-new.png';
  const png=fs.readFileSync('web/share-historica-chronology.png');checkSharePng(png);
  assert.throws(()=>checkSharePng(png.subarray(0,24)),/1200/);
  const wrong=Buffer.from(png);wrong.writeUInt32BE(1,16);assert.throws(()=>checkSharePng(wrong),/1200/);
  write(metadata,`const image=origin+'/${next}';`);write(path.join(source,next),png);
  const pages={'index.html':'data-static-page="home"','about/index.html':'data-static-page="about"','about.html':'data-static-page="about"','privacy/index.html':'data-static-page="privacy"','privacy.html':'data-static-page="privacy"','coverage.html':'data-static-page="coverage"','person/example/index.html':'data-static-history="example"'};
  for(const [file,marker] of Object.entries(pages))write(path.join(output,file),`<html><head><base href="/"><meta property="og:image" content="https://historica.online/${old}"><meta name="twitter:image" content="https://historica.online/${old}"></head><body ${marker}>Existing history &amp; sources</body></html>`);
  write(path.join(output,'.nojekyll'),'');write(path.join(output,'data/routes.json'),'["/person/example"]');write(path.join(output,'app.js'),'unchanged app');write(path.join(output,old),png);write(path.join(output,'generated/presentation/metadata.js'),`const image='${old}'`);
  const files=fs.readdirSync(output,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.relative(output,path.join(e.parentPath,e.name))).map(name=>({path:name,sha256:createHash('sha256').update(fs.readFileSync(path.join(output,name))).digest('hex')}));
  write(path.join(output,'release-manifest.json'),JSON.stringify({renderer:'astro',base:'/',production:true,files}));
  updateSharingPackage(output,source,metadata);
  assert.equal(fs.readFileSync(path.join(output,'app.js'),'utf8'),'unchanged app');
  assert.equal(fs.readFileSync(path.join(output,'data/routes.json'),'utf8'),'["/person/example"]');
  for(const file of Object.keys(pages)){const html=fs.readFileSync(path.join(output,file),'utf8');assert.ok(html.includes('Existing history &amp; sources'));assert.ok(html.includes(next));assert.ok(!html.includes(old));}
  assert.deepEqual(fs.readFileSync(path.join(output,next)),png);assert.equal(fs.existsSync(path.join(output,old)),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('release extraction rejects escaping paths and links before they can write outside the bundle',async()=>{
 const {spawnSync}=await import('node:child_process');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'historica-archive-'));
 try{
  for(const mode of ['valid','parent','absolute','symlink']){
   const tar=path.join(root,mode+'.tar'),archive=tar+'.zst',destination=path.join(root,mode);
   const make=spawnSync('python3',['-c',`import io,sys,tarfile
mode=sys.argv[2]
with tarfile.open(sys.argv[1],'w') as t:
 m=tarfile.TarInfo({'valid':'production-site/index.html','parent':'../outside','absolute':'/outside','symlink':'link'}[mode])
 if mode=='symlink': m.type=tarfile.SYMTYPE; m.linkname='../outside'; t.addfile(m)
 else: m.size=2; t.addfile(m,io.BytesIO(b'ok'))`,tar,mode],{encoding:'utf8'});
   assert.equal(make.status,0,make.stderr);
   assert.equal(spawnSync('zstd',['-q',tar,'-o',archive]).status,0);
   const unpack=spawnSync('python3',['scripts/unpack-release.py',archive,destination],{encoding:'utf8'});
   if(mode==='valid'){assert.equal(unpack.status,0,unpack.stderr);assert.equal(fs.readFileSync(path.join(destination,'production-site/index.html'),'utf8'),'ok');}
   else assert.notEqual(unpack.status,0,mode);
   assert.equal(fs.existsSync(path.join(root,'outside')),false);
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
