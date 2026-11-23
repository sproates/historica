import type {HistoryDataset,HistoryEntity,PlaceAssociation} from '../domain/history.js';
import type {RankedHistory} from '../domain/history-queries.js';
import type {FocusState} from '../state/focus.js';
import type {ReviewedEvidence} from '../domain/evidence.js';
import {dateMeaning,ageAt,peopleAt,compareLives} from '../domain/exploration.js';
import {comparisonRecords,comparisonLayout,comparisonExplanation,outsideVisiblePeriod} from '../domain/comparison.js';
import {timelineLayout,regionFor,laneView} from '../domain/swimlane.js';
import {temporalLabel,relatedEntities} from '../domain/history-queries.js';
import {ordinal,position} from '../domain/timeline.js';
import {escapeHtml as esc} from './html.js';
import {geometry,xy} from './history-page.js';

export interface RenderContext {
  data: HistoryDataset;
  state: FocusState;
  selectedYear: number | null;
  comparedPeople: string[];
  comparisonMode: 'shared' | 'full';
  reviewedEvidence: ReviewedEvidence | null;
  expandedLanes: Set<string>;
  land: string;
  focusGeography: unknown[];
  bactriaOutline: string;
  showAllContext: boolean;
}
/** Rendering reads a snapshot; it does not own navigation, loading or browser history. */
export function createHistoryRenderer(root: Pick<Document,'getElementById'|'querySelector'|'title'>, context: ()=>RenderContext, updateMapPoints: (associations: PlaceAssociation[],focus: HistoryEntity)=>void) {
 const $=<T extends HTMLElement=HTMLElement>(id: string): T=>{
   const element=root.getElementById(id);
   if(!element)throw new Error(`Missing history element: ${id}`);
   return element as T;
 };
 const year=(y: number)=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`,dates=(a: number,b: number)=>a===b?year(a):`${year(a)} – ${year(b)}`;
function band(e: HistoryEntity & {km?: number | null},isFocus=false){const {data,state}=context();const a=Math.max(e.startYear,state.start),b=Math.min(e.endYear,state.end),single=state.start===state.end,valid=a<=b;const left=single?0:position(a,state.start,state.end)*100,width=single?100:Math.max(0,position(b,state.start,state.end)*100-left);const dot=e.startYear===e.endYear;
return `<div class="lane ${isFocus?'focus-lane':''}" ${isFocus?'':`data-focus="${esc(e.id)}"`}><div class="lane-distance">${isFocus?'YOUR FOCUS':(state.focus==='global-overview'||data.entities.find(x=>x.id===state.focus)?.type==='period')?'Same period':e.km==null?'Location not researched':e.km<100?'Nearby':`~${Math.round(e.km/100)*100} km`}<small>${esc(isFocus?e.type:e.region||e.type)}</small></div><div class="lane-content"><button data-focus="${esc(e.id)}" ${isFocus?'disabled':''}>${esc(e.title)}</button><small>${dates(e.startYear,e.endYear)}${temporalLabel(e,state)?` · ${esc(temporalLabel(e,state))}`:''}</small><div class="track">${valid?`<span class="band ${e.type==='person'?'life':''} ${e.temporalKind==='dated-evidence'||e.uncertainty?'uncertain':''} ${dot?'point':''}" style="left:${left}%;width:${dot?'7px':width+'%'}"></span>`:''}</div></div></div>`;}
function renderDescription(f: HistoryEntity){
 const target=$('focus-description');
 if(target.dataset.descriptionFocus===f.id)return;
 target.dataset.descriptionFocus=f.id;
 const paragraphs=f.description.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
 const paragraph=(p: string)=>`<p>${esc(p)}</p>`;
 // Preserve authored paragraph boundaries; never truncate a sentence.
 if(paragraphs.length>1){
  target.innerHTML=paragraph(paragraphs[0]!)+`<details class="description-more"><summary><span class="read-more">Read more</span><span class="read-less">Read less</span></summary>${paragraphs.slice(1).map(paragraph).join('')}</details>`;
 }else target.innerHTML=paragraphs.map(paragraph).join('');
}
function renderComparison(f: HistoryEntity,ranked: RankedHistory[]){const {data,state,selectedYear,comparedPeople,comparisonMode,reviewedEvidence}=context();
 const chosen=comparedPeople.map(id=>data.entities.find(e=>e.id===id&&e.type==='person')).filter((e): e is HistoryEntity=>Boolean(e));
 const manual=chosen.length===2;
 const picks=manual?[chosen[1]!]:comparisonRecords(f,ranked,data,state);
 $('comparison-range').textContent=dates(state.start,state.end);
 $('comparison-intro').textContent=comparisonExplanation(picks,state);
 const place=['area','state','city'].includes(f.type),first=place?{...f,startYear:state.start,endYear:state.end}:f;
 const records=manual?chosen:[first,...picks];
 const layout=comparisonLayout(records,manual?{start:Math.min(...chosen.map(e=>e.startYear)),end:Math.max(...chosen.map(e=>e.endYear))}:state,manual?'full':comparisonMode);
 if(manual){const overlap=compareLives(chosen[0]!,chosen[1]!);$('comparison-range').textContent=dates(layout.start,layout.end);$('comparison-intro').textContent=overlap.overlap?`Their recorded lifespans overlap from ${year(overlap.start)} to ${year(overlap.end)}. Approximate endpoints are labelled below.`:'Their recorded lifespans do not overlap.';}
 $<HTMLSelectElement>('compare-first').value=comparedPeople[0]||'';$<HTMLSelectElement>('compare-second').value=comparedPeople[1]||'';
 (root.querySelector('.comparison-modes') as HTMLElement).hidden=manual;
 if(!manual&&comparisonMode==='full'&&picks.length)$('comparison-intro').textContent='Compare the complete date ranges. Shading marks the selected years; the wider timeline below keeps those dates.';
 $('comparison-shared').setAttribute('aria-pressed',String(comparisonMode==='shared'));
 $('comparison-full').setAttribute('aria-pressed',String(comparisonMode==='full'));
 $('comparison-bars').innerHTML=`<div class="comparison-axis"><span>${manual||comparisonMode==='full'?'Full ranges':'Visible years'}</span><div><span>${year(layout.start)}</span><span>${year(layout.end)}</span></div></div>`+layout.items.map((e,i)=>`<div class="comparison-row"><button ${i===0&&!manual?'disabled':`data-focus="${esc(e.id)}"`}><strong>${esc(e.title)}</strong><small>${i===0&&!manual?'Your focus':esc(regionFor(e,data,state))} · ${dates(e.startYear,e.endYear)} · ${esc(dateMeaning(e))}${selectedYear!==null&&e.type==='person'?` · ${year(selectedYear)}: ${esc(ageAt(e,selectedYear,reviewedEvidence))}`:''}</small></button><div class="comparison-track" aria-hidden="true">${comparisonMode==='full'&&!manual?`<i class="comparison-selection" style="left:${layout.selectedLeft}%;width:max(3px,${layout.selectedWidth}%)"></i>`:''}${e.visible?`<span class="${/Approximate|Context|study/.test(dateMeaning(e))?'date-uncertain':''}" style="left:${e.left}%;width:max(4px,${e.width}%)">${e.before?'<b class="comparison-before">‹</b>':''}${e.after?'<b class="comparison-after">›</b>':''}</span>`:''}</div></div>`).join('');
 $('options-summary').textContent=`Adjust dates and filters${state.kind!=='all'||state.area!=='all'?' · Filters active':''}`;
 const checked=(reviewedEvidence?.claims||[]).filter(c=>c.status==='accepted'&&(c.subjectId===f.id||f.claimIds?.includes(c.id)));
 $('focus-trust').textContent=checked.length?`${checked.length} statements have been checked against linked sources with AI assistance. This is not independent expert review; coverage may still be incomplete.`:'This entry has research references, but its individual statements have not yet all been checked. Treat it as provisional.';
}
function renderSwimlanes(f: HistoryEntity,ranked: RankedHistory[]){const {data,state,selectedYear,reviewedEvidence,expandedLanes}=context();
 const records=ranked,layout=timelineLayout(f,records,data,state);
 const tickPosition=(y: number)=>state.start===state.end?50:position(y,state.start,state.end)*100;
 const lines=layout.ticks.map(y=>`<i class="swim-gridline" style="left:${tickPosition(y)}%"></i>`).join('');
 $('swimlanes').innerHTML=`<div class="swim-axis"><div class="swim-label">REGION</div><div class="swim-dates">${layout.ticks.map((y,i)=>`<span style="left:${tickPosition(y)}%" class="${i===0?'first':i===layout.ticks.length-1?'last':''}">${year(y)}</span>`).join('')}</div></div>`+layout.lanes.map(raw=>{const key=JSON.stringify([state.focus,raw.name]),l=laneView(raw,expandedLanes.has(key));return `<section class="swim-lane ${l.focus?'swim-focus':''}" aria-label="${esc(l.name)}"><div class="swim-label"><h3>${esc(l.name)}</h3>${l.canCollapse?`<button class="lane-toggle" data-lane="${esc(key)}" aria-expanded="${l.expanded}">${l.expanded?'Show fewer':`Show all ${l.total}`}<span class="sr-only"> in ${esc(l.name)}</span></button>`:''}</div><div class="swim-track" style="height:${l.rows*64+12}px">${lines}${selectedYear!==null?`<i class="year-line" style="left:${tickPosition(selectedYear)}%"></i>`:''}${l.items.map(e=>`<button class="swim-item ${e.type==='person'?'swim-life':''} ${e.point||e.single?'swim-point':''}" ${l.focus?'disabled':`data-focus="${esc(e.id)}"`} style="top:${e.row*64+8}px;--left:${e.left}%;--width:${e.width}%;--label-left:${e.labelLeft}%" title="${esc(e.title)} · ${dates(e.startYear,e.endYear)} · ${esc(dateMeaning(e))}${e.note?' · '+esc(e.note):''}" aria-label="${esc(e.title)}, ${dates(e.startYear,e.endYear)}${l.focus?', current focus':''}"><span class="swim-caption">${esc(e.title)}<small class="date-kind">${esc(dateMeaning(e))}${selectedYear!==null&&e.type==='person'?` · ${esc(ageAt(e,selectedYear,reviewedEvidence))}`:''}</small></span><span class="swim-bar ${/Approximate|Context|study/.test(dateMeaning(e))||e.uncertainty?'swim-approximate':''}">${e.continuesBefore?'<b class="swim-before">‹</b>':''}${e.continuesAfter?'<b class="swim-after">›</b>':''}</span></button>`).join('')}${l.items.length?'':'<p class="swim-outside">Outside this window</p>'}</div></section>`;}).join('');
 $('swim-count').textContent=`${records.length} of ${ranked.length} matching entries`;
}
function renderMap(associations: PlaceAssociation[],f: HistoryEntity){const {data,state,selectedYear,reviewedEvidence,land,focusGeography,bactriaOutline}=context();const unique=[...new Map(associations.filter((a): a is PlaceAssociation & {point: NonNullable<PlaceAssociation['point']>}=>a.point!==null).map(a=>[`${a.point.join(',')}:${a.label}`,a])).values()];let overlay='';if(associations.some(a=>a.place==='bactria'))overlay=`<path d="${bactriaOutline}" fill="#c49a4440" stroke="#a77527" stroke-dasharray="4 3" stroke-width="1.3"/>`;
const region=f.id==='britain-ireland'?focusGeography:[];
if(region.length)overlay+=`<g class="focus-region" fill="#60957d" stroke="none" fill-rule="evenodd"><title>Britain and Ireland · present-day land outline for orientation, not ancient borders</title>${region.map(g=>`<path d="${geometry(g)}"/>`).join('')}</g>`;
if(['area','city','state'].includes(f.type)&&f.point){const [fx,fy]=xy(f.point);overlay+=`<circle cx="${fx}" cy="${fy}" r="15" fill="none" stroke="#285b4d" stroke-width="2"><title>Focus area reference: ${esc(f.title)}</title></circle>`;}
$('focus-map').innerHTML=`<title>Places associated with ${esc(f.title)} in ${esc(selectedYear===null?dates(state.start,state.end):year(selectedYear))}</title><g fill="#dfe6d8" class="modern-land" stroke="#a6b8aa" stroke-width=".35" fill-rule="evenodd">${land}</g>${overlay}`+unique.map(a=>{const [x,y]=xy(a.point);return `<g class="map-marker" role="button" tabindex="0" data-focus="${esc(a.place)}" aria-label="Focus on ${esc(data.entities.find(e=>e.id===a.place)?.title||a.label)}"><title>${esc(a.label)} · ${dates(a.startYear,a.endYear)}</title><circle cx="${x}" cy="${y}" r="11" fill="#b4833538"/><circle cx="${x}" cy="${y}" r="3.5" fill="#a97627" stroke="#fff" stroke-width="1"/></g>`;}).join('');
updateMapPoints(associations,f);
$('map-fit').textContent=region.length?'Fit area':'Related places';
$('map-title').textContent=region.length?f.title:'Related places';$('map-count').textContent=`${unique.length} dated associations${selectedYear===null?'':' · '+year(selectedYear)}`;$('map-empty').textContent=region.length?'Green shows Britain and Ireland using today’s land outline for orientation, not ancient borders. Gold markers show dated records in the selected period.':unique.length?'Only associations overlapping the visible period are highlighted.':'No dated place associations recorded for this focus in this period. This is a gap in the sample.';
$('map-places').innerHTML=unique.map(a=>{const target=data.entities.find(e=>e.id===a.place);return `<div class="place-row"><span><strong>${esc(a.label)}</strong><small>${dates(a.startYear,a.endYear)}${temporalLabel(a,state)?` · ${esc(temporalLabel(a,state))}`:''}</small></span>${target&&target.id!==state.focus?`<button data-focus="${esc(target.id)}">Focus on ${esc(target.title)}</button>`:''}</div>`;}).join('');
const sources=[...new Set([f.url,...associations.map(a=>a.source)].filter(Boolean))];const checked=(reviewedEvidence?.claims||[]).filter(c=>(c.subjectId===f.id||f.claimIds?.includes(c.id))&&c.status==='accepted');
$('evidence').innerHTML=`<p class="evidence-status">${reviewedEvidence?checked.length?`${checked.length} statements checked against source passages. Other content in this view is still awaiting claim-level review.`:'Claim-level review is pending for this focus. The links below are research references.':'Checked evidence could not be loaded. Research references remain available below.'}</p>`+checked.map(c=>`<article class="checked-claim"><strong>${esc(c.statement)}</strong>${c.evidenceIds.map(id=>{const e=reviewedEvidence!.evidence.find(x=>x.id===id)!,source=reviewedEvidence!.sources.find(x=>x.id===e.sourceId)!;return `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)} · ${esc(source.creator)}</a><span>${esc(e.locator)}</span><span>${esc(e.note)}</span>`;}).join('')}<small>AI-assisted source check · not independent expert review</small></article>`).join('')+'<h3>Research references</h3>'+sources.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener">${i===0?'Focus reference':'Place association reference '+i}</a>`).join('');}
function renderYear(ranked: RankedHistory[],f: HistoryEntity){const {state,selectedYear,reviewedEvidence}=context();
 $<HTMLInputElement>('year-enabled').checked=selectedYear!==null;$('year-controls').hidden=selectedYear===null;
 if(selectedYear===null)return;
 const cursor=$<HTMLInputElement>('year-cursor');cursor.min=String(ordinal(state.start));cursor.max=String(ordinal(state.end));cursor.value=String(ordinal(selectedYear));cursor.setAttribute('aria-valuetext',year(selectedYear));
 $('year-label').textContent=year(selectedYear);$<HTMLButtonElement>('year-prev').disabled=selectedYear===state.start;$<HTMLButtonElement>('year-next').disabled=selectedYear===state.end;
 const people=peopleAt([f,...ranked],selectedYear);
 $('living-count').textContent=`${people.length} recorded lives overlap ${year(selectedYear)}`;
 $('living-people').innerHTML=people.map(e=>`<div><button data-focus="${esc(e.id)}">${esc(e.title)}</button><span>${esc(ageAt(e,selectedYear,reviewedEvidence))}</span></div>`).join('')||'<p>No matching biographies recorded for this year.</p>';
}
function renderRegionalEvidence(f: HistoryEntity){const {reviewedEvidence}=context();
const claims=(reviewedEvidence?.claims||[]).filter(c=>f.claimIds?.includes(c.id));
$('regional-evidence').hidden=!f.contextual;
$('regional-evidence').innerHTML=f.contextual?`<div class="section-heading"><h2>What the evidence shows</h2></div><p class="muted">${f.type==='area'?'Explore the connected examples or read their evidence here.':'Date ranges may describe broad context or uncertainty about when something happened. They do not establish activity in every selected year.'}</p><div class="regional-cards">${claims.map(c=>`<article><p>${esc(c.statement)}</p><details><summary>Source and scope</summary>${c.evidenceIds.map(id=>{const e=reviewedEvidence!.evidence.find(e=>e.id===id)!,s=reviewedEvidence!.sources.find(s=>s.id===e.sourceId)!;return `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><br>${esc(s.creator)}<br>${esc(e.locator)}</p><p>${esc(e.note)}</p>`;}).join('')}</details></article>`).join('')}</div>${!claims.length?'<p>The regional overview is still incomplete. The connected examples have their own sources and limitations.</p>':''}`:'';
}

