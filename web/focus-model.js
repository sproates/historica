import prototypeData from './generated/content/prototype-data.js';
import {assembleHistory} from './generated/domain/assemble-history.js';
import {overlaps} from './timeline-model.js';
export function buildFocusData(collection, exploration={entities:[],associations:[],relationships:[]}, base=prototypeData){
 return assembleHistory(base,exploration,collection);
}
export function initialFocus(data,id='alexander'){const e=data.entities.find(e=>e.id===id)??data.entities.find(e=>e.id==='alexander')??data.entities[0];return {focus:e.id,start:e.startYear,end:e.endYear,kind:'all',area:'all'};}
export function changeFocus(data,state,id){const next=initialFocus(data,id),entity=data.entities.find(e=>e.id===next.focus);return ['area','state','city'].includes(entity.type)?{...next,start:state.start,end:state.end}:next;}
export function focusAssociations(data,state){const focus=data.entities.find(e=>e.id===state.focus);let list=data.associations.filter(a=>a.subject===state.focus||a.place===state.focus);
 if(focus.type==='area')list=data.associations.filter(a=>a.subject===state.focus||a.place===state.focus||data.entities.find(e=>e.id===a.subject)?.regionIds?.includes(state.focus));
 if(focus.type==='period'||focus.id==='global-overview')list=data.associations;
 if(focus.type==='event'&&focus.point&&(!focus.contextual||!list.length))list=[{subject:focus.id,place:focus.id,startYear:focus.startYear,endYear:focus.endYear,label:focus.region||focus.title,point:focus.point,source:focus.url}];
 if(['city','area','state'].includes(focus.type)&&!list.length&&focus.point)list=[{subject:focus.id,place:focus.id,startYear:focus.startYear,endYear:focus.endYear,label:focus.title,point:focus.point,source:focus.url}];
 return list.filter(a=>overlaps(a,state.start,state.end)&&(state.area==='all'||a.place===state.area||data.entities.find(e=>e.id===a.place)?.regionIds?.includes(state.area)));}
export function distance(a,b){const rad=Math.PI/180,dlat=(b[1]-a[1])*rad,dlon=(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dlon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));}
export function rankedContext(data,state){const f=data.entities.find(e=>e.id===state.focus);const anchors=['area','city','state'].includes(f.type)&&f.point?[{point:f.point,startYear:state.start,endYear:state.end}]:focusAssociations(data,{...state,area:'all'});const filterPoint=data.entities.find(e=>e.id===state.area)?.point;return data.entities.filter(e=>e.id!==state.focus&&overlaps(e,state.start,state.end)&&['event','period','person'].includes(e.type)&&(state.kind==='all'||e.type===state.kind)).map(e=>{
 const personPoints=e.type==='person'?data.associations.filter(a=>a.subject===e.id&&overlaps(a,Math.max(e.startYear,state.start),Math.min(e.endYear,state.end))).map(a=>a.point):[];
 const relevant=anchors.filter(a=>overlaps(a,Math.max(e.startYear,state.start),Math.min(e.endYear,state.end)));
 return {...e,km:relevant.length&&(e.point||personPoints.length)?Math.min(...relevant.flatMap(a=>(e.point?[e.point]:personPoints).map(p=>distance(a.point,p)))):null};
 }).filter(e=>state.area==='all'||e.regionIds?.includes(state.area)||filterPoint&&e.point&&distance(filterPoint,e.point)<1200).sort((a,b)=>(a.km??Infinity)-(b.km??Infinity)||a.startYear-b.startYear);}
export function relatedEntities(data,state){const ids=new Map();for(const r of data.relationships){if(r.a===state.focus)ids.set(r.b,r.labelFromA??r.label);if(r.b===state.focus)ids.set(r.a,r.labelFromB??r.label);}
 for(const a of data.associations){if(a.subject===state.focus)ids.set(a.place,a.label);if(a.place===state.focus)ids.set(a.subject,a.label);}
 if(state.focus==='alexander')ids.set('period','Compare this whole period');
 if(state.focus.startsWith('stage-'))ids.set('alexander','Campaign of Alexander');
 if(['ptolemy-egypt','ptolemy-rule','ptolemy-king'].includes(state.focus)){ids.set('ptolemy','Ruler');ids.set('egypt','Associated area');}
 if(['philip-king','philip-reign','chaeronea'].includes(state.focus)){ids.set('philip','King of Macedonia');ids.set('macedonia','Associated kingdom');}
 return [...ids].map(([id,relation])=>{const e=data.entities.find(e=>e.id===id);return e?{...e,relation,inWindow:overlaps(e,state.start,state.end)}:null;}).filter(Boolean);}
export function encodeFocus(s){return '#'+new URLSearchParams({focus:s.focus,from:s.start,to:s.end,kind:s.kind,area:s.area});}
export function decodeFocus(hash,data){const p=new URLSearchParams(hash.replace(/^#/,''));const s=initialFocus(data,p.get('focus'));const a=Number(p.get('from')),b=Number(p.get('to'));if(p.has('focus')&&p.has('from')&&p.has('to')&&Number.isInteger(a)&&Number.isInteger(b)&&a<=b&&a>=-300000&&b<=2026&&a!==0&&b!==0){s.start=a;s.end=b;}if(['all','event','period','person'].includes(p.get('kind')))s.kind=p.get('kind');if((p.get('area')==='all'||data.entities.some(e=>e.id===p.get('area')&&['area','state','city'].includes(e.type))))s.area=p.get('area');return s;}

// Bounds describe possible dates, not an event lasting for the entire dating range.
export function temporalLabel(record, state) {
 if(record.temporalKind==='dated-evidence') return 'Date uncertain within this range';
 const u=record.uncertainty;
 if(u){
  const coversRange=state.start<=u.start[0]&&state.end>=u.end[1];
  const coreExists=u.start[1]<=u.end[0];
  const intersectsCore=coreExists&&state.start<=u.end[0]&&state.end>=u.start[1];
  return !coversRange&&!intersectsCore?'Possible overlap · dates uncertain':'Broad context · dates uncertain';
 }
 return record.contextual?record.dateLabel:'';
}
