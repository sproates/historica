interface Entry {id:string;type:string;title:string;startYear:number;endYear:number;point:[number,number]|null}
interface Association {subject:string;place:string;startYear:number;endYear:number;point:[number,number]|null;label:string}
type Point=[number,number];type Polygon=Point[][];
interface Country {properties:{NAME:string;ADM0_A3:string;LABEL_X:number;LABEL_Y:number};geometry:{type:string;coordinates:Polygon|Polygon[]}}
interface Camera {x:number;y:number;w:number;h:number}
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const svg=document.getElementById('map') as unknown as SVGSVGElement;
const ns='http://www.w3.org/2000/svg';
const [history,geography]=await Promise.all([fetch('/data/browser-history.json').then(r=>r.json()),fetch('/data/ne_50m_admin_0_countries.json').then(r=>r.json())]);
const entries:Entry[]=history.data.entities,associations:Association[]=history.data.associations,countries:Country[]=geography.features;
const names=new Map(entries.map(e=>[e.id,e.title]));
const params=new URLSearchParams(location.search);
const number=(key:string,fallback:number)=>{const value=Number(params.get(key));return params.has(key)&&Number.isFinite(value)?value:fallback;};
let start=Math.max(-5500,Math.min(199,number('from',-600)))||1,end=Math.max(start,Math.min(200,number('to',200)))||1;
let selected=params.get('country')||'ITA',area:Camera|null=null,camera:Camera={x:330,y:45,w:150,h:110};
const fromYear=(n:number)=>n<0?n+1:n,toYear=(n:number)=>n<=0?n-1:n;
const year=(n:number)=>`${Math.abs(n).toLocaleString()} ${n<0?'BCE':'CE'}`;
const projected=([lon,lat]:Point):Point=>[(lon+180)*2,(90-lat)*2];
const polygons=(c:Country):Polygon[]=>c.geometry.type==='Polygon'?[c.geometry.coordinates as Polygon]:c.geometry.coordinates as Polygon[];
function inRing(p:Point,ring:Point[]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i]!,b=ring[j]!;if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function contains(c:Country,p:Point){return polygons(c).some(poly=>inRing(p,poly[0]!)&&!poly.slice(1).some(hole=>inRing(p,hole)));}
function countryBounds(c:Country):Camera{
 const label:Point=[c.properties.LABEL_X,c.properties.LABEL_Y];
 const parts=polygons(c);const main=parts.find(poly=>inRing(label,poly[0]!))||parts.reduce((a,b)=>a[0]!.length>b[0]!.length?a:b);
 const points=main[0]!.map(projected),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
 const width=Math.max(16,w*1.35,h*1.8);return{x:x+w/2-width/2,y:y+h/2-width*.35,w:width,h:width*.7};
}
function drawLabels(){
 const group=el('country-labels');group.replaceChildren();if(!svg.clientWidth||!svg.clientHeight)return;
 const scale=Math.max(camera.w/svg.clientWidth,camera.h/svg.clientHeight),boxes:number[][]=[];
 const ordered=[...countries].sort((a,b)=>Number(b.properties.ADM0_A3===selected)-Number(a.properties.ADM0_A3===selected));
 for(const c of ordered){const [x,y]=projected([c.properties.LABEL_X,c.properties.LABEL_Y]);
 if(x<camera.x||x>camera.x+camera.w||y<camera.y||y>camera.y+camera.h)continue;
 const width=c.properties.NAME.length*6.5*scale,height=17*scale,box=[x-width/2,y-height/2,x+width/2,y+height/2];
 if(boxes.some(b=>box[0]!<b[2]!&&box[2]!>b[0]!&&box[1]!<b[3]!&&box[3]!>b[1]!))continue;
 boxes.push(box);const text=makeSvg('text',{x:String(x),y:String(y),'font-size':String(12*scale),'data-country':c.properties.ADM0_A3});text.textContent=c.properties.NAME;group.append(text);
 }
}

