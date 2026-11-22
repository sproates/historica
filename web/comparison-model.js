import {regionFor} from './swimlane-model.js';
// Suggestions use existing dated records and respect the current filters.
const suggestions={alexander:['mencius','monte-alban'],stonehenge:['khufu-reign','liangzhu-city'],'stonehenge-stones':['khufu-reign','liangzhu-city'],'julius-caesar':['cleopatra-vii','western-han'],alcibiades:['socrates','eastern-zhou'],socrates:['alcibiades','danebury-life'],'khufu-reign':['stonehenge','liangzhu-city']};
export function comparisonRecords(focus,ranked,data,state){
 const result=[],regions=new Set([regionFor(focus,data,state)]);
 for(const id of suggestions[focus.id]||[]){const e=ranked.find(e=>e.id===id);if(e){result.push(e);regions.add(regionFor(e,data,state));}}
 for(const e of ranked){if(result.length>=2)break;const r=regionFor(e,data,state);if(!regions.has(r)&&r!=='Location still being researched'&&!['global-overview','world-400-250','period'].includes(e.id)){result.push(e);regions.add(r);}}
 for(const e of ranked){if(result.length>=2)break;if(!result.some(x=>x.id===e.id))result.push(e);}
 return result.slice(0,2);
}
export const isPlace=e=>['area','state','city'].includes(e.type);
export const outsideVisiblePeriod=e=>!isPlace(e)&&!e.inWindow;
