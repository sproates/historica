import fs from 'node:fs';
import crypto from 'node:crypto';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
const collection=JSON.parse(fs.readFileSync('web/data/collection.json','utf8'));
const data=buildFocusData(collection);
const items: Array<{id:string;entityIds:string[];field:string;value:unknown;sourceUrls:string[];fingerprint:string;status:string;task:string}>=[];
function add(id: string,entityIds: string[],field: string,value: unknown,sourceUrls: string[],task: string){
 items.push({id,entityIds,field,value,sourceUrls:[...new Set(sourceUrls.filter(Boolean))],fingerprint:crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'),status:'unchecked',task});
}
for(const e of data.entities){
 for(const field of ['title','description','note','startYear','endYear','point'] as const){
  if(e[field]===undefined||e[field]===null||e[field]==='')continue;
  add(`entity:${e.id}:${field}`,[e.id],field,e[field],[e.url],['description','note'].includes(field)?'Split into atomic claims; distinguish historical assertions from editorial notes.':field==='point'?'Check reference coordinates and their historical meaning.':field.endsWith('Year')?'Establish precision and distinguish study window from historical duration.':'Check identity and any asserted role or event.');
 }
}
for(const [i,a] of data.associations.entries())add(`association:${i}`,[a.subject,a.place],'association',a,[a.source],'Check place, date precision and association type separately; do not infer continuous presence.');
for(const [i,r] of data.relationships.entries())add(`relationship:${i}`,[r.a,r.b],'relationship',r,[],'Find direct evidence for relationship and any dates; nearby biography citations are not inherited.');
for(const [i,g] of collection.historicalOverlays.entries())add(`geometry:${i}`,['bactria'],'geometry',g,[],'Audit geometry provenance, reuse, temporal validity and reconstruction.');
const report={schemaVersion:'audit-1',description:'Inventory of prototype fields to review, not a count of atomic historical claims. Regenerated from current app data; reviewed claims are stored separately.',entityCount:data.entities.length,itemCount:items.length,items};
fs.mkdirSync('research/evidence/audit',{recursive:true});
fs.writeFileSync('research/evidence/audit/inventory.json',JSON.stringify(report,null,2)+'\n');
console.log(`Inventoried ${report.entityCount} entities and ${items.length} fields, associations, relationships and geometries. No items automatically accepted.`);