function save(){const p=new URLSearchParams({country:selected,from:String(start),to:String(end)});if(area)p.set('area',[area.x,area.y,area.w,area.h].join(','));p.set('view',[camera.x,camera.y,camera.w,camera.h].map(v=>v.toFixed(2)).join(','));p.set('panel',document.body.dataset.panel||'timeline');window.history.replaceState(null,'','?'+p);}
function readCamera(key:string):Camera|null{const parts=params.get(key)?.split(',').map(Number);return parts?.length===4&&parts.every(Number.isFinite)&&parts[2]!>0&&parts[3]!>0?{x:parts[0]!,y:parts[1]!,w:parts[2]!,h:parts[3]!}:null;}
area=readCamera('area');if(area)selected='area';
if(!countries.some(c=>c.properties.ADM0_A3===selected)&&selected!=='area')selected='ITA';
camera=readCamera('view')||(selected==='area'?area!:countryBounds(countries.find(c=>c.properties.ADM0_A3===selected)!));
const select=el<HTMLSelectElement>('country');
select.add(new Option('Selected map area','area'));
for(const c of [...countries].sort((a,b)=>a.properties.NAME.localeCompare(b.properties.NAME)))select.add(new Option(c.properties.NAME,c.properties.ADM0_A3));
function makeSvg(tag:string,attrs:Record<string,string>){const node=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);return node;}
for(const c of countries){const d=polygons(c).map(poly=>poly.map(ring=>ring.map((p,i)=>(i?'L':'M')+projected(p).join(',')).join(' ')+'Z').join(' ')).join(' ');const path=makeSvg('path',{d,'fill-rule':'evenodd','data-country':c.properties.ADM0_A3});const title=makeSvg('title',{});title.textContent=c.properties.NAME;path.append(title);el('countries').append(path);}
function locate(e:Entry){const dated=associations.filter(a=>a.subject===e.id&&a.point&&a.startYear<=end&&a.endYear>=start).map(a=>({point:a.point!,label:a.label,place:names.get(a.place)||a.place}));return dated.length?dated:e.point?[{point:e.point,label:'Recorded reference point',place:''}]:[];}
function matchesPoint(p:Point){if(area){const [x,y]=projected(p);return x>=area.x&&x<=area.x+area.w&&y>=area.y&&y<=area.y+area.h;}const c=countries.find(c=>c.properties.ADM0_A3===selected);return c?contains(c,p):false;}
function rows(){return entries.filter(e=>e.startYear<=end&&e.endYear>=start).map(e=>({entry:e,locations:locate(e).filter(l=>matchesPoint(l.point))})).filter(r=>r.locations.length).sort((a,b)=>a.entry.startYear-b.entry.startYear);}
function drawCamera(){svg.setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);
 const scale=svg.clientWidth&&svg.clientHeight?Math.max(camera.w/svg.clientWidth,camera.h/svg.clientHeight):camera.w/350;
 let visible=0;for(const circle of svg.querySelectorAll('circle')){circle.setAttribute('r',String(scale*7));const x=Number(circle.getAttribute('cx')),y=Number(circle.getAttribute('cy'));if(x>=camera.x&&x<=camera.x+camera.w&&y>=camera.y&&y<=camera.y+camera.h)visible++;}
 if(!el('place-preview').querySelector('a'))el('place-preview').textContent=visible?'Tap a blue marker to see the entry. Several entries may share a location.':el('markers').childElementCount?'No markers in this map view. Use Back to selection to return to the selected place.':'No mapped entries for this area and period. Try Fit available history or wider dates.';
 drawLabels();save();}

