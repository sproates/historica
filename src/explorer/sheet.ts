export type SheetSnap='peek'|'middle'|'full';
export function bindSheet(el:<T extends HTMLElement=HTMLElement>(id:string)=>T,mobile:()=>boolean,height:(snap:SheetSnap)=>number,getSnap:()=>SheetSnap,setSnap:(snap:SheetSnap)=>void){
let dragStart:number|null=null,initialHeight=0,dragged=false,dragTime=0,tappedHandle=false;
const handle=el('sheet-handle'),grab=el('sheet-grab');
grab.addEventListener('pointerdown',e=>{
 if(!mobile()||!e.isPrimary||e.button!==0)return;
 const target=e.target as Element;
 if(target.closest('button,a,input,select')&&!target.closest('#sheet-handle'))return;
 dragStart=e.clientY;initialHeight=el('sheet').getBoundingClientRect().height;dragged=false;dragTime=performance.now();tappedHandle=!!target.closest('#sheet-handle');
 grab.setPointerCapture(e.pointerId);el('sheet').classList.add('dragging');e.preventDefault();
});
grab.addEventListener('pointermove',e=>{
 if(dragStart===null)return;const delta=dragStart-e.clientY;if(Math.abs(delta)>4)dragged=true;
 document.documentElement.style.setProperty('--sheet-height',`${Math.max(height('peek'),Math.min(height('full'),initialHeight+delta))}px`);
});
grab.addEventListener('pointerup',e=>{
 if(dragStart===null)return;
 const delta=dragStart-e.clientY,velocity=delta/Math.max(1,performance.now()-dragTime);dragStart=null;el('sheet').classList.remove('dragging');
 if(!dragged){setSnap(tappedHandle?(getSnap()==='full'?'middle':'full'):getSnap());return;}
 const currentHeight=el('sheet').getBoundingClientRect().height,full=height('full'),middle=height('middle');
 const snap=Math.abs(velocity)>.45?(velocity>0?'full':'peek'):currentHeight>(full+middle)/2?'full':currentHeight<(height('peek')+middle)/2?'peek':'middle';
 setSnap(snap);
});
grab.addEventListener('pointercancel',()=>{dragStart=null;el('sheet').classList.remove('dragging');setSnap(getSnap());});
handle.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();setSnap(e.key==='ArrowDown'?'peek':getSnap()==='full'?'middle':'full');}});
el('sheet-toggle').onclick=()=>setSnap(getSnap()==='full'?'middle':'full');

}
