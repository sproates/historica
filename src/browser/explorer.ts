import {createEvidenceStore} from '../content/evidence-store.js';
import {loadMapData} from '../presentation/map-data.js';
import {createHistoryRenderer} from '../presentation/history-renderer.js';
import {canEnhanceStaticHistory} from '../state/static-page.js';
import {syncFocusControls} from '../controllers/focus-control-state.js';
import {bindTimelineControls} from '../controllers/timeline-controls.js';
import {bindNavigationControls} from '../controllers/navigation-controls.js';
import {bindExplorerControls} from '../controllers/explorer-controls.js';
import {focusEnvelope} from '../state/focus.js';
import {clampMoment} from '../domain/exploration.js';
import {bindSearchControls} from '../controllers/search-controls.js';
import {bindComparisonControls} from '../controllers/comparison-controls.js';
import {encodeView,decodeView,bookmarkPanels} from '../state/view-url.js';
import {setupMap} from '../controllers/map-controls.js';
import {changeFocus} from '../state/focus.js';
import {focusAssociations,rankedContext} from '../domain/history-queries.js';
import {assembleHistory} from '../domain/assemble-history.js';
import {parseHistory} from '../content/validate-history.js';
import {geometry,xy} from '../presentation/history-page.js';
import {escapeHtml as esc} from '../presentation/html.js';
import type {HistoryDataset,HistoryEntity,PlaceAssociation,GeoPoint} from '../domain/history.js';
import type {FocusState,ContextKind} from '../state/focus.js';
import type {ExplorerSnapshot} from '../state/view-url.js';
import type {TimeWindow} from '../domain/timeline.js';
import type {ReviewedEvidence} from '../domain/evidence.js';
import type {ChronologyEvidence} from '../domain/exploration.js';
interface CollectionMap {historicalOverlays: Array<{geometry: unknown}>}