function renderFocus(f: HistoryEntity){
const {state}=context();
$('focus-type').textContent=`FOCUS · ${f.type==='state'?'STATE / KINGDOM':f.type.toUpperCase()}`;$('focus-title').textContent=f.title;root.title=`${f.title} · historica beta`;renderDescription(f);$('focus-note').textContent=f.note||'';$('range-title').textContent=dates(state.start,state.end);$('fit').textContent=f.type==='person'?'Full lifespan':'Fit study period';
}
function renderDetails(f: HistoryEntity,ranked: RankedHistory[]){
const {data,state,showAllContext}=context();
$('ticks').innerHTML=[state.start,state.end].map(y=>`<span>${year(y)}</span>`).join('');
$('lanes').innerHTML=band(['area','state','city'].includes(f.type)?{...f,startYear:state.start,endYear:state.end}:f,true)+(showAllContext?ranked:ranked.slice(0,18)).map(e=>band(e)).join('')+(ranked.length?'':'<p class="empty">No context records match this window and these filters.</p>');
$('more-context').hidden=ranked.length<=18;$('more-context').textContent=showAllContext?'Show fewer items':`Show all ${ranked.length} items`;$('context-count').textContent=`${ranked.length} matching lives, events and periods`;
const related=relatedEntities(data,state).filter(e=>e.type!=='event');$('related').innerHTML=related.map(e=>`<div class="related-item"><button data-focus="${esc(e.id)}"><small>${esc(e.type)}</small><strong>${esc(e.title)}</strong><span>${esc(e.relation)}</span>${outsideVisiblePeriod(e)?'<span class="outside-window">Outside visible period</span>':''}</button>${['area','state','city'].includes(e.type)?`<button class="filter-link" data-filter="${e.id}">Filter near ${esc(e.title)}</button>`:''}</div>`).join('')||'<p class="muted">No direct connections recorded yet. Use Explore to choose another focus.</p>';

}

return {band,renderDescription,renderComparison,renderSwimlanes,renderMap,renderYear,renderRegionalEvidence,renderFocus,renderDetails};
}