function route(e:Entry){return `/${e.type}/${e.id}?from=${start}&to=${end}`;}
function render(){select.value=selected;el('years').textContent=`${year(start)} – ${year(end)}`;for(const [id,value]of [['from',start],['to',end]] as const){el<HTMLInputElement>(id).value=String(value);el(id+'-label').textContent=year(value);}
 el('place-preview').replaceChildren();const c=countries.find(c=>c.properties.ADM0_A3===selected);el('timeline-title').textContent=area?'Selected map area':'Present-day '+c?.properties.NAME;
 el('selection-note').textContent=area?'Histories with recorded locations inside your selected area.':'Histories with recorded locations inside today’s borders. Coverage is incomplete.';
 for(const path of svg.querySelectorAll('[data-country]'))path.classList.toggle('selected',path.getAttribute('data-country')===selected);
 const outline=document.getElementById('area-outline')!;outline.toggleAttribute('hidden',!area);if(area)for(const [key,value]of Object.entries({x:area.x,y:area.y,width:area.w,height:area.h}))outline.setAttribute(key,String(value));
 const list=rows();el('count').textContent=`${list.length} ${list.length===1?'history':'histories'}`;el('map-results').textContent=`${list.length} ${list.length===1?'history':'histories'} in ${area?'the selected map area':c?.properties.NAME} · ${year(start)} – ${year(end)}`;el('return-selection').textContent=area?'Back to selected area':`Back to ${c?.properties.NAME}`;const axis=el('axis');axis.replaceChildren();for(const n of [start,toYear(Math.round((fromYear(start)+fromYear(end))/2)),end]){const span=document.createElement('span');span.textContent=year(n);axis.append(span);}
 el('rows').replaceChildren();el('markers').replaceChildren();
 if(!list.length){const empty=document.createElement('div');empty.className='empty';const h=document.createElement('h3');h.textContent='No matching histories yet';const p=document.createElement('p');p.textContent='Try wider dates or another area. Our location records and historical coverage are incomplete.';empty.append(h,p);el('rows').append(empty);}
 for(const {entry:e,locations}of list){const link=document.createElement('a');link.className='history';link.href=route(e);const heading=document.createElement('div');heading.className='history-top';const title=document.createElement('strong');title.textContent=e.title;const dates=document.createElement('small');dates.textContent=`${year(e.startYear)} – ${year(e.endYear)}`;heading.append(title,dates);const track=document.createElement('div');track.className='track';const bar=document.createElement('span');bar.className='bar';const duration=Math.max(1,fromYear(end)-fromYear(start));bar.style.left=100*(fromYear(Math.max(start,e.startYear))-fromYear(start))/duration+'%';bar.style.width=Math.max(.6,100*(fromYear(Math.min(end,e.endYear))-fromYear(Math.max(start,e.startYear)))/duration)+'%';track.append(bar);const note=document.createElement('span');note.className='location';note.textContent=locations[0]!.place?`Dated association · ${locations[0]!.place}`:'Approximate reference location';link.append(heading,track,note);el('rows').append(link);
 for(const l of locations){const [cx,cy]=projected(l.point);const marker=makeSvg('circle',{cx:String(cx),cy:String(cy),r:String(camera.w/180),'data-entry':e.id,role:'button',tabindex:'0','aria-label':e.title});const title=makeSvg('title',{});title.textContent=e.title;marker.append(title);el('markers').append(marker);}}
 drawCamera();}
