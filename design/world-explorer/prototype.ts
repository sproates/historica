import * as L from 'leaflet';
import {placesFor,uniqueEntries,year,ordinal,calendar,type Entry,type Association,type Place} from './model.js';
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const mobile=()=>matchMedia('(max-width:720px)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const query=new URLSearchParams(location.search);
const numeric=(key:string,fallback:number)=>{const value=Number(query.get(key));return query.has(key)&&Number.isFinite(value)?value:fallback;};
let from=Math.max(-5500,Math.min(199,numeric('from',-5500)))||-1;
let to=Math.max(from,Math.min(200,numeric('to',200)))||1;
let entries:Entry[]=[],associations:Association[]=[],places:Place[]=[];
interface Country {properties:{NAME:string;ADM0_A3:string;LABEL_X:number;LABEL_Y:number};geometry:{type:string;coordinates:number[][][]|number[][][][]}}
let countries:Country[]=[];
let selected:Place[]|null=null,selectionTitle='',currentPlaces:Place[]=[];
let markers=L.layerGroup(),homeBounds:L.LatLngBounds|null=null;
let sheetSnap:'peek'|'middle'|'full'='middle';
let settling=false,ready=false;
const map=L.map('map',{zoomControl:false,attributionControl:false,inertia:true,inertiaDeceleration:2200,inertiaMaxSpeed:1800,touchZoom:true,zoomSnap:.25,zoomDelta:.75,worldCopyJump:true,minZoom:2,maxZoom:17,zoomAnimation:!reduced,fadeAnimation:!reduced,markerZoomAnimation:!reduced});
const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,keepBuffer:3,updateWhenIdle:true,referrerPolicy:'strict-origin-when-cross-origin'}).addTo(map);
let tileErrors=0;tiles.on('tileerror',()=>{if(++tileErrors>=3)el('map-warning').hidden=false;});tiles.on('tileload',()=>{tileErrors=0;el('map-warning').hidden=true;});
markers.addTo(map);
function sheetHeight(snap:typeof sheetSnap){const height=el('explorer').clientHeight;return snap==='peek'?150:snap==='middle'?Math.min(selected?430:340,height*(selected ? .52 : .44)):Math.max(150,height-118);}
function sizeSheet(snap:typeof sheetSnap){
 sheetSnap=snap;document.documentElement.style.setProperty('--sheet-height',`${sheetHeight(snap)}px`);el('sheet').dataset.snap=snap;
 const expanded=snap==='full';el('sheet-handle').setAttribute('aria-expanded',String(expanded));el('sheet-handle').setAttribute('aria-label',expanded?'Collapse history panel':'Expand history panel');
 el('sheet-hint').textContent=expanded?'Pull down for more map':'Pull up for more';el('sheet-toggle').textContent=expanded?'More map ↓':'Expand list ↑';
}

