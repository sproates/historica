import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const internalFiles=new Set(['AGENTS.md','README.md','RELEASE.md','PLAN.md','PROTOTYPE-MILESTONE.md','SUSTAINABILITY-PLAN.md']);
export function changeScope(files: string[]){
  return files.length>0 && files.every(file=>internalFiles.has(file)||/^project\/.*\.md$/.test(file))?'docs':'site';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [base,head='HEAD']=process.argv.slice(2);
  let files: string[]=[];
  try {if(base&&!/^0+$/.test(base))files=execFileSync('git',['diff','--name-only','-z',base,head],{encoding:'utf8'}).split('\0').filter(Boolean);} catch { /* Unknown comparison must run site checks. */ }
  const scope=changeScope(files);
  console.log(`${scope}: ${files.length} changed paths`);
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`scope=${scope}\n`);
}
