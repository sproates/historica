import {searchEntities} from './search-model.js';
import {encodeView,decodeView} from './view-url.js?v=egypt-1';
import {setupMap} from './focus-map.js?v=bookmarks-1';
import {buildFocusData,temporalLabel,initialFocus,changeFocus,focusAssociations,rankedContext,relatedEntities,encodeFocus,decodeFocus} from './focus-model.js?v=egypt-1';
import {ordinal,historical,position,windowAround,overlaps} from './timeline-model.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const year=y=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`,dates=(a,b)=>a===b?year(a):`${year(a)} – ${year(b)}`;
const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();};
let data,state,stack=[],land='',envelope,showAllContext=false,reviewedEvidence=null;
let ready=false;
const mapControls=setupMap($('focus-map'),()=>{if(ready)sync();}); 
const xy=p=>[(p[0]+180)*2,180-p[1]*2];
function geometry(g){const ring=r=>r.map((p,i)=>`${i?'L':'M'}${xy(p).join(',')}`).join('')+'Z';return g.type==='Polygon'?g.coordinates.map(ring).join(''):g.type==='MultiPolygon'?g.coordinates.flatMap(p=>p.map(ring)).join(''):'';}
function snapshot(){return {state:{...state},view:{map:mapControls.getState(),envelope:{...envelope},expanded:showAllContext,evidence:document.querySelector('.geography details').open}};}
function sync(){if(!ready)return;history.replaceState(null,'',encodeView(state,snapshot().view,data));}
function restore(saved){state=saved.state;envelope=saved.view.envelope;showAllContext=saved.view.expanded;mapControls.restore(saved.view.map);document.querySelector('.geography details').open=saved.view.evidence;}
function setEnvelope(){const f=data.entities.find(e=>e.id===state.focus);envelope={start:Math.min(state.start,f.startYear),end:Math.max(state.end,f.endYear)};}
function focus(id){stack.push(snapshot());showAllContext=false;state=changeFocus(data,state,id);setEnvelope();history.pushState(null,'',encodeView(state,snapshot().view,data));render();$('status').textContent=`Focused on ${data.entities.find(e=>e.id===state.focus).title}, ${dates(state.start,state.end)}`;}
function band(e,isFocus=false){const a=Math.max(e.startYear,state.start),b=Math.min(e.endYear,state.end),single=state.start===state.end,valid=a<=b;const left=single?0:position(a,state.start,state.end)*100,width=single?100:Math.max(0,position(b,state.start,state.end)*100-left);const dot=e.startYear===e.endYear;
return `<div class="lane ${isFocus?'focus-lane':''}" ${isFocus?'':`data-focus="${esc(e.id)}"`}><div class="lane-distance">${isFocus?'YOUR FOCUS':(state.focus==='global-overview'||data.entities.find(x=>x.id===state.focus)?.type==='period')?'Same period':e.km===null?'Location not researched':e.km<100?'Nearby':`~${Math.round(e.km/100)*100} km`}<small>${esc(isFocus?e.type:e.region||e.type)}</small></div><div class="lane-content"><button data-focus="${esc(e.id)}" ${isFocus?'disabled':''}>${esc(e.title)}</button><small>${dates(e.startYear,e.endYear)}${temporalLabel(e,state)?` · ${esc(temporalLabel(e,state))}`:''}</small><div class="track">${valid?`<span class="band ${e.type==='person'?'life':''} ${e.temporalKind==='dated-evidence'||e.uncertainty?'uncertain':''} ${dot?'point':''}" style="left:${left}%;width:${dot?'7px':width+'%'}"></span>`:''}</div></div></div>`;}
function renderDescription(f){
 const target=$('focus-description');
 if(target.dataset.focus===f.id)return;
 target.dataset.focus=f.id;
 const paragraphs=f.description.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
 const paragraph=p=>`<p>${esc(p)}</p>`;
 const lengthy=f.description.trim().split(/\s+/).length>80;
 // Preserve authored paragraph boundaries; never truncate a sentence.
 if(lengthy&&paragraphs.length>1){
  target.innerHTML=paragraph(paragraphs[0])+`<details class="description-more"><summary><span class="read-more">Read more</span><span class="read-less">Read less</span></summary>${paragraphs.slice(1).map(paragraph).join('')}</details>`;
 }else target.innerHTML=paragraphs.map(paragraph).join('');
}
function render(){const f=data.entities.find(e=>e.id===state.focus),associations=focusAssociations(data,state),ranked=rankedContext(data,state);$('back').disabled=!stack.length;$('focus-picker').value=f.id;$('focus-type').textContent=`FOCUS · ${f.type==='state'?'STATE / KINGDOM':f.type.toUpperCase()}`;$('focus-title').textContent=f.title;document.title=`${f.title} · historica beta`;renderDescription(f);$('focus-note').textContent=f.note||'';$('range-title').textContent=dates(state.start,state.end);$('fit').textContent=f.type==='person'?'Full lifespan':'Fit study period';$('kind').value=state.kind;$('area').value=state.area;
for(const [id,val]of [['start',state.start],['end',state.end]]){const s=$(id);s.min=ordinal(envelope.start);s.max=ordinal(envelope.end);s.value=ordinal(val);s.setAttribute('aria-valuetext',year(val));$(id+'-label').textContent=year(val);}
$('zoom-in').disabled=state.start===state.end;$('zoom-out').disabled=state.start===-300000&&state.end===2026;
$('ticks').innerHTML=[state.start,state.end].map(y=>`<span>${year(y)}</span>`).join('');
$('lanes').innerHTML=band(['area','state','city'].includes(f.type)?{...f,startYear:state.start,endYear:state.end}:f,true)+(showAllContext?ranked:ranked.slice(0,18)).map(e=>band(e)).join('')+(ranked.length?'':'<p class="empty">No context records match this window and these filters.</p>');
$('more-context').hidden=ranked.length<=18;$('more-context').textContent=showAllContext?'Show fewer items':`Show all ${ranked.length} items`;$('context-count').textContent=`${ranked.length} matching lives, events and periods`;
const related=relatedEntities(data,state).filter(e=>e.type!=='event');$('related').innerHTML=related.map(e=>`<div class="related-item"><button data-focus="${esc(e.id)}"><small>${esc(e.type)}</small><strong>${esc(e.title)}</strong><span>${esc(e.relation)}</span>${!e.inWindow?'<span class="outside-window">Outside visible period</span>':''}</button>${['area','state','city'].includes(e.type)?`<button class="filter-link" data-filter="${e.id}">Filter near ${esc(e.title)}</button>`:''}</div>`).join('')||'<p class="muted">No direct connections recorded yet. Use Explore to choose another focus.</p>';
renderMap(associations,f);
const claims=(reviewedEvidence?.claims||[]).filter(c=>f.claimIds?.includes(c.id));
$('regional-evidence').hidden=!f.contextual;
$('regional-evidence').innerHTML=f.contextual?`<div class="section-heading"><h2>What the evidence shows</h2><span>AI-assisted source review</span></div><p class="muted">${f.type==='area'?'Explore the connected examples or read their evidence here.':'Date ranges may describe broad context or uncertainty about when something happened. They do not establish activity in every selected year.'}</p><div class="regional-cards">${claims.map(c=>`<article><p>${esc(c.statement)}</p><details><summary>Source and scope</summary>${c.evidenceIds.map(id=>{const e=reviewedEvidence.evidence.find(e=>e.id===id),s=reviewedEvidence.sources.find(s=>s.id===e.sourceId);return `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><br>${esc(s.creator)}<br>${esc(e.locator)}</p><p>${esc(e.note)}</p>`;}).join('')}</details></article>`).join('')}</div>${!claims.length?'<p>The regional overview is still incomplete. The connected examples have their own sources and limitations.</p>':''}`:'';
sync();}
function renderMap(associations,f){const unique=[...new Map(associations.map(a=>[`${a.point.join(',')}:${a.label}`,a])).values()];let overlay='';if(associations.some(a=>a.place==='bactria'))overlay=`<path d="${geometry(data.collection.historicalOverlays[0].geometry)}" fill="#c49a4440" stroke="#a77527" stroke-dasharray="4 3" stroke-width="1.3"/>`;
if(['area','city','state'].includes(f.type)&&f.point){const [fx,fy]=xy(f.point);overlay+=`<circle cx="${fx}" cy="${fy}" r="15" fill="none" stroke="#285b4d" stroke-width="2"><title>Focus area reference: ${esc(f.title)}</title></circle>`;}
$('focus-map').innerHTML=`<title>Places associated with ${esc(f.title)} in ${esc(dates(state.start,state.end))}</title><g fill="#dfe6d8" class="modern-land" stroke="#a6b8aa" stroke-width=".35" fill-rule="evenodd">${land}</g>${overlay}`+unique.map(a=>{const [x,y]=xy(a.point);return `<g class="map-marker" role="button" tabindex="0" data-focus="${esc(a.place)}" aria-label="Focus on ${esc(data.entities.find(e=>e.id===a.place)?.title||a.label)}"><title>${esc(a.label)} · ${dates(a.startYear,a.endYear)}</title><circle cx="${x}" cy="${y}" r="11" fill="#b4833538"/><circle cx="${x}" cy="${y}" r="3.5" fill="#a97627" stroke="#fff" stroke-width="1"/></g>`;}).join('');
mapControls.update(unique.map(a=>xy(a.point)));
$('map-title').textContent='Related places';$('map-count').textContent=`${unique.length} dated associations`;$('map-empty').textContent=unique.length?'Only associations overlapping the visible period are highlighted.':'No dated place associations recorded for this focus in this period. This is a gap in the sample.';
$('map-places').innerHTML=unique.map(a=>{const target=data.entities.find(e=>e.id===a.place);return `<div class="place-row"><span><strong>${esc(a.label)}</strong><small>${dates(a.startYear,a.endYear)}${temporalLabel(a,state)?` · ${esc(temporalLabel(a,state))}`:''}</small></span>${target&&target.id!==state.focus?`<button data-focus="${esc(target.id)}">Focus on ${esc(target.title)}</button>`:''}</div>`;}).join('');
const sources=[...new Set([f.url,...associations.map(a=>a.source)].filter(Boolean))];const checked=(reviewedEvidence?.claims||[]).filter(c=>(c.subjectId===f.id||f.claimIds?.includes(c.id))&&c.status==='accepted');
$('evidence').innerHTML=`<p class="evidence-status">${reviewedEvidence?checked.length?`${checked.length} statements checked against source passages. Other content in this view is still awaiting claim-level review.`:'Claim-level review is pending for this focus. The links below are research references.':'Checked evidence could not be loaded. Research references remain available below.'}</p>`+checked.map(c=>`<article class="checked-claim"><strong>${esc(c.statement)}</strong>${c.evidenceIds.map(id=>{const e=reviewedEvidence.evidence.find(x=>x.id===id),source=reviewedEvidence.sources.find(x=>x.id===e.sourceId);return `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)} · ${esc(source.creator)}</a><span>${esc(e.locator)}</span><span>${esc(e.note)}</span>`;}).join('')}<small>AI-assisted source check · not independent expert review</small></article>`).join('')+'<h3>Research references</h3>'+sources.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener">${i===0?'Focus reference':'Place association reference '+i}</a>`).join('');}
function zoom(factor){const width=ordinal(state.end)-ordinal(state.start),mid=historical(Math.round((ordinal(state.start)+ordinal(state.end))/2));Object.assign(state,windowAround(mid,factor>1?Math.max(13,width*factor):width<3?0:Math.floor(width*factor)));setEnvelope();render();}
try{const [collection,countries,reviewed,exploration]=await Promise.all([load('data/collection.json'),load('data/ne_50m_admin_0_countries.json'),load('data/reviewed-evidence.json').catch(()=>null),load('data/reviewed-exploration.json')]);reviewedEvidence=reviewed;data=buildFocusData(collection,exploration);restore(decodeView(location.href,data));ready=true;land=countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join('');
$('area').innerHTML='<option value="all">Everywhere</option>'+data.entities.filter(e=>e.id!=='global-overview'&&['area','state','city'].includes(e.type)).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('');
$('focus-picker').innerHTML=['person','area','state','city','period','event'].map(type=>`<optgroup label="${type}">${data.entities.filter(e=>e.type===type).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('')}</optgroup>`).join('');
function clearSearch(){ $('history-search').value='';$('search-panel').hidden=true;$('search-clear').hidden=true;$('search-results').innerHTML='';$('search-count').textContent=''; }
function renderSearch(){const query=$('history-search').value.trim();$('search-panel').hidden=!query;$('search-clear').hidden=!query;if(!query){clearSearch();return;}
const matches=searchEntities(data.entities,query);
$('search-count').textContent=matches.length?`${matches.length} results across all dates. Choose one to change focus.`:'No matches in this collection yet. Try another name or a broader term.';
$('search-results').innerHTML=matches.map(e=>`<li><button type="button" data-search-focus="${esc(e.id)}"><span><strong>${esc(e.title)}</strong><small>${esc(e.type==='state'?'State / kingdom':e.type)} · ${dates(e.startYear,e.endYear)}</small></span><span class="search-description">${esc(e.description)}</span></button></li>`).join('');}
$('history-search').addEventListener('input',renderSearch);
$('search-clear').onclick=()=>{clearSearch();$('history-search').focus();};
$('search-results').onclick=e=>{const button=e.target.closest('[data-search-focus]');if(!button)return;focus(button.dataset.searchFocus);clearSearch();$('focus-title').setAttribute('tabindex','-1');$('focus-title').focus();};
$('history-search').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='ArrowDown'){const first=$('search-results').querySelector('button');if(first){e.preventDefault();first.focus();}}});
document.querySelector('.collection-search').addEventListener('keydown',e=>{if(e.key==='Escape'){clearSearch();$('history-search').focus();}});
$('focus-picker').onchange=e=>focus(e.target.value);document.querySelector('main').addEventListener('click',e=>{const button=e.target.closest('[data-focus],[data-filter]');if(!button||button.disabled)return;if(button.dataset.focus)focus(button.dataset.focus);else{state.area=button.dataset.filter;render();}});
$('whole-period').onclick=()=>{focus('global-overview');state.start=-3000;state.end=200;setEnvelope();render();};
$('more-context').onclick=()=>{showAllContext=!showAllContext;render();};
$('back').onclick=()=>{if(stack.length){restore(stack.pop());render();}};
$('start').oninput=e=>{state.start=Math.min(historical(Number(e.target.value)),state.end);render();};$('end').oninput=e=>{state.end=Math.max(historical(Number(e.target.value)),state.start);render();};
$('zoom-in').onclick=()=>zoom(.5);$('zoom-out').onclick=()=>zoom(2);$('fit').onclick=()=>{const full=initialFocus(data,state.focus);state.start=full.start;state.end=full.end;setEnvelope();render();};
$('kind').onchange=e=>{state.kind=e.target.value;render();};$('area').onchange=e=>{state.area=e.target.value;render();};$('clear').onclick=()=>{state.kind='all';state.area='all';render();};
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copied';}catch{$('share').textContent='Copy the address bar URL';}};
document.querySelector('.geography details').addEventListener('toggle',sync);
const restoreLocation=()=>{stack=[];restore(decodeView(location.href,data));render();};
window.addEventListener('popstate',restoreLocation);window.addEventListener('hashchange',restoreLocation);render();
}catch(e){$('error').hidden=false;$('error').textContent='The collection could not load. Please reload with the local server running.';console.error(e);}
