import * as L from 'leaflet';
import {explorerPeriod,type CountrySearch} from './state.js';
import {bindSheet} from './sheet.js';
import {rememberExplorer} from './return-state.js';
import {placesFor,uniqueEntries,year,ordinal,calendar,type Entry,type Association,type Place} from './model.js';
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const mobile=()=>matchMedia('(max-width:720px)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const query=new URLSearchParams(location.search);
const base=new URL(document.baseURI).pathname;
const sitePath=(path:string)=>base+path.replace(/^\//,'');
const numeric=(key:string,fallback:number)=>{const value=Number(query.get(key));return query.has(key)&&Number.isFinite(value)?value:fallback;};
let {from,to}=explorerPeriod(query);
let mode=query.get('view')==='browse'?'browse':'map';
let browseLimit=24;
let entries:Entry[]=[],associations:Association[]=[],places:Place[]=[];

let countries:CountrySearch[]=[];
let countryRequest:Promise<void>|undefined,countryFailed=false;
function loadCountries(){
 if(countryRequest)return countryRequest;
 countryRequest=(async()=>{
  try{const response=await fetch(sitePath('data/country-search.json'));if(!response.ok)throw Error('Countries unavailable');countries=await response.json();}
  catch{countryFailed=true;}
  if(document.activeElement===el('search'))search(el<HTMLInputElement>('search').value);
 })();
 return countryRequest;
}
let selected:Place[]|null=null,selectionTitle='',currentPlaces:Place[]=[];
let markers=L.layerGroup(),homeBounds:L.LatLngBounds|null=null;
let sheetSnap:'peek'|'middle'|'full'='middle';
let settling=false,ready=false,cameraReady=false;
const markOnce=(name:string)=>{if(!performance.getEntriesByName(name).length)performance.mark(name);};
const map=L.map('map',{zoomControl:false,attributionControl:false,inertia:true,inertiaDeceleration:2200,inertiaMaxSpeed:1800,touchZoom:true,zoomSnap:.25,zoomDelta:.75,worldCopyJump:true,minZoom:2,maxZoom:17,zoomAnimation:!reduced,fadeAnimation:!reduced,markerZoomAnimation:!reduced});
let tiles:L.TileLayer|undefined,providerRequest:Promise<void>|undefined;
function loadBasemap(){
 if(tiles){if(mode==='map')tiles.addTo(map);return;}
 if(providerRequest)return;
 providerRequest=(async()=>{
  try{
   const response=await fetch(sitePath('data/map-service.json'));if(!response.ok)throw Error('Map service unavailable');
   const config:unknown=await response.json();
   if(!config||typeof config!=='object')throw Error('Invalid map service');
   const {tileUrl,credit,creditUrl,maxZoom}=config as Record<string,unknown>;
   if(typeof tileUrl!=='string'||!tileUrl.startsWith('https://')||typeof credit!=='string'||typeof creditUrl!=='string'||!creditUrl.startsWith('https://'))throw Error('Invalid map service');
   const attribution=el<HTMLAnchorElement>('tile-credit');attribution.textContent=credit;attribution.href=creditUrl;
   tiles=L.tileLayer(tileUrl,{maxZoom:typeof maxZoom==='number'?Math.max(2,Math.min(19,maxZoom)):19,keepBuffer:2,updateWhenIdle:true,referrerPolicy:'strict-origin-when-cross-origin'});
   tiles.once('tileload',()=>markOnce('historica-map-first-tile'));
   let errors=0;tiles.on('tileerror',()=>{if(++errors>=3)el('map-warning').hidden=false;});tiles.on('tileload',()=>{errors=0;el('map-warning').hidden=true;});
   if(mode==='map')tiles.addTo(map);
  }catch{el('map-warning').hidden=false;}
 })();
}
markers.addTo(map);
function sheetHeight(snap:typeof sheetSnap){const height=el('explorer').clientHeight;return snap==='peek'?150:snap==='middle'?Math.min(selected?430:340,height*(selected ? .52 : .44)):Math.max(150,height-118);}
function sizeSheet(snap:typeof sheetSnap){
 sheetSnap=snap;document.documentElement.style.setProperty('--sheet-height',`${sheetHeight(snap)}px`);el('sheet').dataset.snap=snap;
 const expanded=snap==='full';el('sheet-handle').setAttribute('aria-expanded',String(expanded));el('sheet-handle').setAttribute('aria-label',expanded?'Collapse history panel':'Expand history panel');
 el('sheet-hint').textContent=expanded?'Pull down for more map':'Pull up for more';el('sheet-toggle').textContent=expanded?'More map ↓':'Expand list ↑';
}

function save(){if(!ready)return;const p=new URLSearchParams({from:String(from),to:String(to)});if(cameraReady){const center=map.getCenter().wrap();p.set('lat',center.lat.toFixed(5));p.set('lng',center.lng.toFixed(5));p.set('zoom',map.getZoom().toFixed(2));}else for(const key of ['lat','lng','zoom'])if(query.has(key))p.set(key,query.get(key)!);if(mode==='browse')p.set('view','browse');const bq=el<HTMLInputElement>('browse-query').value;if(bq)p.set('q',bq);const kind=el<HTMLSelectElement>('browse-kind').value;if(kind!=='all')p.set('type',kind);if(el<HTMLInputElement>('browse-dated').checked)p.set('dated','1');if(homeBounds)p.set('home',homeBounds.toBBoxString());if(selected)p.set('places',selected.map(p=>p.key).join(';'));window.history.replaceState(null,'','?'+p);rememberExplorer(base+'?'+p);}
function dateUI(){el('date-label').textContent=from===-5500&&to===200?'All dates · 5500 BCE–200 CE':`${year(from)} – ${year(to)}`;el('browse-dates').textContent=`${year(from)} – ${year(to)}`;el('axis').replaceChildren();for(const n of [from,to]){const label=document.createElement('span');label.textContent=year(n);el('axis').append(label);}}
function openRoute(e:Entry){return sitePath(`/${e.type}/${e.id}/?from=${from}&to=${to}`);}
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
 if(!ready||mode==='browse')return;
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
 renderList();markOnce('historica-map-results-ready');
}
function updateMarkerSelection(){// Rebuild only after a completed gesture or explicit selection, never during dragging.
 updateMap();
}
function padding():L.FitBoundsOptions{return {paddingTopLeft:mobile()?[40,125]:[420,90],paddingBottomRight:mobile()?[40,sheetHeight('middle')+35]:[65,45],maxZoom:11,animate:!reduced,duration:.65};}
function fitPlaces(points:Place[]){if(!points.length)return;const bounds=L.latLngBounds(points.map(p=>[p.point[1],p.point[0]] as L.LatLngTuple));map.flyToBounds(bounds,padding());}
function fitCountry(c:CountrySearch){const [west,south,east,north]=c.bounds;const bounds=L.latLngBounds([south,west],[north,east]);homeBounds=bounds;selected=null;sizeSheet('middle');map.flyToBounds(bounds,{...padding(),maxZoom:8});}

function closeSearch(){el('search-results').hidden=true;el('search').setAttribute('aria-expanded','false');el<HTMLInputElement>('search').blur();}
function search(term:string){const box=el('search-results');box.replaceChildren();box.hidden=false;el('search').setAttribute('aria-expanded','true');const q=term.trim().toLowerCase();
 const countryMatches=countries.filter(c=>q?c.name.toLowerCase().includes(q):['GBR','EGY','GRC','ITA','CHN'].includes(c.code)).slice(0,6);
 const all=placesFor(entries,associations,-5500,200);const matches=all.filter(p=>q&&(p.name.toLowerCase().includes(q)||p.entries.some(e=>e.title.toLowerCase().includes(q)))).slice(0,7);
 function add(title:string,subtitle:string,action:()=>void){const button=document.createElement('button');button.className='search-result';const symbol=document.createElement('span');symbol.className='search-symbol';symbol.textContent='⌖';const text=document.createElement('span');const name=document.createElement('strong');name.textContent=title;const detail=document.createElement('small');detail.textContent=subtitle;text.append(name,detail);button.append(symbol,text);button.onclick=()=>{el<HTMLInputElement>('search').value='';el('clear-search').hidden=true;closeSearch();action();};box.append(button);}
 for(const c of countryMatches)add(c.name,'Present-day country',()=>fitCountry(c));
 for(const p of matches){const dated=places.find(x=>x.key===p.key);add(p.name,`${p.entries.length} ${p.entries.length===1?'entry':'entries'}${dated?'':' · outside these dates'}`,()=>{if(!dated)applyPeriod(-5500,200);const match=places.find(x=>x.key===p.key)!;selected=[match];selectionTitle=match.name;sizeSheet('middle');homeBounds=L.latLngBounds([match.point[1],match.point[0]],[match.point[1],match.point[0]]);fitPlaces([match]);renderList();});}
 if(!countries.length){const note=document.createElement('p');note.className='search-empty';note.textContent=countryFailed?'Country search is unavailable. Historical places are still searchable.':'Loading countries…';box.append(note);}
 if(!box.childElementCount){const note=document.createElement('p');note.className='search-empty';note.textContent='No matching country or recorded place.';box.append(note);}
}
el<HTMLInputElement>('search').addEventListener('input',e=>{const value=(e.target as HTMLInputElement).value;el('clear-search').hidden=!value;search(value);});el('search').addEventListener('focus',()=>{void loadCountries();search(el<HTMLInputElement>('search').value);});el('search').addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='ArrowDown'){e.preventDefault();el('search-results').querySelector('button')?.focus();}});el('search-results').addEventListener('keydown',e=>{const buttons=[...el('search-results').querySelectorAll('button')],index=buttons.indexOf(document.activeElement as HTMLButtonElement);if(e.key==='Escape')closeSearch();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});el('clear-search').onclick=()=>{el<HTMLInputElement>('search').value='';search('');el<HTMLInputElement>('search').focus();};document.addEventListener('pointerdown',e=>{if(!(e.target as Element).closest('.search-wrap'))closeSearch();});
function clearSelection(){selected=null;updateMap();}el('close-place').onclick=clearSelection;el('clear-place').onclick=clearSelection;el('zoom-place').onclick=()=>{if(selected)fitPlaces(selected);};
el('zoom-in').onclick=()=>map.zoomIn();el('zoom-out').onclick=()=>map.zoomOut();el('reset-map').onclick=()=>{selected=null;sizeSheet('middle');if(homeBounds)map.flyToBounds(homeBounds,padding());};el('world').onclick=()=>{selected=null;sizeSheet('peek');map.flyTo([25,15],2,{animate:!reduced,duration:.8});};
map.on('dragstart',()=>{selected=null;settling=true;closeSearch();if(mobile()&&sheetSnap==='full')sizeSheet('middle');el('result-count').textContent='Looking around…';});map.on('zoomstart',()=>{settling=true;});map.on('moveend',()=>{settling=false;updateMap();});map.on('click',()=>{if(selected)clearSelection();});
function applyPeriod(a:number,b:number){from=a;to=b;selected=null;places=placesFor(entries,associations,from,to);el<HTMLDialogElement>('dates-dialog').close();dateUI();if(mode==='browse')renderBrowse();else updateMap();}
function zoomPeriod(factor:number){const a=ordinal(from),b=ordinal(to),width=Math.min(5699,Math.max(10,(b-a)*factor)),start=Math.max(-5499,Math.min((a+b-width)/2,200-width));applyPeriod(calendar(Math.round(start)),calendar(Math.round(start+width)));}
el('wider-period').onclick=()=>zoomPeriod(2);el('closer-period').onclick=()=>zoomPeriod(.5);
function dateFields(){for(const [prefix,value]of [['start',from],['end',to]]as const){el<HTMLInputElement>(prefix+'-number').value=String(Math.abs(value));el<HTMLSelectElement>(prefix+'-era').value=value<0?'BCE':'CE';}el('date-error').textContent='';}
el('dates-button').onclick=()=>{dateFields();el<HTMLDialogElement>('dates-dialog').showModal();};for(const button of document.querySelectorAll<HTMLButtonElement>('[data-range]'))button.onclick=()=>{const [a,b]=button.dataset.range!.split(',').map(Number);applyPeriod(a!,b!);};el('apply-dates').onclick=()=>{const a=Number(el<HTMLInputElement>('start-number').value)*(el<HTMLSelectElement>('start-era').value==='BCE'?-1:1),b=Number(el<HTMLInputElement>('end-number').value)*(el<HTMLSelectElement>('end-era').value==='BCE'?-1:1);if(!Number.isInteger(a)||!Number.isInteger(b)||!a||!b||a>b||a< -5500||b>200){el('date-error').textContent='Choose a period between 5500 BCE and 200 CE, with the start before the end.';return;}applyPeriod(a,b);};

