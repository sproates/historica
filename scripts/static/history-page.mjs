import fs from 'node:fs';
import {assembleHistory} from '../../web/generated/domain/assemble-history.js';
import {parseHistory} from '../../web/generated/content/validate-history.js';
import {createHistoryPage} from '../../web/generated/presentation/history-page.js';
import {readHistoryPacks,readPrototypeData} from '../lib/history-content.mjs';

export {year,dates,href,xy,geometry} from '../../web/generated/presentation/history-page.js';
export {laneView} from '../../web/generated/domain/swimlane.js';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
export function historyPage(id){
  const packs=readHistoryPacks();
  const reviewed=Object.fromEntries(['entities','associations','relationships'].map(key=>[key,packs.filter(p=>p.name!=='prototype').flatMap(p=>p.data[key])]));
  const data=parseHistory(assembleHistory(readPrototypeData(packs),reviewed,read('web/data/collection.json')));
  return createHistoryPage(data,id,read('web/data/reviewed-evidence.json'),read('web/data/ne_50m_admin_0_countries.json'));
}
