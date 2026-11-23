import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {pagesNeedingChecks} from './lib/static-cache.ts';
const output='release/static-incremental',stamp=output+'/verified-tests.json';
const run=(args: string[],env: NodeJS.ProcessEnv={})=>{
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});
 if(result.status!==0)throw new Error('Static verification failed');
};
run(['scripts/build-static-incremental.ts']);
const manifest=JSON.parse(fs.readFileSync(output+'/manifest.json','utf8'));
let verified;try{verified=JSON.parse(fs.readFileSync(stamp,'utf8'));}catch{}
const selected=pagesNeedingChecks(manifest,verified);
if(selected.length){
 const selection=output+'/test-selection.json';fs.writeFileSync(selection,JSON.stringify(selected));
 const files=fs.readdirSync('tests/static').filter(f=>f.endsWith('.test.ts')).sort().map(f=>'tests/static/'+f);
 run(['--test',...files],{HISTORICA_STATIC_TEST_OUTPUT:path.resolve(output),HISTORICA_STATIC_TEST_SELECTION:path.resolve(selection)});
}
// Only a successful suite may mark the current fingerprints as verified.
fs.writeFileSync(stamp+'.tmp',JSON.stringify({shared:manifest.shared,pages:manifest.pages})+'\n');
fs.renameSync(stamp+'.tmp',stamp);
const summary=`Static tests: ${selected.length} affected pages checked; ${Object.keys(manifest.pages).length-selected.length} previously verified pages reused.`;
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