bindSheet(el,mobile,sheetHeight,()=>sheetSnap,sizeSheet);

window.addEventListener('resize',()=>{sizeSheet(sheetSnap);if(mode==='map'){map.invalidateSize({pan:true,animate:false});if(!settling)updateMap();}});
function renderBrowse(){
 if(!ready)return;
 const term=el<HTMLInputElement>('browse-query').value.trim().toLocaleLowerCase(),kind=el<HTMLSelectElement>('browse-kind').value,dated=el<HTMLInputElement>('browse-dated').checked;
 const matches=entries.filter(e=>(kind==='all'||(kind==='place'?['area','city','state','country'].includes(e.type):e.type===kind))&&(!dated||(e.startYear<=to&&e.endYear>=from))&&(!term||`${e.title} ${e.description||''}`.toLocaleLowerCase().includes(term))).sort((a,b)=>Number(b.title.toLocaleLowerCase().includes(term))-Number(a.title.toLocaleLowerCase().includes(term))||a.title.localeCompare(b.title));
 el('browse-clear').hidden=!term;el('starting-points').hidden=!!term||kind!=='all'||dated;
 el('browse-results-heading').textContent=term?'Search results':'Browse the collection';
 el('browse-status').textContent=`${matches.length} ${matches.length===1?'entry':'entries'}${dated?' within these dates':' across the collection'}`;
 const list=el('browse-results');list.removeAttribute('data-initial');delete document.documentElement.dataset.browseFiltered;list.replaceChildren();
 for(const e of matches.slice(0,browseLimit)){const a=document.createElement('a');a.className='browse-entry';a.href=dated?openRoute(e):sitePath(`/${e.type}/${e.id}/`);const title=document.createElement('strong');title.textContent=e.title;const dates=document.createElement('small');dates.textContent=`${e.type} · ${year(e.startYear)} – ${year(e.endYear)}`;const summary=document.createElement('p');const text=e.description?.split('\n')[0]||'';summary.textContent=text.length>190?text.slice(0,187)+'…':text;a.append(title,dates,summary);list.append(a);}
 if(!matches.length){const p=document.createElement('p');p.textContent='No matching entries. Try another name, or turn off the date filter.';list.append(p);}
 el('browse-more').hidden=matches.length<=browseLimit;markOnce('historica-browse-ready');save();
}
function switchView(next:string){
 mode=next;document.documentElement.dataset.explorerView=mode;closeSearch();map.stop();el('explorer').hidden=mode==='browse';el('browse').hidden=mode==='map';if(mode==='map'){sizeSheet(sheetSnap);ensureCamera();loadBasemap();}else if(tiles)map.removeLayer(tiles);
 el('view-map').setAttribute('aria-pressed',String(mode==='map'));el('view-browse').setAttribute('aria-pressed',String(mode==='browse'));
 if(mode==='map'){map.invalidateSize({pan:true,animate:false});updateMap();}else renderBrowse();save();
}
el('view-map').onclick=()=>switchView('map');el('view-browse').onclick=()=>switchView('browse');
el<HTMLInputElement>('browse-query').value=(query.get('q')||'').slice(0,200);
const initialKind=query.get('type')||'all';if(['all','person','place','period','event'].includes(initialKind))el<HTMLSelectElement>('browse-kind').value=initialKind;
el<HTMLInputElement>('browse-dated').checked=query.get('dated')==='1';
for(const id of ['browse-query','browse-kind','browse-dated'])el(id).addEventListener(id==='browse-query'?'input':'change',()=>{browseLimit=24;renderBrowse();});
el('browse-clear').onclick=()=>{el<HTMLInputElement>('browse-query').value='';browseLimit=24;renderBrowse();el('browse-query').focus();};
el('browse-more').onclick=()=>{browseLimit+=24;renderBrowse();};
el('browse-dates').onclick=()=>{dateFields();el<HTMLDialogElement>('dates-dialog').showModal();};
homeBounds=L.latLngBounds([26,-6],[47,44]);
const savedHome=query.get('home')?.split(',').map(Number);if(savedHome?.length===4&&savedHome.every(Number.isFinite)&&Math.abs(savedHome[0]!)<=540&&Math.abs(savedHome[2]!)<=540&&savedHome[2]!-savedHome[0]!<=360&&Math.abs(savedHome[1]!)<=85&&Math.abs(savedHome[3]!)<=85&&savedHome[0]!<=savedHome[2]!&&savedHome[1]!<=savedHome[3]!)homeBounds=L.latLngBounds([savedHome[1]!,savedHome[0]!],[savedHome[3]!,savedHome[2]!]);
function ensureCamera(){
 if(cameraReady)return;
 map.invalidateSize({pan:false,animate:false});
 if(query.has('lat')&&query.has('lng'))map.setView([Math.max(-80,Math.min(80,numeric('lat',54))),Math.max(-180,Math.min(180,numeric('lng',-3)))],Math.max(2,Math.min(17,numeric('zoom',5))),{animate:false});else map.fitBounds(homeBounds!,{...padding(),animate:false});
 cameraReady=true;
 // Legacy country-only bookmarks load geography on demand; ordinary entry never waits for it.
 if(query.has('country')&&!query.has('lat')&&!query.has('home'))void loadCountries().then(()=>{const country=countries.find(c=>c.code===query.get('country'));if(country&&mode==='map')fitCountry(country);});
}
sizeSheet('middle');dateUI();
try{el('intro-hint').hidden=localStorage.getItem('historica-map-intro')==='seen';}catch{el('intro-hint').hidden=false;}
el('dismiss-hint').onclick=()=>{el('intro-hint').hidden=true;try{localStorage.setItem('historica-map-intro','seen');}catch{}};
switchView(mode);
try{
 const response=await fetch(sitePath('data/browser-history.json'));if(!response.ok)throw Error('History unavailable');const history=await response.json();
 entries=history.data.entities;associations=history.data.associations;places=placesFor(entries,associations,from,to);ready=true;el('loading').hidden=true;
 if(query.has('places')){const keys=query.get('places')!.split(';');selected=places.filter(p=>keys.includes(p.key));if(!selected.length)selected=null;else {const primary=[...selected].sort((a,b)=>b.entries.length-a.entries.length)[0]!;selectionTitle=selected.length===1?primary.name:`${primary.name} + ${selected.length-1}`;}}
 if(mode==='map'){sizeSheet(sheetSnap);updateMap();}else renderBrowse();
 if(document.activeElement===el('search'))search(el<HTMLInputElement>('search').value);
}catch(error){mode='browse';document.documentElement.dataset.explorerView='browse';delete document.documentElement.dataset.browseFiltered;el('browse-results').removeAttribute('data-initial');el('loading').textContent='Could not load the history collection. Reload to try again.';el('explorer').hidden=true;el('browse').hidden=false;el('view-map').setAttribute('aria-pressed','false');el('view-browse').setAttribute('aria-pressed','true');el('result-count').textContent='History unavailable';el('browse-status').textContent='Could not load the collection. Reload to try again.';console.error(error);}
