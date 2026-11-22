export const FIRST=-300000,LAST=2026;
export const ordinal=y=>y<0?y+1:y;
export const historical=n=>n<=0?n-1:n;
export const clampYear=y=>Math.max(FIRST,Math.min(LAST,y===0?1:y));
export function bounds(record){if(record.date){const y=record.date.era==='BCE'?-record.date.year:record.date.year;return [y,y];}return [record.startYear,record.endYear];}
export function overlaps(record,start,end){const [a,b]=bounds(record);return a<=end&&b>=start;}
export function position(year,start,end){return (ordinal(year)-ordinal(start))/Math.max(1,ordinal(end)-ordinal(start));}
export function windowAround(year,width){const size=Math.min(ordinal(LAST)-ordinal(FIRST),Math.max(0,Math.round(width)));let a=ordinal(year)-Math.floor(size/2);a=Math.max(ordinal(FIRST),Math.min(ordinal(LAST)-size,a));return {start:historical(a),end:historical(a+size)};}
export function shiftWindow(state,direction){const size=ordinal(state.end)-ordinal(state.start),delta=direction*Math.max(1,Math.round(size*.65));const a=Math.max(ordinal(FIRST),Math.min(ordinal(LAST)-size,ordinal(state.start)+delta));const actual=a-ordinal(state.start);return {...state,start:historical(a),end:historical(a+size),moment:historical(ordinal(state.moment)+actual)};}
export function zoomWindow(state,direction){const sizes=[0,13,99,499,1499,12025,302025],width=ordinal(state.end)-ordinal(state.start);const size=direction>0?sizes.find(s=>s>width)??sizes.at(-1):[...sizes].reverse().find(s=>s<width)??0;return {...state,...windowAround(state.moment,size)};}
export function readTimeline(hash,fallback=-329){const p=new URLSearchParams(hash.replace(/^#/,'')),n=k=>p.has(k)?Number(p.get(k)):NaN;const valid=y=>Number.isInteger(y)&&y!==0&&y>=FIRST&&y<=LAST;const start=n('from'),end=n('to'),moment=n('moment');if(valid(n('year')))fallback=n('year');const range=valid(start)&&valid(end)&&start<=end?{start,end}:{start:-400,end:-301};return {...range,moment:valid(moment)?Math.max(range.start,Math.min(range.end,moment)):Math.max(range.start,Math.min(range.end,fallback)),selection:p.get('story')||'life-alexander'};}
export function appendTimeline(hash,state){const p=new URLSearchParams(hash.replace(/^#/,''));for(const [key,value]of Object.entries({from:state.start,to:state.end,moment:state.moment,story:state.selection}))p.set(key,value);return '#'+p.toString();}
