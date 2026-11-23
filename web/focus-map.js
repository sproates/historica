// Camera changes are independent of the selected entity and time window.
export function setupMap(svg,onChange=()=>{}){
  const $=id=>document.getElementById(id);
  let camera={x:0,y:0,w:720},points=[],drag=null,suppressClick=false,pointers=new Map();
  let silent=false,fitPending=false;
  function draw(){
    const h=camera.w/2;
    camera.x=Math.max(0,Math.min(720-camera.w,camera.x));
    camera.y=Math.max(0,Math.min(360-h,camera.y));
    svg.setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${h}`);
    $('map-in').disabled=camera.w<=30;
    $('map-out').disabled=camera.w>=720;
    if(!silent)onChange();
  }
  function zoom(factor){const w=Math.max(30,Math.min(720,camera.w*factor));camera.x+=(camera.w-w)/2;camera.y+=(camera.w-w)/4;camera.w=w;draw();}
  $('map-in').onclick=()=>zoom(.7);
  $('map-out').onclick=()=>zoom(1/.7);
  $('map-world').onclick=()=>{camera={x:0,y:0,w:720};draw();};
  function fit(){
    if(!points.length)return;
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
    const w=Math.min(720,Math.max(60,(right-left+30)*1.2,(bottom-top+30)*2.4));
    camera={x:(left+right-w)/2,y:(top+bottom-w/2)/2,w};draw();
  }
  $('map-fit').onclick=fit;
  const borders=()=>svg.style.setProperty('--border-opacity',$('map-borders').value);
  $('map-borders').oninput=()=>{borders();onChange();};
  // Convert screen coordinates through the SVG's centred, aspect-preserving viewport.
  function local(x,y,c=camera){const r=svg.getBoundingClientRect(),scale=Math.min(r.width/c.w,r.height/(c.w/2));return {x:(x-r.left-(r.width-c.w*scale)/2)/scale,y:(y-r.top-(r.height-c.w/2*scale)/2)/scale};}
  function gesture(){const p=[...pointers.values()];return {x:p.reduce((n,v)=>n+v.x,0)/p.length,y:p.reduce((n,v)=>n+v.y,0)/p.length,d:p.length>1?Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y):0};}
  function rebase(){drag=pointers.size?{...gesture(),camera:{...camera}}:null;}
  svg.addEventListener('wheel',e=>{
    e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?svg.getBoundingClientRect().height:1;
    if(e.ctrlKey){const anchor=local(e.clientX,e.clientY),old=camera.w;camera.w=Math.max(30,Math.min(720,old*Math.exp(Math.max(-1,Math.min(1,e.deltaY*unit*.01)))));camera.x+=anchor.x*(1-camera.w/old);camera.y+=anchor.y*(1-camera.w/old);}
    else{const r=svg.getBoundingClientRect(),scale=Math.min(r.width/camera.w,r.height/(camera.w/2));camera.x+=e.deltaX*unit/scale;camera.y+=e.deltaY*unit/scale;}
    draw();
  },{passive:false});
  svg.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    if(!pointers.size)suppressClick=false;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>1){suppressClick=true;for(const id of pointers.keys())svg.setPointerCapture(id);}
    rebase();
  });
  svg.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!drag)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const current=gesture();
    if(pointers.size===1&&!suppressClick&&Math.hypot(current.x-drag.x,current.y-drag.y)<5)return;
    suppressClick=true;svg.setPointerCapture(e.pointerId);
    const anchor=local(drag.x,drag.y,drag.camera);
    camera.w=Math.max(30,Math.min(720,drag.camera.w*(drag.d>0&&current.d>0?drag.d/current.d:1)));
    const now=local(current.x,current.y,camera);
    camera.x=drag.camera.x+anchor.x-now.x;camera.y=drag.camera.y+anchor.y-now.y;draw();
  });
  function finish(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);rebase();}
  svg.addEventListener('pointerup',finish);svg.addEventListener('pointercancel',finish);svg.addEventListener('lostpointercapture',finish);
  svg.addEventListener('click',e=>{if(suppressClick){e.stopPropagation();suppressClick=false;}},true);
  svg.addEventListener('keydown',e=>{
    const marker=e.target.closest('[data-focus]');
    if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();marker.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
    const step=camera.w*.1;
    if(e.key==='+'||e.key==='=')zoom(.7);
    else if(e.key==='-')zoom(1/.7);
    else if(e.key==='ArrowLeft')camera.x-=step;
    else if(e.key==='ArrowRight')camera.x+=step;
    else if(e.key==='ArrowUp')camera.y-=step;
    else if(e.key==='ArrowDown')camera.y+=step;
    else return;
    e.preventDefault();draw();
  });
  draw();borders();
  return {getState(){return {...camera,borders:Number($('map-borders').value)};},restore(saved,fitInitially=false){fitPending=fitInitially;silent=true;camera={x:saved.x,y:saved.y,w:saved.w};$('map-borders').value=saved.borders;draw();borders();silent=false;},fitOnNextUpdate(){fitPending=true;},update(next){points=next;$('map-fit').disabled=!points.length;silent=true;if(fitPending&&points.length){fitPending=false;fit();}else draw();silent=false;}};
}
