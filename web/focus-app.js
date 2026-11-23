import {createHistoryRenderer} from './generated/presentation/history-renderer.js';
import {canEnhanceStaticHistory} from './generated/state/static-page.js';
import {syncFocusControls} from './generated/controllers/focus-control-state.js';
import {bindTimelineControls} from './generated/controllers/timeline-controls.js';
import {bindNavigationControls} from './generated/controllers/navigation-controls.js';
import {bindExplorerControls} from './generated/controllers/explorer-controls.js';
import {focusEnvelope} from './generated/state/focus.js';
import {clampMoment} from './exploration-model.js';
import {bindSearchControls} from './generated/controllers/search-controls.js';
import {bindComparisonControls} from './generated/controllers/comparison-controls.js';
import {encodeView,decodeView,bookmarkPanels} from './view-url.js?v=exploration-1';
import {setupMap} from './focus-map.js?v=fit-initial-1';
import {buildFocusData,changeFocus,focusAssociations,rankedContext} from './focus-model.js?v=egypt-1';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const year=y=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`,dates=(a,b)=>a===b?year(a):`${year(a)} – ${year(b)}`;
const load=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();};
let data,state,stack=[],land='',focusGeography=[],envelope,showAllContext=false,reviewedEvidence=null;
let ready=false,comparisonMode='shared',selectedYear=null,comparedPeople=[];
const expandedLanes=new Set();
const mapControls=setupMap($('focus-map'),()=>{if(ready)sync();}); 
const xy=p=>[(p[0]+180)*2,180-p[1]*2];
function geometry(g){const ring=r=>r.map((p,i)=>`${i?'L':'M'}${xy(p).join(',')}`).join('')+'Z';return g.type==='Polygon'?g.coordinates.map(ring).join(''):g.type==='MultiPolygon'?g.coordinates.flatMap(p=>p.map(ring)).join(''):'';}
const {renderComparison,renderSwimlanes,renderMap,renderYear,renderRegionalEvidence,renderFocus,renderDetails}=createHistoryRenderer(document,()=>({data,state,selectedYear,comparedPeople,comparisonMode,reviewedEvidence,expandedLanes,land,focusGeography,showAllContext,bactriaOutline:geometry(data.collection.historicalOverlays[0].geometry)}),updateMapPoints);
function snapshot(){return {state:{...state},view:{moment:selectedYear,people:[...comparedPeople],lanes:[...expandedLanes].map(key=>JSON.parse(key)).filter(([id])=>id===state.focus).map(([,name])=>name),panels:bookmarkPanels.filter(name=>document.querySelector(`.${name}`).open),comparison:comparisonMode,map:mapControls.getState(),envelope:{...envelope},expanded:showAllContext,evidence:document.querySelector('.geography details').open}};}
function sync(){if(!ready)return;history.replaceState(null,'',encodeView(state,snapshot().view,data));}
function restore(saved,fitInitially=false){const wasReady=ready;ready=false;comparisonMode=saved.view.comparison||'shared';selectedYear=saved.view.moment??null;comparedPeople=saved.view.people||[];document.querySelector('.people-comparison').open=comparedPeople.length===2;state=saved.state;envelope=saved.view.envelope;showAllContext=saved.view.expanded;mapControls.restore(saved.view.map,fitInitially);document.querySelector('.geography details').open=saved.view.evidence;expandedLanes.clear();for(const name of saved.view.lanes||[])expandedLanes.add(JSON.stringify([state.focus,name]));for(const name of bookmarkPanels)document.querySelector(`.${name}`).open=(saved.view.panels||[]).includes(name);ready=wasReady;}
function setEnvelope(){envelope=focusEnvelope(data,state);}
function focus(id,kind='all'){stack.push(snapshot());showAllContext=false;state=changeFocus(data,state,id);mapControls.fitOnNextUpdate();state.kind=kind;selectedYear=clampMoment(selectedYear,state);setEnvelope();history.pushState(null,'',encodeView(state,snapshot().view,data));render();if(window.matchMedia('(max-width: 600px)').matches){$('focus-title').setAttribute('tabindex','-1');$('focus-title').focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});}$('status').textContent=`Focused on ${data.entities.find(e=>e.id===state.focus).title}, ${dates(state.start,state.end)}`;}
function render(){selectedYear=clampMoment(selectedYear,state);const f=data.entities.find(e=>e.id===state.focus),associations=focusAssociations(data,selectedYear===null?state:{...state,start:selectedYear,end:selectedYear}),ranked=rankedContext(data,state);syncFocusControls(document,state,envelope,Boolean(stack.length),year);renderFocus(f);
renderComparison(f,ranked);renderSwimlanes(f,ranked);renderYear(ranked,f);
renderDetails(f,ranked);
renderMap(associations,f);
renderRegionalEvidence(f);
sync();}
function updateMapPoints(associations,f){
const region=f.id==='britain-ireland'?focusGeography:[];
const regionPoints=region.flatMap(g=>g.type==='MultiPolygon'?g.coordinates.flat(2):g.coordinates.flat());
mapControls.update(regionPoints.length?regionPoints.map(xy):[...associations.filter(a=>a.point).map(a=>xy(a.point)),...(['area','city','state'].includes(f.type)&&f.point?[xy(f.point)]:[])]);
}
function selectYear(y){selectedYear=clampMoment(y,state);render();}
try{const [collection,countries,reviewed,exploration]=await Promise.all([load('data/collection.json'),load('data/ne_50m_admin_0_countries.json'),load('data/reviewed-evidence.json').catch(()=>null),load('data/reviewed-exploration.json')]);reviewedEvidence=reviewed;data=buildFocusData(collection,exploration);const saved=decodeView(location.href,data),reuseStatic=canEnhanceStaticHistory(document.body.dataset.staticHistory,data,saved),fitInitially=!/[?&#](x|y|w)=/.test(location.href);
// Keep the generated camera while initialising controls; custom camera bookmarks still take precedence.
if(reuseStatic&&fitInitially)saved.view.map={...mapControls.getState(),borders:saved.view.map.borders};
restore(saved,fitInitially);ready=true;focusGeography=countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry);land=countries.features.map(f=>`<path d="${geometry(f.geometry)}"/>`).join('');
$('area').innerHTML='<option value="all">Everywhere</option>'+data.entities.filter(e=>e.id!=='global-overview'&&['area','state','city'].includes(e.type)).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('');
$('focus-picker').innerHTML=['person','area','state','city','period','event'].map(type=>`<optgroup label="${type}">${data.entities.filter(e=>e.type===type).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('')}</optgroup>`).join('');
bindComparisonControls(document,{getEntities:()=>data.entities,selectPeople(people,duplicate){comparedPeople=people;renderComparison(data.entities.find(e=>e.id===state.focus),rankedContext(data,state));if(duplicate)$('comparison-intro').textContent='Choose two different people.';sync();},selectScale(mode){comparisonMode=mode;renderComparison(data.entities.find(e=>e.id===state.focus),rankedContext(data,state));sync();},reset(){comparedPeople=[];render();}});
bindExplorerControls(document,{getData:()=>data,getState:()=>state,getMoment:()=>selectedYear,setState(next,resizeEnvelope){state=next;if(resizeEnvelope)setEnvelope();render();},setMoment:selectYear});
bindTimelineControls(document,{getWindow:()=>state,selectYear,toggleLane(key){if(expandedLanes.has(key))expandedLanes.delete(key);else expandedLanes.add(key);renderSwimlanes(data.entities.find(e=>e.id===state.focus),rankedContext(data,state));sync();}});
bindSearchControls(document,{getEntities:()=>data.entities,formatDates:dates,select(id){focus(id);$('focus-title').setAttribute('tabindex','-1');$('focus-title').focus({preventScroll:window.matchMedia('(max-width: 600px)').matches});}});
bindNavigationControls(document,{focus,filter(area){state.area=area;render();},wholePeriod(){focus('global-overview');state.start=-3000;state.end=200;setEnvelope();render();},toggleContext(){showAllContext=!showAllContext;render();},back(){if(stack.length){restore(stack.pop());render();}}});
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copied';}catch{$('share').textContent='Copy the address bar URL';}};
document.querySelector('.geography details').addEventListener('toggle',sync);
for(const name of bookmarkPanels)document.querySelector(`.${name}`).addEventListener('toggle',sync);
const restoreLocation=()=>{stack=[];restore(decodeView(location.href,data),!/[?&#](x|y|w)=/.test(location.href));render();};
window.addEventListener('popstate',restoreLocation);window.addEventListener('hashchange',restoreLocation);
if(reuseStatic){
 syncFocusControls(document,state,envelope,false,year);
 updateMapPoints(focusAssociations(data,state),data.entities.find(e=>e.id===state.focus));
 sync();
}else render();
}catch(e){$('error').hidden=false;$('error').textContent='The collection could not load. Please reload with the local server running.';console.error(e);}
