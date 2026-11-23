import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyPages} from './verify-pages.ts';
interface Run {id:number;conclusion:string;event:string;path:string;head_branch:string;head_sha:string}
interface Artifact {name:string;expired:boolean;workflow_run:{id:number}}
const repository='sproates/historica';
export function eligibleArtifact(artifact:Artifact,run:Run,name:string,mode:'tree'|'base',base?:string,testedTree?:string){
 return artifact.name===name&&!artifact.expired&&artifact.workflow_run.id===run.id&&run.conclusion==='success'&&run.path==='.github/workflows/verify.yml'&&
  (mode==='tree'?run.event==='pull_request'&&testedTree===base:run.event==='push'&&run.head_branch==='main'&&run.head_sha===base);
}
/** Only a successful run with the exact source tree (or exact baseline commit) can be reused. */
export function restoreVerified(mode:'tree'|'base',key:string,output='release/production-site'){
 if(!/^[a-f0-9]{40}$/.test(key))return false;
 const name=mode==='tree'?`historica-verified-${key}`:`historica-production-${key}`;
 const api=(endpoint:string)=>JSON.parse(execFileSync('gh',['api',`repos/${repository}/${endpoint}`],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 try{
  const artifacts:Artifact[]=api(`actions/artifacts?name=${name}&per_page=100`).artifacts;
  for(const artifact of artifacts){
   if(artifact.expired)continue;
   const run:Run=api(`actions/runs/${artifact.workflow_run.id}`);
   const testedTree=mode==='tree'?api(`git/commits/${run.head_sha}`).tree.sha:undefined;
   if(!eligibleArtifact(artifact,run,name,mode,key,testedTree))continue;
   const download='release/restored-artifact';
   fs.rmSync(download,{recursive:true,force:true});
   execFileSync('gh',['run','download',String(run.id),'--repo',repository,'--name',name,'--dir',download],{stdio:'pipe'});
   const archive=path.join(download,'site.tar.zst');
   if(fs.existsSync(archive)){
    execFileSync('python3',['scripts/unpack-release.py',archive,download],{stdio:'pipe'});
    fs.unlinkSync(archive);
   }
   fs.rmSync(output,{recursive:true,force:true});
   const nested=path.join(download,'production-site');
   fs.renameSync(fs.existsSync(nested)?nested:download,output);
   verifyPages(output);
   const manifest=JSON.parse(fs.readFileSync(path.join(output,'release-manifest.json'),'utf8'));
   if(!manifest.production||manifest.base!=='/'||!manifest.analytics)throw Error('Not a production package');
   const token=process.env.HISTORICA_ANALYTICS_TOKEN;
   if(!token||!fs.readFileSync(path.join(output,'index.html'),'utf8').includes(`<meta name="historica-analytics" content="${token}">`))throw Error('Analytics configuration changed');
   if(fs.existsSync(path.join(download,'static-incremental'))){
    fs.rmSync('release/static-incremental',{recursive:true,force:true});
    fs.renameSync(path.join(download,'static-incremental'),'release/static-incremental');
   }
   fs.rmSync(download,{recursive:true,force:true});
   console.log(`Reused verified ${mode==='tree'?'PR package':'baseline'} from run ${run.id}.`);
   return true;
  }
 }catch(error){console.log(`Verified package unavailable: ${error instanceof Error?error.message:String(error)}`);}
 fs.rmSync(output,{recursive:true,force:true});
 return false;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];if(mode!=='tree'&&mode!=='base')throw Error('Expected tree or base');
 const restored=restoreVerified(mode,process.argv[3]??'');
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`restored=${restored}\n`);
 console.log(restored?'Verified files restored.':'No eligible package; full verification is required.');
}