function choose(code:string){selected=code;if(code==='area')area={...camera};else{area=null;camera=countryBounds(countries.find(c=>c.properties.ADM0_A3===code)!);}el('place-preview').textContent='Select a dot to identify a history before opening it.';render();}
select.addEventListener('change',()=>choose(select.value));
function windowTo(a:number,b:number){const min=fromYear(-5500),max=fromYear(200);let width=Math.min(max-min,Math.max(1,b-a));a=Math.max(min,Math.min(a,max-width));b=a+width;start=toYear(Math.round(a));end=toYear(Math.round(b));render();}
function zoomTime(factor:number){const a=fromYear(start),b=fromYear(end),mid=(a+b)/2,width=Math.max(5,(b-a)*factor);windowTo(mid-width/2,mid+width/2);}
el('wider').onclick=()=>zoomTime(2);el('closer').onclick=()=>zoomTime(.5);
for(const [id,direction]of [['earlier',-1],['later',1]]as const)el(id).onclick=()=>{const a=fromYear(start),b=fromYear(end),shift=(b-a)/2*direction;windowTo(a+shift,b+shift);};
el('from').oninput=()=>{start=toYear(Math.min(fromYear(end)-1,fromYear(Number(el<HTMLInputElement>('from').value)||-1)));render();};el('to').oninput=()=>{end=toYear(Math.max(fromYear(start)+1,fromYear(Number(el<HTMLInputElement>('to').value)||1)));render();};
el('fit').onclick=()=>{const prior=[start,end];start=-5500;end=200;const all=rows();if(all.length)windowTo(fromYear(Math.min(...all.map(r=>r.entry.startYear))),fromYear(Math.max(...all.map(r=>r.entry.endYear))));else{[start,end]=prior as [number,number];render();}};
function zoomMap(factor:number){const width=Math.max(8,Math.min(720,camera.w*factor)),height=width*camera.h/camera.w;camera={x:camera.x+(camera.w-width)/2,y:camera.y+(camera.h-height)/2,w:width,h:height};drawCamera();}
el('zoom-in').onclick=()=>zoomMap(.7);el('zoom-out').onclick=()=>zoomMap(1/.7);el('world').onclick=()=>{camera={x:0,y:0,w:720,h:360};drawCamera();};el('explore-area').onclick=()=>{choose('area');if(matchMedia('(max-width:800px)').matches)el('tab-timeline').click();};
el('return-selection').onclick=()=>{camera=area?{...area}:countryBounds(countries.find(c=>c.properties.ADM0_A3===selected)!);drawCamera();};
let moved=false;const touches=new Map<number,{x:number;y:number}>();let last:{x:number;y:number;distance:number}|null=null;
function gesture(){const points=[...touches.values()];return{x:points.reduce((n,p)=>n+p.x,0)/points.length,y:points.reduce((n,p)=>n+p.y,0)/points.length,distance:points.length>1?Math.hypot(points[0]!.x-points[1]!.x,points[0]!.y-points[1]!.y):0};}
svg.addEventListener('pointerdown',event=>{touches.set(event.pointerId,{x:event.clientX,y:event.clientY});if(touches.size===1)moved=false;else moved=true;last=gesture();});
svg.addEventListener('pointermove',event=>{if(!touches.has(event.pointerId)||!last)return;touches.set(event.pointerId,{x:event.clientX,y:event.clientY});const now=gesture(),dx=now.x-last.x,dy=now.y-last.y;if(Math.hypot(dx,dy)>2||touches.size>1)moved=true;if(moved){svg.setPointerCapture(event.pointerId);const rect=svg.getBoundingClientRect(),scale=Math.max(camera.w/rect.width,camera.h/rect.height);camera.x-=dx*scale;camera.y-=dy*scale;if(last.distance&&now.distance)zoomMap(last.distance/now.distance);else drawCamera();}last=now;});
for(const type of ['pointerup','pointercancel'] as const)svg.addEventListener(type,event=>{touches.delete(event.pointerId);last=touches.size?gesture():null;});
svg.addEventListener('wheel',event=>{event.preventDefault();if(event.ctrlKey||event.metaKey)zoomMap(Math.exp(event.deltaY*.01));else{camera.x+=event.deltaX*camera.w/svg.clientWidth;camera.y+=event.deltaY*camera.h/svg.clientHeight;drawCamera();}},{passive:false});
function identify(id:string){const e=entries.find(e=>e.id===id)!;const title=document.createElement('strong');title.textContent=e.title;const link=document.createElement('a');link.href=route(e);link.textContent='Open this history →';el('place-preview').replaceChildren(title,link);}
svg.addEventListener('click',event=>{if(moved){moved=false;return;}const target=event.target as Element;const marker=target.closest('[data-entry]');if(marker)identify(marker.getAttribute('data-entry')!);else{const country=target.closest('[data-country]');if(country)choose(country.getAttribute('data-country')!);}});
svg.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){const id=(event.target as Element).getAttribute('data-entry');if(id){event.preventDefault();identify(id);}}});
for(const panel of ['timeline','map'])el('tab-'+panel).onclick=()=>{document.body.dataset.panel=panel;for(const key of ['timeline','map'])el('tab-'+key).setAttribute('aria-pressed',String(key===panel));drawCamera();};
if(params.get('panel')==='map')el('tab-map').click();
el('theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';};
window.addEventListener('resize',drawCamera);
render();
export {};