/** Own the browser lifecycle; models and rendering remain independent of navigation. */
export async function startExplorer(base: string, prototype: unknown): Promise<void> {
const $=<T extends Element=HTMLElement>(id: string): T=>{
 const node=document.getElementById(id);
 if(!node)throw new Error(`Missing explorer element: ${id}`);
 return node as unknown as T;
};
const panel=(selector: string): HTMLDetailsElement=>{
 const node=document.querySelector(selector);
 if(!node)throw new Error(`Missing explorer panel: ${selector}`);
 return node as HTMLDetailsElement;
};
const year=(y: number)=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`,dates=(a: number,b: number)=>a===b?year(a):`${year(a)} – ${year(b)}`;
const load=async <T=unknown>(url: string): Promise<T>=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();};
const evidenceStore=createEvidenceStore(url=>load<ReviewedEvidence>(url));
function withEvidence(id: string,apply: ()=>void){loadingEvidence=true;return evidenceStore.select(id,pack=>{loadingEvidence=false;reviewedEvidence=pack;$('error').hidden=true;apply();},()=>{loadingEvidence=false;sync();$('error').hidden=false;$('error').textContent='The sources for this history could not load. Please try selecting it again.';});}
let data: HistoryDataset,state: FocusState,envelope: TimeWindow;
let stack: ExplorerSnapshot[]=[],land='',focusGeography: unknown[]=[],regionPoints: GeoPoint[]=[],bactriaOutline='';
let showAllContext=false,reviewedEvidence: ReviewedEvidence | null=null;
let loadingEvidence=false,chronologyEvidence: ChronologyEvidence={claims:[]},ready=false,comparisonMode: 'shared'|'full'='shared',selectedYear: number | null=null,comparedPeople: string[]=[];
const expandedLanes=new Set<string>();
const mapControls=setupMap($<SVGSVGElement>('focus-map'),()=>{if(ready)sync();}); 
const {renderComparison,renderSwimlanes,renderMap,renderYear,renderRegionalEvidence,renderFocus,renderDetails}=createHistoryRenderer(document,()=>({data,state,selectedYear,comparedPeople,comparisonMode,reviewedEvidence,chronologyEvidence,expandedLanes,land,focusGeography,showAllContext,bactriaOutline}),updateMapPoints);
function snapshot(): ExplorerSnapshot{return {state:{...state},view:{moment:selectedYear,people:[...comparedPeople],lanes:[...expandedLanes].map(key=>JSON.parse(key) as [string,string]).filter(([id])=>id===state.focus).map(([,name])=>name),panels:bookmarkPanels.filter(name=>panel(`.${name}`).open),comparison:comparisonMode,map:mapControls.getState(),envelope:{...envelope},expanded:showAllContext,evidence:panel('.geography details').open}};}
function sync(){if(!ready||loadingEvidence)return;history.replaceState(null,'',encodeView(state,snapshot().view,data,base));}
function restore(saved: ExplorerSnapshot,fitInitially=false){const wasReady=ready;ready=false;comparisonMode=saved.view.comparison||'shared';selectedYear=saved.view.moment??null;comparedPeople=saved.view.people||[];panel('.people-comparison').open=comparedPeople.length===2;state=saved.state;envelope=saved.view.envelope;showAllContext=saved.view.expanded;mapControls.restore(saved.view.map,fitInitially);panel('.geography details').open=saved.view.evidence;expandedLanes.clear();for(const name of saved.view.lanes||[])expandedLanes.add(JSON.stringify([state.focus,name]));for(const name of bookmarkPanels)panel(`.${name}`).open=(saved.view.panels||[]).includes(name);ready=wasReady;}
function currentFocus(): HistoryEntity {
 const entity=data.entities.find(e=>e.id===state.focus);
 if(!entity)throw new Error(`Unknown focus: ${state.focus}`);
 return entity;
}
function setEnvelope(){envelope=focusEnvelope(data,state);}
function focus(id: string,kind: ContextKind='all',period: TimeWindow | null=null){return withEvidence(id,()=>{stack.push(snapshot());showAllContext=false;state=changeFocus(data,state,id);if(period)Object.assign(state,period);mapControls.fitOnNextUpdate();state.kind=kind;selectedYear=clampMoment(selectedYear,state);setEnvelope();history.pushState(null,'',encodeView(state,snapshot().view,data,base));render();if(window.matchMedia('(max-width: 600px)').matches){$('focus-title').setAttribute('tabindex','-1');$('focus-title').focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});}$('status').textContent=`Focused on ${currentFocus().title}, ${dates(state.start,state.end)}`;});}
function render(){selectedYear=clampMoment(selectedYear,state);const f=currentFocus(),associations=focusAssociations(data,selectedYear===null?state:{...state,start:selectedYear,end:selectedYear}),ranked=rankedContext(data,state);syncFocusControls(document,state,envelope,Boolean(stack.length),year);renderFocus(f);
renderComparison(f,ranked);renderSwimlanes(f,ranked);renderYear(ranked,f);
renderDetails(f,ranked);
renderMap(associations,f);
renderRegionalEvidence(f);
sync();}
function updateMapPoints(associations: PlaceAssociation[],f: HistoryEntity){
const points=f.id==='britain-ireland'?regionPoints:[];
mapControls.update(points.length?points.map(xy):[...associations.filter((a): a is PlaceAssociation & {point: GeoPoint}=>a.point!==null).map(a=>xy(a.point)),...(['area','city','state'].includes(f.type)&&f.point?[xy(f.point)]:[])]);
}
function selectYear(y: number | null){selectedYear=clampMoment(y,state);render();}
try{const [collection,mapData,exploration,chronology]=await Promise.all([load<CollectionMap>('data/collection.json'),loadMapData(document,load),load<HistoryDataset>('data/reviewed-exploration.json'),load<ChronologyEvidence>('data/browser-chronology.json')]);chronologyEvidence=chronology;data=parseHistory(assembleHistory(parseHistory(prototype),exploration,collection));
bactriaOutline=geometry(collection.historicalOverlays[0]?.geometry);
const saved=decodeView(location.href,data,base),reuseStatic=canEnhanceStaticHistory(document.body.dataset.staticHistory,data,saved),fitInitially=!/[?&#](x|y|w)=/.test(location.href);
reviewedEvidence=await evidenceStore.get(saved.state.focus);
// Keep the generated camera while initialising controls; custom camera bookmarks still take precedence.
if(reuseStatic&&fitInitially)saved.view.map={...mapControls.getState(),borders:saved.view.map.borders};
state=saved.state;envelope=saved.view.envelope;
restore(saved,fitInitially);ready=true;focusGeography=mapData.focusGeography;land=mapData.land;regionPoints=mapData.regionPoints;
$('area').innerHTML='<option value="all">Everywhere</option>'+data.entities.filter(e=>e.id!=='global-overview'&&['area','state','city'].includes(e.type)).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('');
$('focus-picker').innerHTML=['person','area','state','city','period','event'].map(type=>`<optgroup label="${type}">${data.entities.filter(e=>e.type===type).map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('')}</optgroup>`).join('');
bindComparisonControls(document,{getEntities:()=>data.entities,selectPeople(people,duplicate){comparedPeople=people;renderComparison(currentFocus(),rankedContext(data,state));if(duplicate)$('comparison-intro').textContent='Choose two different people.';sync();},selectScale(mode){comparisonMode=mode;renderComparison(currentFocus(),rankedContext(data,state));sync();},reset(){comparedPeople=[];render();}});
bindExplorerControls(document,{getData:()=>data,getState:()=>state,getMoment:()=>selectedYear,setState(next,resizeEnvelope){state=next;if(resizeEnvelope)setEnvelope();render();},setMoment:selectYear});
bindTimelineControls(document,{getWindow:()=>state,selectYear,toggleLane(key){if(expandedLanes.has(key))expandedLanes.delete(key);else expandedLanes.add(key);renderSwimlanes(currentFocus(),rankedContext(data,state));sync();}});
bindSearchControls(document,{getEntities:()=>data.entities,formatDates:dates,async select(id){if(!await focus(id))return;$('focus-title').setAttribute('tabindex','-1');$('focus-title').focus({preventScroll:window.matchMedia('(max-width: 600px)').matches});}});
bindNavigationControls(document,{focus,filter(area){state.area=area;render();},wholePeriod(){return focus('global-overview','all',{start:-3000,end:200});},toggleContext(){showAllContext=!showAllContext;render();},back(){const saved=stack.at(-1);if(saved)return withEvidence(saved.state.focus,()=>{stack.pop();restore(saved);render();});}});
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copied';}catch{$('share').textContent='Copy the address bar URL';}};
panel('.geography details').addEventListener('toggle',sync);
for(const name of bookmarkPanels)panel(`.${name}`).addEventListener('toggle',sync);
const restoreLocation=()=>{const saved=decodeView(location.href,data,base),fitInitially=!/[?&#](x|y|w)=/.test(location.href);return withEvidence(saved.state.focus,()=>{stack=[];restore(saved,fitInitially);render();});};
window.addEventListener('popstate',restoreLocation);window.addEventListener('hashchange',restoreLocation);
if(reuseStatic){
 syncFocusControls(document,state,envelope,false,year);
 updateMapPoints(focusAssociations(data,state),currentFocus());
 sync();
}else render();
}catch(e){$('error').hidden=false;$('error').textContent='The collection could not load. Please reload with the local server running.';console.error(e);}

}
