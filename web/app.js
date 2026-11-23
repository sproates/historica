import {createTimeline} from './timeline.js';
import {appendTimeline} from './generated/domain/timeline.js';
import {MIN_YEAR,MAX_YEAR,PRESETS,yearLabel,activeAt,allRecords,stageAt,readState,writeState,project,cameraAt,changeYear,inViewport,ageLabel} from './model.js';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
const svg=$('map');let timeline;let data,state,camera,modern,labels,viewHeight,heartland,heartlandPath,heartlandLabel,heartlandSubtitle,routeLayer,pointLayer;
const load=async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`Could not load ${url}`);return r.json();};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function el(tag,attrs={}){const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
function pathLine(coords){return coords.map((p,i)=>{const [x,y]=project(...p);return `${i?'L':'M'}${x.toFixed(3)},${y.toFixed(3)}`;}).join('');}
function geometryPath(g){if(g.type==='Polygon')return g.coordinates.map(r=>pathLine(r)+'Z').join('');if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(r=>pathLine(r)+'Z')).join('');if(g.type==='LineString')return pathLine(g.coordinates);if(g.type==='MultiLineString')return g.coordinates.map(pathLine).join('');return '';}
function syncURL(){history.replaceState(null,'',timeline?appendTimeline(writeState(state,camera),timeline.getState()):writeState(state,camera));}
function drawMap(countries,rivers){
 const land=el('g',{'fill':'#e9ebdc','fill-rule':'evenodd'}),water=el('g',{fill:'none',stroke:'#89b2bc','stroke-width':'.045','opacity':'.8'});
 modern=el('g',{fill:'none',stroke:'#677e70','stroke-width':'.05'});labels=el('g',{'text-anchor':'middle',fill:'#506b5c','font-family':'system-ui,sans-serif','letter-spacing':'.06'});
 for(const f of countries.features){const d=geometryPath(f.geometry);land.append(el('path',{d}));modern.append(el('path',{d}));const p=f.properties;if(Number.isFinite(p.LABEL_X)&&Number.isFinite(p.LABEL_Y)){const [x,y]=project(p.LABEL_X,p.LABEL_Y);const text=el('text',{x,y,'data-name':p.NAME});text.textContent=p.NAME;labels.append(text);}}
 for(const f of rivers.features)water.append(el('path',{d:geometryPath(f.geometry)}));
 heartland=el('g',{'class':'historical-area'});
 const overlay=data.historicalOverlays.find(o=>o.id==='bactria-heartland');
 heartlandPath=el('path',{d:geometryPath(overlay.geometry),fill:'#d2ac57','fill-opacity':'.28',stroke:'#986c20','stroke-linejoin':'round'});
 const [lx,ly]=project(...overlay.labelPoint);
 heartlandLabel=el('text',{x:lx,y:ly,fill:'#765015','text-anchor':'middle','font-family':'system-ui,sans-serif','font-weight':'700','pointer-events':'none'});heartlandLabel.textContent='BACTRIA';
 heartlandSubtitle=el('text',{x:lx,y:ly,fill:'#765015','text-anchor':'middle','font-family':'system-ui,sans-serif','pointer-events':'none'});heartlandSubtitle.textContent='Approximate heartland';
 heartland.append(heartlandPath,heartlandLabel,heartlandSubtitle);
 heartlandPath.addEventListener('click',()=>selectPlace('bactria'));
 svg.append(land,water,heartland,modern,labels);
 modern.style.pointerEvents='none';labels.style.pointerEvents='none';
 routeLayer=el('g',{'pointer-events':'none'});pointLayer=el('g');svg.append(routeLayer,pointLayer);
}
function pointFor(record){return record.point??[66.9,36.77];}
function chosenStage(){return data.campaign.find(s=>s.id===state.stage);}
function sourceHTML(ids){return ids.map(id=>{const s=data.sources.find(s=>s.id===id);return `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title||id)}</a>`;}).join('');}
function updateMap(){
 if(!svg.clientWidth||!svg.clientHeight)return;
 const aspect=svg.clientWidth/svg.clientHeight||1.6;viewHeight=camera.w/aspect;
 camera.x=Math.max(camera.w/2,Math.min(288-camera.w/2,camera.x));camera.y=Math.max(0,Math.min(180,camera.y));
 svg.setAttribute('viewBox',`${camera.x-camera.w/2} ${camera.y-viewHeight/2} ${camera.w} ${viewHeight}`);
 const scale=camera.w/(svg.clientWidth||750),overlay=data.historicalOverlays[0];
 const showArea=state.year>=overlay.displayWindow.startYear&&state.year<=overlay.displayWindow.endYear;
 heartland.style.display=showArea?'':'none';$('outline-note').hidden=!(showArea&&inViewport([68,36.5],camera,aspect));
 heartlandPath.setAttribute('stroke-width',scale*1.8);heartlandPath.setAttribute('stroke-dasharray',`${scale*6} ${scale*4}`);
 heartlandLabel.setAttribute('font-size',scale*14);heartlandLabel.setAttribute('stroke-width',scale*2);heartlandSubtitle.setAttribute('font-size',scale*11);heartlandSubtitle.setAttribute('stroke-width',scale*2);heartlandSubtitle.setAttribute('dy',scale*16);
 heartlandLabel.style.display=heartlandSubtitle.style.display=camera.w>65?'none':'';
 modern.setAttribute('stroke-width',scale*.85);modern.style.opacity=state.borders/100;labels.style.opacity=state.borders/100;
 for(const t of labels.children){t.setAttribute('font-size',scale*12);t.setAttribute('stroke-width',scale*2);t.style.display=camera.w>100?'none':'';}
 routeLayer.replaceChildren();const index=data.campaign.findIndex(s=>s.id===state.stage);
 if(index>0){const route=el('path',{d:pathLine(data.campaign.slice(0,index+1).map(s=>s.point)),fill:'none',stroke:'#9d6535','stroke-width':scale*1.7,'stroke-dasharray':`${scale*5} ${scale*6}`,opacity:'.7'});routeLayer.append(route);}
 pointLayer.replaceChildren();const pins=[chosenStage(),...data.contexts.filter(r=>activeAt(r,state.year))].filter(Boolean);
 for(const r of pins){const [x,y]=project(...r.point);const g=el('g',{class:'place-marker',transform:`translate(${x} ${y})`});g.append(el('circle',{r:scale*6,fill:r.kind==='campaign'?'#a47328':'#285b4d',stroke:'#fffefa','stroke-width':scale*2}));const label=el('text',{x:scale*10,y:scale*4,'font-size':scale*14,fill:r.kind==='campaign'?'#765015':'#234d40','stroke-width':scale*3,'font-weight':600});label.textContent=r.kind==='campaign'?r.region:r.region;g.append(label);g.addEventListener('click',()=>selectRecord(r.id));pointLayer.append(g);}
 $('zoom-in').disabled=camera.w<=6;$('zoom-out').disabled=camera.w>=288;$('world').setAttribute('aria-pressed',String(state.world));$('region').setAttribute('aria-pressed',String(state.mode==='follow'));
 $('map-title').textContent=`Historical context in ${yearLabel(state.year)}`;
 renderLocal();
}
function renderLocal(){
 const records=allRecords(data).filter(r=>activeAt(r,state.year)&&inViewport(pointFor(r),camera,svg.clientWidth/svg.clientHeight||1.6));
 $('event-count').textContent=`${records.length} ${records.length===1?'record':'records'} · ${yearLabel(state.year)}`;$('events').replaceChildren();
 if(!records.length){const p=document.createElement('p');p.className='empty';p.textContent='No records for this map area in the first collection. Try China, Italy or the Americas above, or return to the campaign. This is a gap in coverage, not an absence of history.';$('events').append(p);}
 for(const r of records){const b=document.createElement('button');b.className='event-card';b.setAttribute('aria-pressed',String(state.event===r.id&&!state.place));b.innerHTML=`<small>${r.kind==='context'?'PERIOD CONTEXT':r.kind==='campaign'?'CAMPAIGN STAGE':'DATED EVENT'} · ${esc(r.displayDate)}</small><strong>${esc(r.title)}</strong>`;b.onclick=()=>selectRecord(r.id);$('events').append(b);}
}
function renderDetails(){
 const place=data.places.find(p=>p.id===state.place),record=allRecords(data).find(r=>r.id===state.event);
 if(place){const city=place.id==='bactra';$('details').innerHTML=`<p class="eyebrow">HISTORICAL ${city?'CITY':'REGION'}</p><h2>${place.name}</h2><p class="description">${city?'Bactra was Bessos’ capital, associated with modern Balkh.':'The shaded outline sketches Bactria’s southern heartland between the Oxus river system and the Hindu Kush.'}</p><p class="precision">${city?'An approximate city reference, not Alexander’s precise location.':'Approximate editorial sketch; eastern and western edges are illustrative. Northern Bactria is omitted. The overlay is shown only in the original 330–326 BCE study window.'}</p>${sourceHTML(place.sourceIds)}<button id="back-event" class="place-button">Back to selection</button>`;$('back-event').onclick=()=>{state.place=null;render();};return;}
 if(!record){$('details').innerHTML='<h2>Explore the map</h2><p class="description">Select a stage or a period-context card to read its evidence.</p>';return;}
 const isBactria=record.id==='stage-bactria'||record.placeIds?.includes('bactria')||record.placeIds?.includes('bactra');
 $('details').innerHTML=`<p class="eyebrow">${record.kind==='context'?'ELSEWHERE AT THIS TIME':record.kind==='campaign'?'CAMPAIGN STAGE':'SELECTED EVENT'}</p><h2>${esc(record.title)}</h2><span class="tag">${esc(record.displayDate)}</span><p class="description">${esc(record.description)}</p><p class="precision">${esc(record.precisionNote)}</p>${isBactria?'<button class="place-button" id="bactria-place">About Bactria’s outline</button><button class="place-button" id="bactra-place">Bactra · modern Balkh</button>':''}<h3>Read the evidence</h3>${sourceHTML(record.sourceIds)}`;
 if(isBactria){$('bactria-place').onclick=()=>selectPlace('bactria');$('bactra-place').onclick=()=>selectPlace('bactra');}
}
function render(){
 if(timeline){const t=timeline.getState(),covered=t.moment>=MIN_YEAR&&t.moment<=MAX_YEAR;$('map-content').hidden=!covered;$('map-coverage').textContent=covered?'Map follows the selected moment. Historical coverage: Alexander’s campaign, 336–323 BCE.':'The map collection covers 336–323 BCE. Return to Alexander’s whole story to explore its places. No historical map is available for this moment yet.';}
 const stage=chosenStage(),idx=data.campaign.indexOf(stage);
 $('year').value=state.year;$('year').setAttribute('aria-valuetext',yearLabel(state.year));$('year-label').textContent=yearLabel(state.year);$('map-date').textContent=yearLabel(state.year);
 $('borders').value=state.borders;$('border-value').textContent=`${state.borders}%`;
 $('previous').disabled=state.year===MIN_YEAR;$('next').disabled=state.year===MAX_YEAR;
 $('stage-title').textContent=stage?`${stage.region} · ${stage.title}`:'No campaign stage recorded';$('stage-age').textContent=`${yearLabel(state.year)} · ${state.year===-323?'Final year of his life · born 356 BCE':ageLabel(state.year)}`;
 $('stage-prev').disabled=idx<=0;$('stage-next').disabled=idx===data.campaign.length-1;
 $('follow').setAttribute('aria-pressed',String(state.mode==='follow'));$('explore').setAttribute('aria-pressed',String(state.mode==='explore'));
 $('mode-help').textContent=state.mode==='follow'?'Following Alexander: changing the year centres the map on his campaign stage.':'Exploring freely: changing the year keeps this map position. Alexander stays pinned above.';
 for(const b of $('year-ticks').children)b.setAttribute('aria-current',String(Number(b.dataset.year)===state.year));
 for(const b of $('campaign-list').children)b.setAttribute('aria-current',String(b.dataset.stage===state.stage));
 renderDetails();updateMap();syncURL();
}
function setYear(year){const next=changeYear(state,camera,year,data,svg.clientWidth/svg.clientHeight||1.6);state=next.state;camera=next.camera;timeline?.acceptMoment(state.year);render();$('status').textContent=`Selected ${yearLabel(state.year)}. ${state.mode==='explore'?'Map position unchanged.':'Following Alexander.'}`;}
function selectRecord(id){const r=allRecords(data).find(r=>r.id===id);state.event=id;state.place=null;timeline?.acceptMoment(state.year,id);if(r.kind==='campaign'){state.stage=id;if(state.mode==='follow')camera=cameraAt(r.point);}render();$('status').textContent=`Selected ${r.title}. The year is ${yearLabel(state.year)}.`;}
function selectPlace(id){state.place=id;render();}
function chooseStage(id){const s=data.campaign.find(s=>s.id===id);state.year=Math.max(s.startYear,Math.min(s.endYear,state.year));state.stage=id;state.event=id;state.place=null;if(state.mode==='follow'){camera=cameraAt(s.point);state.world=false;}timeline?.acceptMoment(state.year,id);render();}
function follow(){state.mode='follow';state.event=state.stage;state.place=null;state.world=false;camera=cameraAt(chosenStage().point);render();}
function jump(preset){state.mode='explore';const p=PRESETS[preset];camera=cameraAt(p.point,p.w);state.world=preset==='world';state.place=null;const context=data.contexts.find(r=>activeAt(r,state.year)&&inViewport(r.point,camera,svg.clientWidth/svg.clientHeight||1.6));state.event=context?.id??state.stage;render();$('status').textContent=`Exploring ${p.name}, still ${yearLabel(state.year)}.`;}
function manualMove(){state.mode='explore';state.world=camera.w>130;$('follow').setAttribute('aria-pressed','false');$('explore').setAttribute('aria-pressed','true');$('mode-help').textContent='Exploring freely: changing the year keeps this map position. Alexander stays pinned above.';updateMap();syncURL();}
function zoom(factor){camera.w=Math.max(6,Math.min(288,camera.w*factor));manualMove();}
function wire(){
 for(let y=MIN_YEAR;y<=MAX_YEAR;y++)if(y%2===0||y===MAX_YEAR){const b=document.createElement('button');b.dataset.year=y;b.textContent=yearLabel(y);b.onclick=()=>setYear(y);$('year-ticks').append(b);}
 for(const s of data.campaign){const b=document.createElement('button');b.dataset.stage=s.id;b.innerHTML=`<small>${esc(s.displayDate)} · ${esc(s.region)}</small><span>${esc(s.title)}</span>`;b.onclick=()=>chooseStage(s.id);$('campaign-list').append(b);}
 $('year').oninput=e=>setYear(Number(e.target.value));$('previous').onclick=()=>setYear(state.year-1);$('next').onclick=()=>setYear(state.year+1);
 $('stage-prev').onclick=()=>chooseStage(data.campaign[data.campaign.findIndex(s=>s.id===state.stage)-1].id);$('stage-next').onclick=()=>chooseStage(data.campaign[data.campaign.findIndex(s=>s.id===state.stage)+1].id);
 $('follow').onclick=follow;$('explore').onclick=()=>{state.mode='explore';render();};for(const k of Object.keys(PRESETS))$('jump-'+k).onclick=()=>jump(k);
 $('borders').oninput=e=>{state.borders=Number(e.target.value);$('border-value').textContent=`${state.borders}%`;updateMap();syncURL();};
 $('outline-details').onclick=()=>selectPlace('bactria');$('region').onclick=follow;$('world').onclick=()=>jump('world');$('zoom-in').onclick=()=>zoom(.7);$('zoom-out').onclick=()=>zoom(1/.7);
 for(const [id,x,y]of [['north',0,-1],['south',0,1],['west',-1,0],['east',1,0]])$(id).onclick=()=>{camera.x+=x*camera.w*.18;camera.y+=y*viewHeight*.18;manualMove();};
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.12:1/1.12);},{passive:false});
 let drag=null,moved=false;heartlandPath.addEventListener('pointerdown',e=>e.stopPropagation());
 svg.addEventListener('pointerdown',e=>{if(e.target.closest('.place-marker'))return;drag={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};moved=false;svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
 svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;camera.x=drag.cx-dx*camera.w/svg.clientWidth;camera.y=drag.cy-dy*viewHeight/svg.clientHeight;updateMap();});
 const end=()=>{if(drag&&moved)manualMove();drag=null;svg.classList.remove('dragging');};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
 new ResizeObserver(()=>updateMap()).observe(svg);
 $('share').onclick=async()=>{syncURL();try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copied';}catch{$('share').textContent='Copy the address bar URL';}setTimeout(()=>$('share').textContent='Copy this view',2500);};
 window.addEventListener('hashchange',()=>{const hash=location.hash;state=readState(hash,data);camera=state.camera??cameraAt(chosenStage().point);timeline?.restore(hash);render();});
 $('map-companion').addEventListener('toggle',()=>{if($('map-companion').open)updateMap();});
}
try{
 const [collection,countries,rivers]=await Promise.all([load('data/collection.json'),load('data/ne_50m_admin_0_countries.json'),load('data/ne_50m_rivers_lake_centerlines.json')]);data=collection;state=readState(location.hash,data);camera=state.camera??(state.world?cameraAt(PRESETS.world.point,288):cameraAt(chosenStage().point));drawMap(countries,rivers);wire();
 timeline=createTimeline($('timeline-home'),data,(time,record,showMap)=>{
  const covered=time.moment>=MIN_YEAR&&time.moment<=MAX_YEAR;
  $('map-content').hidden=!covered;
  $('map-coverage').textContent=covered?'Map follows the selected moment. Historical coverage: Alexander’s campaign, 336–323 BCE.':'The map collection covers 336–323 BCE. Return to Alexander’s whole story to explore its places. No historical map is available for this moment yet.';
  if(covered){const next=changeYear(state,camera,time.moment,data,svg.clientWidth/svg.clientHeight||1.6);state=next.state;camera=next.camera;
   if(record&&allRecords(data).some(r=>r.id===record.id)&&activeAt(record,state.year)){state.event=record.id;state.place=null;if(record.kind==='campaign'){state.stage=record.id;if(state.mode==='follow')camera=cameraAt(record.point);}}
   if(showMap&&record?.point){camera=cameraAt(record.point,record.kind==='context'?30:20);state.mode='explore';state.world=false;}
   render();
  }else syncURL();
 });
 timeline.publish();render();
}catch(error){$('load-error').hidden=false;$('load-error').textContent='The map or collection could not load. Refresh the page with the local server running.';console.error(error);}
