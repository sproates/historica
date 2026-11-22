import {encodeFocus,decodeFocus} from './focus-model.js?v=bookmarks-1';
export function encodeView(state,view){
 const p=new URLSearchParams(encodeFocus(state).slice(1));p.set('v','1');
 for(const k of ['x','y','w','borders'])p.set(k,String(view.map[k]));
 p.set('expanded',view.expanded?'1':'0');p.set('evidence',view.evidence?'1':'0');
 p.set('rangeFrom',String(view.envelope.start));p.set('rangeTo',String(view.envelope.end));
 return '#'+p;
}
export function decodeView(hash,data){
 const state=decodeFocus(hash,data),p=new URLSearchParams(hash.replace(/^#/,''));
 const n=(k,f)=>p.has(k)&&p.get(k).trim()!==''&&Number.isFinite(Number(p.get(k)))?Number(p.get(k)):f;
 const w=Math.max(30,Math.min(720,n('w',720)));
 const map={w,x:Math.max(0,Math.min(720-w,n('x',0))),y:Math.max(0,Math.min(360-w/2,n('y',0))),borders:Math.max(0,Math.min(1,n('borders',1)))};
 const f=data.entities.find(e=>e.id===state.focus);
 const valid=y=>Number.isInteger(y)&&y!==0&&y>=-300000&&y<=2026;
 const start=n('rangeFrom',Math.min(state.start,f.startYear)),end=n('rangeTo',Math.max(state.end,f.endYear));
 const envelope={start:valid(start)?Math.min(start,state.start):Math.min(state.start,f.startYear),end:valid(end)?Math.max(end,state.end):Math.max(state.end,f.endYear)};
 return {state,view:{map,envelope,expanded:p.get('expanded')==='1',evidence:p.get('evidence')==='1'}};
}
