import type {ReviewedEvidence} from '../src/domain/evidence.js';
interface EvidencePack extends ReviewedEvidence {schemaVersion:string; entities:Array<{id:string}>;reviews:unknown[];accounts:unknown[];claims:Array<ReviewedEvidence['claims'][number] & {value?:{type:string;coordinates?:unknown}}>}
import {geometry} from '../web/generated/presentation/history-page.js';
import {createSearchIndex} from '../web/generated/domain/search.js';
import {browserEvidence,evidenceForFocus,browserChronology} from '../web/generated/content/browser-evidence.js';
import fs from 'node:fs';
import {readHistoryPacks,readPrototypeData} from './lib/history-content.ts';
import {parseHistory} from '../web/generated/content/validate-history.js';
import {assembleHistory} from '../web/generated/domain/assemble-history.js';
import {validateEvidence} from './lib/evidence.ts';
const read=(path: string)=>JSON.parse(fs.readFileSync(path,'utf8'));
const packs: EvidencePack[]=['socrates','britain-ireland','global-overview','world-lifeways','ancient-connections','egypt-expansion','stonehenge','early-world','caesar-era','alcibiades-era','maurya-era','qin-han-era','connected-lives','everyday-evidence'].map(name=>read(`research/evidence/${name}-reviewed.json`));
const pack: EvidencePack={schemaVersion:'1.0',entities:packs.flatMap(p=>p.entities),sources:packs.flatMap(p=>p.sources),claims:packs.flatMap(p=>p.claims),evidence:packs.flatMap(p=>p.evidence),reviews:packs.flatMap(p=>p.reviews),accounts:packs.flatMap(p=>p.accounts)};
const contentPacks=readHistoryPacks();
const prototype=readPrototypeData(contentPacks);
const reviewedPacks=contentPacks.filter(pack=>pack.name!=='prototype');
const adapters=reviewedPacks.map(pack=>pack.data);
const exploration={entities:adapters.flatMap(a=>a.entities),associations:adapters.flatMap(a=>a.associations),relationships:adapters.flatMap(a=>a.relationships)};
const errors=validateEvidence(pack,{release:true});
const claims=new Map(pack.claims.map(c=>[c.id,c]));
const ids=new Set(assembleHistory(prototype,exploration,read('web/data/collection.json')).entities.map(e=>e.id));
for(const e of exploration.entities){
 if(!pack.entities.some(x=>x.id===e.id)) errors.push(`Unknown exploration entity: ${e.id}`);
 if(e.type!=='area'&&!e.claimIds?.length) errors.push(`Missing exploration evidence: ${e.id}`);
 for(const id of e.claimIds??[]) if(!claims.has(id)) errors.push(`Unknown exploration claim: ${id}`);
 if(e.point&&!e.claimIds?.some(id=>claims.get(id)?.value?.type==='point'&&JSON.stringify(claims.get(id)?.value?.coordinates)===JSON.stringify(e.point))) errors.push(`Unverified point: ${e.id}`);
}
for(const r of exploration.relationships) if(!ids.has(r.a)||!ids.has(r.b)) errors.push('Unknown exploration relationship');
if(!errors.length){
 try {parseHistory(prototype, {sourceIds:new Set(read('web/data/collection.json').sources.map((s: {id:string})=>s.id))}); parseHistory(assembleHistory(prototype,exploration,read('web/data/collection.json')), {claimIds:new Set(pack.claims.map(c=>c.id)),sourceIds:new Set(read('web/data/collection.json').sources.map((s: {id:string})=>s.id))});}
 catch(error){errors.push(error instanceof Error?error.message:String(error));}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{
 for(const {name,data} of reviewedPacks) fs.writeFileSync(`research/evidence/${name}-exploration.json`,JSON.stringify(data,null,2)+'\n');
 const exports=new Set(reviewedPacks.map(p=>p.name+'-exploration.json'));
 for(const file of fs.readdirSync('research/evidence'))if(file.endsWith('-exploration.json')&&!exports.has(file))fs.unlinkSync('research/evidence/'+file);
 fs.writeFileSync('web/data/browser-chronology.json',JSON.stringify(browserChronology(pack))+'\n');
 const evidenceDir='web/data/evidence';
 fs.mkdirSync(evidenceDir,{recursive:true});
 const collection=read('web/data/collection.json');
 const assembled=assembleHistory(prototype,exploration,collection);
 const {entities:histories,associations,relationships}=assembled;
 fs.writeFileSync('web/data/browser-history.json',JSON.stringify({version:1,data:{entities:histories,associations,relationships},bactriaOutline:geometry(collection.historicalOverlays[0].geometry)})+'\n');
 fs.writeFileSync('web/data/search-index.json',JSON.stringify(createSearchIndex(histories))+'\n');
 const files=new Set(histories.map(e=>e.id+'.json'));
 for(const file of fs.readdirSync(evidenceDir))if(file.endsWith('.json')&&!files.has(file))fs.unlinkSync(`${evidenceDir}/${file}`);
 for(const entity of histories)fs.writeFileSync(`${evidenceDir}/${entity.id}.json`,JSON.stringify(evidenceForFocus(pack,entity))+'\n');
 fs.writeFileSync('web/data/browser-evidence.json',JSON.stringify(browserEvidence(pack))+'\n');
 fs.writeFileSync('web/data/reviewed-evidence.json',JSON.stringify(pack,null,2)+'\n');
 fs.writeFileSync('web/data/reviewed-exploration.json',JSON.stringify(exploration,null,2)+'\n');
 console.log(`Built ${pack.claims.length} reviewed statements and ${exploration.entities.length} exploration entries.`);
}
