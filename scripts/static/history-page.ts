import fs from 'node:fs';
import {assembleHistory} from '../../web/generated/domain/assemble-history.js';
import {parseHistory} from '../../web/generated/content/validate-history.js';
import {createHistoryPage} from '../../web/generated/presentation/history-page.js';
import {readHistoryPacks,readPrototypeData} from '../lib/history-content.ts';

export {year,dates,href,xy,geometry} from '../../web/generated/presentation/history-page.js';
export {laneView} from '../../web/generated/domain/swimlane.js';
const read=(path: string)=>JSON.parse(fs.readFileSync(path,'utf8'));
let inputs: ReturnType<typeof readInputs> | undefined;
function loadInputs(){return inputs ??= readInputs();}
function readInputs(){
  const packs=readHistoryPacks();
  const reviewedPacks=packs.filter(p=>p.name!=='prototype');
  const reviewed={entities:reviewedPacks.flatMap(p=>p.data.entities),associations:reviewedPacks.flatMap(p=>p.data.associations),relationships:reviewedPacks.flatMap(p=>p.data.relationships)};
  const data=parseHistory(assembleHistory(readPrototypeData(packs),reviewed,read('web/data/collection.json')));
  return {data,evidence:read('web/data/reviewed-evidence.json'),countries:read('web/data/ne_50m_admin_0_countries.json')};
}

export function historyEntities(){return loadInputs().data.entities;}
export function historyPage(id: string,{geography=true}={}){
  const {data,evidence,countries}=loadInputs();
  return createHistoryPage(data,id,evidence,geography?countries:{features:[]});
}

export function selectedHistoryEntities(){
 const entities=historyEntities();
 const file=process.env.HISTORICA_STATIC_SELECTION;
 if(!file)return entities;
 const ids=JSON.parse(fs.readFileSync(file,'utf8'));
 if(!Array.isArray(ids)||ids.some(id=>!entities.some(e=>e.id===id)))throw new Error('Invalid static build selection');
 return entities.filter(e=>ids.includes(e.id));
}
