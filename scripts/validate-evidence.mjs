import fs from 'node:fs';
import {validateEvidence} from './lib/evidence.js';
const args=process.argv.slice(2),release=args.includes('--release');
const path=args.find(a=>!a.startsWith('--'))||'research/evidence/pilot.json';
try{
 const pack=JSON.parse(fs.readFileSync(path,'utf8'));
 const errors=validateEvidence(pack,{release});
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log(`${path}: structurally valid (${release?'accepted release':'draft research'}). This does not verify historical truth or source contents.`);
}catch(e){console.error(`Cannot validate ${path}: ${e.message}`);process.exitCode=1;}
