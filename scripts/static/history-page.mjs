import fs from 'node:fs';
import {buildFocusData,initialFocus,rankedContext,focusAssociations,relatedEntities} from '../../web/focus-model.js';
import {comparisonRecords,comparisonLayout,comparisonExplanation} from '../../web/comparison-model.js';
import {timelineLayout,laneView} from '../../web/swimlane-model.js';
import {readHistoryPacks,readPrototypeData} from '../lib/history-content.mjs';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
export const year=y=>`${Math.abs(y).toLocaleString('en-GB')} ${y<0?'BCE':'CE'}`;
export const dates=(a,b)=>a===b?year(a):`${year(a)} – ${year(b)}`;
export const href=e=>`/${e.type}/${e.id}`;
export const xy=p=>[(p[0]+180)*2,180-p[1]*2];
export function geometry(g){
  const ring=r=>r.map((p,i)=>`${i?'L':'M'}${xy(p).join(',')}`).join('')+'Z';
  return g.type==='Polygon'?g.coordinates.map(ring).join(''):g.type==='MultiPolygon'?g.coordinates.flatMap(p=>p.map(ring)).join(''):'';
}
export function historyPage(id){
  const packs=readHistoryPacks();
  const reviewed=Object.fromEntries(['entities','associations','relationships'].map(key=>[key,packs.filter(p=>p.name!=='prototype').flatMap(p=>p.data[key])]));
  const collection=read('web/data/collection.json');
  const data=buildFocusData(collection,reviewed,readPrototypeData(packs));
  const focus=data.entities.find(e=>e.id===id);
  if(!focus)throw Error(`Unknown static history: ${id}`);
  const state=initialFocus(data,id),ranked=rankedContext(data,state);
  const picks=comparisonRecords(focus,ranked,data,state);
  const associations=focusAssociations(data,state);
  const places=[...new Map(associations.map(a=>[`${a.point.join(',')}:${a.label}`,a])).values()];
  const evidence=read('web/data/reviewed-evidence.json');
  const checked=evidence.claims.filter(c=>(c.subjectId===id||focus.claimIds?.includes(c.id))&&c.status==='accepted');
  return {data,focus,state,ranked,places,evidence,checked,
    comparisons:comparisonLayout([focus,...picks],state),
    explanation:comparisonExplanation(picks,state),
    timeline:timelineLayout(focus,ranked,data,state),
    related:relatedEntities(data,state).filter(e=>e.type!=='event'),
    land:read('web/data/ne_50m_admin_0_countries.json').features.map(f=>geometry(f.geometry)),
    references:[...new Set([focus.url,...associations.map(a=>a.source)].filter(Boolean))],
  };
}
export {laneView};
