import fs from 'node:fs';
import {assembleHistory} from '../../web/generated/domain/assemble-history.js';
import {parseHistory} from '../../web/generated/content/validate-history.js';
import {createHistoryPage} from '../../web/generated/presentation/history-page.js';
import {readHistoryPacks,readPrototypeData} from '../lib/history-content.mjs';

export {year,dates,href,xy,geometry} from '../../web/generated/presentation/history-page.js';
export {laneView} from '../../web/generated/domain/swimlane.js';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
let inputs;
function loadInputs(){
  if(inputs)return inputs;
  const packs=readHistoryPacks();
  const reviewed=Object.fromEntries(['entities','associations','relationships'].map(key=>[key,packs.filter(p=>p.name!=='prototype').flatMap(p=>p.data[key])]));
  const data=parseHistory(assembleHistory(readPrototypeData(packs),reviewed,read('web/data/collection.json')));
  return inputs={data,evidence:read('web/data/reviewed-evidence.json'),countries:read('web/data/ne_50m_admin_0_countries.json')};
}

export function historyEntities(){return loadInputs().data.entities;}
export function historyPage(id){
  const {data,evidence,countries}=loadInputs();
  return createHistoryPage(data,id,evidence,countries);
}
