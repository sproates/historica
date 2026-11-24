import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const internalFiles=new Set(['AGENTS.md','ARCHITECTURE.md','README.md','RELEASE.md','PLAN.md','PROTOTYPE-MILESTONE.md','SUSTAINABILITY-PLAN.md','CONTRIBUTION.md','CONTRIBUTORS.md','content/README.md','research/evidence/FORMAT.md']);
const internal=(file:string)=>internalFiles.has(file)||/^project\/.*\.md$/.test(file);
export const sharingImage=(file:string)=>/^share-historica(?:-[a-z0-9-]+)?\.png$/.test(file);
const imageReferences=(text:string)=>text.replace(/share-historica(?:-[a-z0-9-]+)?\.png/g,'SHARING_IMAGE');
/** Artwork can skip app tests only when executable/template changes are image URLs alone. */
export function changeScope(files:string[],readRevision?:(file:string,revision:'base'|'head')=>string){
 if(files.length>0&&files.every(internal))return 'docs';
 const siteFiles=files.filter(file=>!internal(file));
 if(siteFiles.length>0&&siteFiles.every(file=>{
  if(file.startsWith('web/')&&sharingImage(file.slice(4)))return true;
  if(file==='scripts/build-share-image.swift')return true;
  if(!['src/presentation/metadata.ts','web/focus.html','tests/metadata.test.ts'].includes(file)||!readRevision)return false;
  try{return imageReferences(readRevision(file,'base'))===imageReferences(readRevision(file,'head'));}catch{return false;}
 }))return 'sharing';
 return 'site';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [base,head='HEAD']=process.argv.slice(2);
 let files:string[]=[];
 try{if(base&&!/^0+$/.test(base))files=execFileSync('git',['diff','--name-only','-z',base,head],{encoding:'utf8'}).split('\0').filter(Boolean);}catch{}
 const scope=changeScope(files,(file,revision)=>execFileSync('git',['show',`${revision==='base'?base:head}:${file}`],{encoding:'utf8'}));
 const tree=execFileSync('git',['rev-parse',`${head}^{tree}`],{encoding:'utf8'}).trim();
 console.log(`${scope}: ${files.length} changed paths`);
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`scope=${scope}\ntree=${tree}\n`);
}