function save(){if(!ready)return;const center=map.getCenter();const p=new URLSearchParams({from:String(from),to:String(to),lat:center.lat.toFixed(5),lng:center.lng.toFixed(5),zoom:map.getZoom().toFixed(2)});if(homeBounds)p.set('home',homeBounds.toBBoxString());if(selected)p.set('places',selected.map(p=>p.key).join(';'));window.history.replaceState(null,'','?'+p);}
function dateUI(){el('date-label').textContent=from===-5500&&to===200?'All dates · 5500 BCE–200 CE':`${year(from)} – ${year(to)}`;el('axis').replaceChildren();for(const n of [from,to]){const label=document.createElement('span');label.textContent=year(n);el('axis').append(label);}}
function openRoute(e:Entry){return `/${e.type}/${e.id}?from=${from}&to=${to}`;}
function listEntry(e:Entry){
 const article=document.createElement('article');article.className='entry';
 const link=document.createElement('a');link.href=openRoute(e);
 const meta=document.createElement('p');meta.className='entry-meta';meta.textContent=e.type;
 const h=document.createElement('h2');h.textContent=e.title;
 const date=document.createElement('span');date.className='date';date.textContent=`${year(e.startYear)} – ${year(e.endYear)}`;
 const track=document.createElement('div');track.className='bar-track';track.setAttribute('aria-hidden','true');const bar=document.createElement('span');const width=Math.max(1,ordinal(to)-ordinal(from));bar.style.left=`${100*(ordinal(Math.max(from,e.startYear))-ordinal(from))/width}%`;bar.style.width=`${Math.max(.7,100*(ordinal(Math.min(to,e.endYear))-ordinal(Math.max(from,e.startYear)))/width)}%`;track.append(bar);
 const description=document.createElement('p');description.className='description';description.textContent=e.description?.split('\n')[0]||'';link.append(meta,h,date,track,description);
 const foot=document.createElement('div');foot.className='entry-foot';const show=document.createElement('button');show.textContent='Show on map';show.onclick=()=>{const found=places.filter(p=>p.entries.some(item=>item.id===e.id));if(!found.length)return;selected=found;selectionTitle=found.length===1?found[0]!.name:e.title;sizeSheet('middle');fitPlaces(found);renderList();};const open=document.createElement('a');open.href=openRoute(e);open.textContent='Read history ↗';foot.append(show,open);article.append(link,foot);return article;
}
function renderList(){
 const source=selected||currentPlaces,items=uniqueEntries(source);
 el('context').textContent=selected?(source.length===1?'AT THIS PLACE':'AROUND THESE PLACES'):'HISTORY IN THIS MAP AREA';
 el('place-title').textContent=selected?selectionTitle:'What happened here';
 el('result-count').textContent=`${items.length} ${items.length===1?'entry':'entries'} · ${source.length} ${source.length===1?'place':'places'}`;
 el('close-place').hidden=!selected;el('selection-actions').hidden=!selected;
 const results=el('results');results.replaceChildren(...items.map(listEntry));
 if(!items.length){const empty=document.createElement('div');empty.className='empty';const heading=document.createElement('h2');heading.textContent='There’s more to uncover';const p=document.createElement('p');p.textContent='No mapped entries here for these dates. Try a wider area or another period. Our collection is still growing.';const dates=document.createElement('button');dates.textContent='Show all dates';dates.onclick=()=>applyPeriod(-5500,200);const placesButton=document.createElement('button');placesButton.textContent='Find a place';placesButton.onclick=()=>{el<HTMLInputElement>('search').focus();search('');};empty.append(heading,p,dates,placesButton);results.append(empty);}
 dateUI();save();
}
interface Cluster {places:Place[];x:number;y:number;latlng:L.LatLng}
function updateMap(){
 if(!ready)return;
 const bounds=map.getBounds();currentPlaces=places.filter(p=>bounds.contains([p.point[1],p.point[0]]));
 const clusters:Cluster[]=[];
 for(const place of currentPlaces){const ll=L.latLng(place.point[1],place.point[0]),point=map.latLngToContainerPoint(ll);const cluster=clusters.find(c=>Math.hypot(c.x-point.x,c.y-point.y)<(mobile()?58:48));if(cluster){cluster.places.push(place);}else clusters.push({places:[place],x:point.x,y:point.y,latlng:ll});}
 markers.clearLayers();const labelBoxes:{x:number;y:number}[]=[];
 for(const cluster of clusters){
  const list=uniqueEntries(cluster.places);const primary=[...cluster.places].sort((a,b)=>b.entries.length-a.entries.length)[0]!;const name=cluster.places.length===1?primary.name:`${primary.name} + ${cluster.places.length-1}`;
  const icon=document.createElement('div');const disc=document.createElement('span');disc.className='pin-disc';disc.textContent=String(list.length);icon.append(disc);
  if(labelBoxes.every(p=>Math.abs(p.x-cluster.x)>150||Math.abs(p.y-cluster.y)>70)){const label=document.createElement('span');label.className='pin-label';label.textContent=name;icon.append(label);labelBoxes.push({x:cluster.x,y:cluster.y});}
  const active=selected&&cluster.places.some(p=>selected!.some(s=>s.key===p.key));
  const marker=L.marker(cluster.latlng,{icon:L.divIcon({className:`history-pin${active?' selected':''}`,html:icon,iconSize:[42,42],iconAnchor:[21,21]}),title:`${name}: ${list.length} entries`,alt:name,keyboard:true,riseOnHover:true}).addTo(markers);
  const choose=()=>{selected=cluster.places;selectionTitle=name;sizeSheet('middle');el('sheet-scroll').scrollTop=0;renderList();updateMarkerSelection();};
  marker.on('click',choose);const element=marker.getElement();element?.setAttribute('aria-label',`${name}, ${list.length} entries. Show histories.`);element?.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();choose();}});
 }
 renderList();
}
function updateMarkerSelection(){// Rebuild only after a completed gesture or explicit selection, never during dragging.
 updateMap();
}
function padding():L.FitBoundsOptions{return {paddingTopLeft:mobile()?[40,125]:[420,90],paddingBottomRight:mobile()?[40,sheetHeight('middle')+35]:[65,45],maxZoom:11,animate:!reduced,duration:.65};}
function fitPlaces(points:Place[]){if(!points.length)return;const bounds=L.latLngBounds(points.map(p=>[p.point[1],p.point[0]] as L.LatLngTuple));map.flyToBounds(bounds,padding());}
function fitCountry(c:Country){const [lon,lat]=[c.properties.LABEL_X,c.properties.LABEL_Y];const polygons=(c.geometry.type==='Polygon'?[c.geometry.coordinates]:c.geometry.coordinates) as number[][][][];const ring=polygons.map(p=>p[0]!).find(r=>inside([lon,lat],r))||polygons[0]![0]!;const bounds=L.latLngBounds(ring.map(p=>[p[1]!,p[0]!] as L.LatLngTuple));homeBounds=bounds;selected=null;sizeSheet('middle');map.flyToBounds(bounds,{...padding(),maxZoom:8});}
function inside(p:number[],ring:number[][]){let value=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i]!,b=ring[j]!;if((a[1]!>p[1]!)!==(b[1]!>p[1]!)&&p[0]!<(b[0]!-a[0]!)*(p[1]!-a[1]!)/(b[1]!-a[1]!)+a[0]!)value=!value;}return value;}
function closeSearch(){el('search-results').hidden=true;el('search').setAttribute('aria-expanded','false');el<HTMLInputElement>('search').blur();}
function search(term:string){const box=el('search-results');box.replaceChildren();box.hidden=false;el('search').setAttribute('aria-expanded','true');const q=term.trim().toLowerCase();
 const countryMatches=countries.filter(c=>q?c.properties.NAME.toLowerCase().includes(q):['GBR','EGY','GRC','ITA','CHN'].includes(c.properties.ADM0_A3)).slice(0,6);
 const all=placesFor(entries,associations,-5500,200);const matches=all.filter(p=>q&&(p.name.toLowerCase().includes(q)||p.entries.some(e=>e.title.toLowerCase().includes(q)))).slice(0,7);
 function add(title:string,subtitle:string,action:()=>void){const button=document.createElement('button');button.className='search-result';const symbol=document.createElement('span');symbol.className='search-symbol';symbol.textContent='⌖';const text=document.createElement('span');const name=document.createElement('strong');name.textContent=title;const detail=document.createElement('small');detail.textContent=subtitle;text.append(name,detail);button.append(symbol,text);button.onclick=()=>{el<HTMLInputElement>('search').value='';el('clear-search').hidden=true;closeSearch();action();};box.append(button);}
 for(const c of countryMatches)add(c.properties.NAME,'Present-day country',()=>fitCountry(c));
 for(const p of matches){const dated=places.find(x=>x.key===p.key);add(p.name,`${p.entries.length} ${p.entries.length===1?'entry':'entries'}${dated?'':' · outside these dates'}`,()=>{if(!dated)applyPeriod(-5500,200);const match=places.find(x=>x.key===p.key)!;selected=[match];selectionTitle=match.name;sizeSheet('middle');homeBounds=L.latLngBounds([match.point[1],match.point[0]],[match.point[1],match.point[0]]);fitPlaces([match]);renderList();});}
 if(!box.childElementCount){const note=document.createElement('p');note.className='search-empty';note.textContent='No matching country or recorded place.';box.append(note);}
}
el<HTMLInputElement>('search').addEventListener('input',e=>{const value=(e.target as HTMLInputElement).value;el('clear-search').hidden=!value;search(value);});el('search').addEventListener('focus',()=>{if(ready)search(el<HTMLInputElement>('search').value);});el('search').addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='ArrowDown'){e.preventDefault();el('search-results').querySelector('button')?.focus();}});el('search-results').addEventListener('keydown',e=>{const buttons=[...el('search-results').querySelectorAll('button')],index=buttons.indexOf(document.activeElement as HTMLButtonElement);if(e.key==='Escape')closeSearch();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});el('clear-search').onclick=()=>{el<HTMLInputElement>('search').value='';search('');el<HTMLInputElement>('search').focus();};document.addEventListener('pointerdown',e=>{if(!(e.target as Element).closest('.search-wrap'))closeSearch();});
function clearSelection(){selected=null;updateMap();}el('close-place').onclick=clearSelection;el('clear-place').onclick=clearSelection;el('zoom-place').onclick=()=>{if(selected)fitPlaces(selected);};
el('zoom-in').onclick=()=>map.zoomIn();el('zoom-out').onclick=()=>map.zoomOut();el('reset-map').onclick=()=>{selected=null;sizeSheet('middle');if(homeBounds)map.flyToBounds(homeBounds,padding());};el('world').onclick=()=>{selected=null;sizeSheet('peek');map.flyTo([25,15],2,{animate:!reduced,duration:.8});};
map.on('dragstart',()=>{selected=null;settling=true;closeSearch();if(mobile()&&sheetSnap==='full')sizeSheet('middle');el('result-count').textContent='Looking around…';});map.on('zoomstart',()=>{settling=true;});map.on('moveend',()=>{settling=false;updateMap();});map.on('click',()=>{if(selected)clearSelection();});
function applyPeriod(a:number,b:number){from=a;to=b;selected=null;places=placesFor(entries,associations,from,to);el<HTMLDialogElement>('dates-dialog').close();updateMap();}
function zoomPeriod(factor:number){const a=ordinal(from),b=ordinal(to),width=Math.min(5699,Math.max(10,(b-a)*factor)),start=Math.max(-5499,Math.min((a+b-width)/2,200-width));applyPeriod(calendar(Math.round(start)),calendar(Math.round(start+width)));}
el('wider-period').onclick=()=>zoomPeriod(2);el('closer-period').onclick=()=>zoomPeriod(.5);
function dateFields(){for(const [prefix,value]of [['start',from],['end',to]]as const){el<HTMLInputElement>(prefix+'-number').value=String(Math.abs(value));el<HTMLSelectElement>(prefix+'-era').value=value<0?'BCE':'CE';}el('date-error').textContent='';}
el('dates-button').onclick=()=>{dateFields();el<HTMLDialogElement>('dates-dialog').showModal();};for(const button of document.querySelectorAll<HTMLButtonElement>('[data-range]'))button.onclick=()=>{const [a,b]=button.dataset.range!.split(',').map(Number);applyPeriod(a!,b!);};el('apply-dates').onclick=()=>{const a=Number(el<HTMLInputElement>('start-number').value)*(el<HTMLSelectElement>('start-era').value==='BCE'?-1:1),b=Number(el<HTMLInputElement>('end-number').value)*(el<HTMLSelectElement>('end-era').value==='BCE'?-1:1);if(!Number.isInteger(a)||!Number.isInteger(b)||!a||!b||a>b||a< -5500||b>200){el('date-error').textContent='Choose a period between 5500 BCE and 200 CE, with the start before the end.';return;}applyPeriod(a,b);};
el('theme').onclick=()=>{const dark=document.documentElement.classList.toggle('dark');el('theme').textContent=dark?'☀':'☾';el('theme').setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');};
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
 document.documentElement.style.setProperty('--sheet-height',`${Math.max(sheetHeight('peek'),Math.min(sheetHeight('full'),initialHeight+delta))}px`);
});
grab.addEventListener('pointerup',e=>{
 if(dragStart===null)return;
 const delta=dragStart-e.clientY,velocity=delta/Math.max(1,performance.now()-dragTime);dragStart=null;el('sheet').classList.remove('dragging');
 if(!dragged){sizeSheet(tappedHandle?(sheetSnap==='full'?'middle':'full'):sheetSnap);return;}
 const height=el('sheet').getBoundingClientRect().height,full=sheetHeight('full'),middle=sheetHeight('middle');
 const snap=Math.abs(velocity)>.45?(velocity>0?'full':'peek'):height>(full+middle)/2?'full':height<(sheetHeight('peek')+middle)/2?'peek':'middle';
 sizeSheet(snap);
});
grab.addEventListener('pointercancel',()=>{dragStart=null;el('sheet').classList.remove('dragging');sizeSheet(sheetSnap);});
handle.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();sizeSheet(e.key==='ArrowDown'?'peek':sheetSnap==='full'?'middle':'full');}});
el('sheet-toggle').onclick=()=>sizeSheet(sheetSnap==='full'?'middle':'full');

