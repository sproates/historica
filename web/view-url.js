import {decodeFocus} from './focus-model.js?v=lifeways-1';
export function encodeView(state,view,data){
 const f=data.entities.find(e=>e.id===state.focus);
 if(!f)throw new Error('Unknown focus');
 const p=new URLSearchParams();
 if(state.start!==f.startYear||state.end!==f.endYear){p.set('from',state.start);p.set('to',state.end);}
 if(state.kind!=='all')p.set('kind',state.kind);
 if(state.area!=='all')p.set('area',state.area);
 const defaults={x:0,y:0,w:720,borders:1};
 for(const k of Object.keys(defaults))if(view.map[k]!==defaults[k])p.set(k,String(view.map[k]));
 if(view.expanded)p.set('expanded','1');
 if(view.evidence)p.set('evidence','1');
 if(view.envelope.start!==Math.min(state.start,f.startYear))p.set('rangeFrom',view.envelope.start);
 if(view.envelope.end!==Math.max(state.end,f.endYear))p.set('rangeTo',view.envelope.end);
 return `/${f.type}/${encodeURIComponent(f.id)}`+(p.size?'?'+p:'');
}
export function decodeView(address,data){
 const url=new URL(address||'/', 'https://historica.online');
 const legacy=url.hash.startsWith('#focus=');
 const p=new URLSearchParams(legacy?url.hash.slice(1):url.search);
 if(!legacy){const parts=url.pathname.split('/').filter(Boolean);const entity=data.entities.find(e=>e.type===parts[0]&&e.id===parts[1]);p.set('focus',entity?.id||'alexander');}
 const state=decodeFocus('#'+p,data);
 const n=(k,f)=>p.has(k)&&p.get(k).trim()!==''&&Number.isFinite(Number(p.get(k)))?Number(p.get(k)):f;
 const w=Math.max(30,Math.min(720,n('w',720)));
 const map={w,x:Math.max(0,Math.min(720-w,n('x',0))),y:Math.max(0,Math.min(360-w/2,n('y',0))),borders:Math.max(0,Math.min(1,n('borders',1)))};
 const f=data.entities.find(e=>e.id===state.focus);
 const valid=y=>Number.isInteger(y)&&y!==0&&y>=-300000&&y<=2026;
 const start=n('rangeFrom',Math.min(state.start,f.startYear)),end=n('rangeTo',Math.max(state.end,f.endYear));
 const envelope={start:valid(start)?Math.min(start,state.start):Math.min(state.start,f.startYear),end:valid(end)?Math.max(end,state.end):Math.max(state.end,f.endYear)};
 return {state,view:{map,envelope,expanded:p.get('expanded')==='1',evidence:p.get('evidence')==='1'}};
}
