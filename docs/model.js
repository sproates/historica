export const MIN_YEAR=-336, MAX_YEAR=-323;
export const PRESETS={china:{name:'China',point:[110,34],w:30},italy:{name:'Italy',point:[13,42],w:15},americas:{name:'Mesoamerica',point:[-97,19],w:27},world:{name:'World',point:[0,12],w:288}};
export function yearLabel(year){return `${Math.abs(year)} ${year<0?'BCE':'CE'}`;}
export function activeAt(record,year){if(record.date)return (record.date.era==='BCE'?-record.date.year:record.date.year)===year;return record.startYear<=year&&record.endYear>=year;}
export function eventsForYear(events,year){return events.filter(e=>activeAt(e,year));}
export function allRecords(data){return [...data.campaign,...data.contexts,...data.events];}
export function stageAt(data,year,id){return data.campaign.find(s=>s.id===id&&activeAt(s,year))??data.campaign.find(s=>activeAt(s,year))??null;}
export function project(lon,lat){return [(lon+180)*.8,90-lat];}
export function cameraAt(point,w=20){const [x,y]=project(...point);return {x,y,w};}
export function readState(hash,data){
 const p=new URLSearchParams(hash.replace(/^#/,''));const n=Number(p.get('year')??-329),b=Number(p.get('borders')??60);
 const year=Number.isInteger(n)&&n>=MIN_YEAR&&n<=MAX_YEAR?n:-329;
 const stage=stageAt(data,year,p.get('stage'));const available=allRecords(data).filter(e=>activeAt(e,year));
 const state={year,borders:Number.isFinite(b)?Math.max(0,Math.min(100,b)):60,stage:stage?.id??null,event:p.has('event')&&p.get('event')===''?null:available.find(e=>e.id===p.get('event'))?.id??stage?.id??null,place:['bactra','bactria'].includes(p.get('place'))?p.get('place'):null,mode:p.get('mode')==='explore'?'explore':'follow',world:p.get('view')==='world'};
 const [x,y,w]=['x','y','w'].map(k=>p.has(k)?Number(p.get(k)):NaN);
 if([x,y,w].every(Number.isFinite)&&x>=0&&x<=288&&y>=0&&y<=180&&w>=6&&w<=288)state.camera={x,y,w};
 return state;
}
export function writeState(state,camera){const p=new URLSearchParams({year:String(state.year),borders:String(state.borders),mode:state.mode,view:state.world?'world':'region'});p.set('event',state.event??'');for(const k of ['stage','place'])if(state[k])p.set(k,state[k]);for(const k of ['x','y','w'])p.set(k,camera[k].toFixed(3));return '#'+p.toString();}
export function changeYear(state,camera,year,data,aspect=1.6){
 year=Math.max(MIN_YEAR,Math.min(MAX_YEAR,year));const stage=stageAt(data,year);const current=allRecords(data).find(r=>r.id===state.event);
 const keep=state.mode==='explore'&&current?.kind==='context'&&activeAt(current,year);
 const local=data.contexts.find(r=>activeAt(r,year)&&inViewport(r.point,camera,aspect));
 const event=state.mode==='follow'?stage?.id??null:keep?current.id:local?.id??(stage&&inViewport(stage.point,camera,aspect)?stage.id:null);
 return {state:{...state,year,stage:stage?.id??null,event,place:null,world:state.mode==='follow'?false:state.world},camera:state.mode==='follow'&&stage?cameraAt(stage.point):{...camera}};
}
export function inViewport(point,camera,aspect){const [x,y]=project(...point);return Math.abs(x-camera.x)<=camera.w/2&&Math.abs(y-camera.y)<=camera.w/aspect/2;}
export function ageLabel(year){const difference=356+year;return `${difference-1}–${difference} years (year-level estimate)`;}