window.addEventListener('resize',()=>{sizeSheet(sheetSnap);map.invalidateSize({pan:true,animate:false});if(!settling)updateMap();});
sizeSheet('middle');dateUI();
try{
 const [history,geography]=await Promise.all([fetch('/data/browser-history.json').then(r=>{if(!r.ok)throw Error('History unavailable');return r.json();}),fetch('/data/ne_50m_admin_0_countries.json').then(r=>{if(!r.ok)throw Error('Countries unavailable');return r.json();})]);
 entries=history.data.entities;associations=history.data.associations;countries=geography.features;places=placesFor(entries,associations,from,to);ready=true;el('loading').hidden=true;
 const initial=countries.find(c=>c.properties.ADM0_A3===(query.get('country')||'GBR'))||countries.find(c=>c.properties.ADM0_A3==='GBR')!;
 // fit without animation on first paint; old prototype URLs retain country and dates.
 const polys=(initial.geometry.type==='Polygon'?[initial.geometry.coordinates]:initial.geometry.coordinates) as number[][][][];
 const ring=polys.map(p=>p[0]!).find(r=>inside([initial.properties.LABEL_X,initial.properties.LABEL_Y],r))||polys[0]![0]!;
 homeBounds=L.latLngBounds(ring.map(p=>[p[1]!,p[0]!] as L.LatLngTuple));
 const savedHome=query.get('home')?.split(',').map(Number);if(savedHome?.length===4&&savedHome.every(Number.isFinite)&&Math.abs(savedHome[0]!)<=180&&Math.abs(savedHome[2]!)<=180&&Math.abs(savedHome[1]!)<=85&&Math.abs(savedHome[3]!)<=85&&savedHome[0]!<=savedHome[2]!&&savedHome[1]!<=savedHome[3]!)homeBounds=L.latLngBounds([savedHome[1]!,savedHome[0]!],[savedHome[3]!,savedHome[2]!]);
 if(query.has('lat')&&query.has('lng'))map.setView([Math.max(-80,Math.min(80,numeric('lat',54))),Math.max(-180,Math.min(180,numeric('lng',-3)))],Math.max(2,Math.min(17,numeric('zoom',5))),{animate:false});else map.fitBounds(homeBounds,{...padding(),animate:false});
 if(query.has('places')){const keys=query.get('places')!.split(';');selected=places.filter(p=>keys.includes(p.key));if(!selected.length)selected=null;else {const primary=[...selected].sort((a,b)=>b.entries.length-a.entries.length)[0]!;selectionTitle=selected.length===1?primary.name:`${primary.name} + ${selected.length-1}`;}}
 updateMap();
}catch(error){el('loading').textContent='Could not load the history collection. Reload to try again.';el('result-count').textContent='History unavailable';console.error(error);}
