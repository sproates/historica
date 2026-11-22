import fs from 'node:fs';
import {buildFocusData} from '../web/focus-model.js';
import {validateEvidence} from './lib/evidence.js';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const packs=['socrates','britain-ireland','global-overview','world-lifeways','ancient-connections','egypt-expansion','stonehenge','early-world','caesar-era','alcibiades-era','maurya-era','qin-han-era','connected-lives'].map(name=>read(`research/evidence/${name}-reviewed.json`));
const pack={schemaVersion:'1.0'};
for(const key of ['entities','sources','claims','evidence','reviews','accounts']) pack[key]=packs.flatMap(p=>p[key]);
const adapters=['connected-browsing','britain-ireland','global-overview','world-lifeways','ancient-connections','egypt-expansion','stonehenge','early-world','caesar-era','alcibiades-era','maurya-era','qin-han-era','connected-lives'].map(name=>read(`research/evidence/${name}-exploration.json`));
const exploration=Object.fromEntries(['entities','associations','relationships'].map(key=>[key,adapters.flatMap(a=>a[key])]));
const errors=validateEvidence(pack,{release:true});
const claims=new Map(pack.claims.map(c=>[c.id,c]));
const ids=new Set(buildFocusData(read('web/data/collection.json'),exploration).entities.map(e=>e.id));
for(const e of exploration.entities){
 if(!pack.entities.some(x=>x.id===e.id)) errors.push(`Unknown exploration entity: ${e.id}`);
 if(e.type!=='area'&&!e.claimIds.length) errors.push(`Missing exploration evidence: ${e.id}`);
 for(const id of e.claimIds) if(!claims.has(id)) errors.push(`Unknown exploration claim: ${id}`);
 if(e.point&&!e.claimIds.some(id=>claims.get(id)?.value.type==='point'&&JSON.stringify(claims.get(id).value.coordinates)===JSON.stringify(e.point))) errors.push(`Unverified point: ${e.id}`);
}
for(const r of exploration.relationships) if(!ids.has(r.a)||!ids.has(r.b)) errors.push('Unknown exploration relationship');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{
 fs.writeFileSync('web/data/reviewed-evidence.json',JSON.stringify(pack,null,2)+'\n');
 fs.writeFileSync('web/data/reviewed-exploration.json',JSON.stringify(exploration,null,2)+'\n');
 console.log(`Built ${pack.claims.length} reviewed statements and ${exploration.entities.length} exploration entries.`);
}
