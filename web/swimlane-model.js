import {ordinal,historical,position} from './timeline-model.js';

// Lane membership describes recorded regional context, not an exact personal location.
export function regionFor(entity,data,state){
 if(entity.region)return entity.region;
 const names=(entity.regionIds||[]).map(id=>data.entities.find(e=>e.id===id)?.title).filter(Boolean);
 if(names.length)return names.join(' / ');
 const places=[...new Set(data.associations.filter(a=>a.subject===entity.id&&a.startYear<=state.end&&a.endYear>=state.start).map(a=>data.entities.find(e=>e.id===a.place)?.title).filter(Boolean))];
 return places.length>1?'Across regions':places[0]||'Region not recorded';
}
export function timelineLayout(focus,records,data,state){
 const focusedRegion=regionFor(focus,data,state),groups=new Map();
 for(const e of records){const name=regionFor(e,data,state);if(!groups.has(name))groups.set(name,{name,entries:[],distance:Infinity});const g=groups.get(name);g.entries.push(e);g.distance=Math.min(g.distance,e.km??Infinity);}
 const ordered=[...groups.values()].sort((a,b)=>(a.name===focusedRegion?-1:b.name===focusedRegion?1:0)||a.distance-b.distance||a.name.localeCompare(b.name));
 const first=['area','state','city'].includes(focus.type)?{...focus,startYear:state.start,endYear:state.end}:focus;
 const lanes=[{name:'Your focus',entries:[first],focus:true},...ordered];
 for(const lane of lanes){const occupied=[];lane.items=[];
  for(const e of lane.entries.toSorted((a,b)=>a.startYear-b.startYear||a.endYear-b.endYear)){
   if(e.endYear<state.start||e.startYear>state.end)continue;
   const single=state.start===state.end;
   const left=single?50:100*position(Math.max(e.startYear,state.start),state.start,state.end);
   const right=single?50:100*position(Math.min(e.endYear,state.end),state.start,state.end);
   // Reserve label space as well as the time span, keeping adjacent entries legible.
   const labelLeft=Math.min(left,78),end=Math.max(right,labelLeft+22);
   let row=occupied.findIndex(x=>x+2<=labelLeft);if(row<0)row=occupied.length;occupied[row]=end;
   lane.items.push({...e,left,width:right-left,labelLeft,row,point:e.startYear===e.endYear,single,continuesBefore:e.startYear<state.start,continuesAfter:e.endYear>state.end});
  }
  lane.rows=Math.max(1,occupied.length);
 }
 const span=ordinal(state.end)-ordinal(state.start);
 const ticks=span===0?[state.start]:[...new Set(Array.from({length:6},(_,i)=>historical(Math.round(ordinal(state.start)+span*i/5))))];
 return {lanes,ticks};
}
