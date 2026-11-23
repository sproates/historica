import {yearLabel} from './model.js';
import {FIRST,LAST,ordinal,historical,bounds,position,overlaps,windowAround,shiftWindow,zoomWindow,readTimeline} from './generated/domain/timeline.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createTimeline(root,data,onChange){
 const extra=[
 {id:'human-origins',kind:'overview',region:'Human origins',title:'Homo sapiens',startYear:FIRST,endYear:LAST,displayDate:'About 300,000 years ago to today',description:'Our species emerged in Africa about 300,000 years ago. This is a deep-time backdrop, not a claim that every region was occupied throughout this span.',url:'https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens'},
 {id:'food-production',kind:'overview',region:'Ways of living',title:'Food-producing societies',startYear:-10000,endYear:LAST,displayDate:'Roughly the past 12,000 years',description:'Food production developed at different times in different places. This approximate span is an overview, not a single worldwide transition.',url:'https://humanorigins.si.edu/human-characteristics/humans-change-world'},
 {id:'life-alexander',kind:'life',region:'Alexander',title:'Alexander the Great',startYear:-356,endYear:-323,displayDate:'356–323 BCE',description:'A life alongside other lives. The campaign collection covers 15 main stages from accession in 336 BCE to death in 323 BCE.',url:'https://archive.archaeology.org/online/features/alexander/whoswho.html'},
 {id:'life-aristotle',kind:'life',region:'Aristotle',title:'Aristotle',startYear:-384,endYear:-322,displayDate:'384–322 BCE',description:'Aristotle and Alexander were contemporaries. Move the shared time marker to compare their approximate ages. A life line does not imply a fixed geographical location.',url:'https://plato.stanford.edu/entries/aristotle/'}];
 const records=[...extra,...data.contexts,...data.campaign,...data.events];
 let state=readTimeline(location.hash);if(!records.some(r=>r.id===state.selection))state.selection='life-alexander';
 root.innerHTML=`<div class="timeline-toolbar"><div class="timeline-actions"><button id="time-all">All history</button><button id="time-fit">Alexander’s whole story</button></div><div class="timeline-actions"><button id="time-earlier" aria-label="Move timeline earlier">Earlier</button><button id="time-out" aria-label="Zoom out in time">−</button><span id="time-scale"></span><button id="time-in" aria-label="Zoom in in time">+</button><button id="time-later" aria-label="Move timeline later">Later</button></div></div><div class="timeline-heading"><h2 id="time-range"></h2><span id="time-scope">Selected stories · proportional time</span></div><div class="timeline-axis"><span>PLACE / LIFE</span><div id="time-ticks"></div></div><div id="time-lanes" class="timeline-lanes"></div><div class="timeline-scrub"><label for="time-marker" id="time-moment"></label><input id="time-marker" type="range" aria-label="Shared time marker"></div><div class="timeline-reading"><article id="time-details"></article><aside><p class="eyebrow" id="time-alongside-label"></p><div id="time-alongside"></div></aside></div><p class="timeline-coverage">Selected coverage, not a complete world history. Empty spans are gaps in this collection. Deep-time boundaries are approximate; “All history” begins with Homo sapiens. Earlier human relatives would extend it further.</p>`;
 const $=id=>root.querySelector('#'+id);
 function publish(record=null,showMap=false){onChange({...state},record,showMap);}
 function lane(name,subtitle,items){
  return `<div class="history-lane" data-region="${esc(name)}"><div class="history-lane-name">${esc(name)}<small>${esc(subtitle)}</small></div><div class="history-lane-tracks">${items.map(r=>{
   const [a,b]=bounds(r),left=Math.max(0,position(a,state.start,state.end)*100),right=Math.min(100,position(b,state.start,state.end)*100),single=state.start===state.end;
   const width=single?100:Math.max(0,right-left),point=a===b;
   const active=a<=state.moment&&b>=state.moment;
   return `<div class="history-track"><div class="history-caption"><button data-record="${esc(r.id)}" aria-pressed="${r.id===state.selection}">${esc(r.title)}</button><small>${esc(r.displayDate)}</small></div><div class="history-band-space" aria-hidden="true"><span class="history-band ${r.kind==='life'?'life-band':''} ${point?'event-point':''} ${active?'at-moment':''}" style="left:${single?0:left}%;width:${point?'6px':width+'%'}"></span></div></div>`;
  }).join('')||'<p class="timeline-empty">No entries in this window</p>'}</div></div>`;
 }
 function render(){
  const width=ordinal(state.end)-ordinal(state.start),isWide=width>1500;
  $('time-range').textContent=state.start===state.end?yearLabel(state.start):`${yearLabel(state.start)} — ${yearLabel(state.end)}`;
  $('time-scale').textContent=width===0?'One year':`${(width+1).toLocaleString()} years`;
  $('time-out').disabled=state.start===FIRST&&state.end===LAST;$('time-in').disabled=width===0;
  $('time-earlier').disabled=state.start===FIRST;$('time-later').disabled=state.end===LAST;
  $('time-all').setAttribute('aria-pressed',String(state.start===FIRST&&state.end===LAST));
  $('time-fit').setAttribute('aria-pressed',String(state.start===-336&&state.end===-323));
  $('time-ticks').innerHTML=(width===0?[state.start]:[state.start,historical(Math.round((ordinal(state.start)+ordinal(state.end))/2)),state.end]).map((y,i)=>`<span class="${i===1?'middle-tick':''}">${esc(yearLabel(y))}</span>`).join('');
  let html='';
  if(isWide){html+=lane('Deep time','Human origins',extra.slice(0,1).filter(r=>overlaps(r,state.start,state.end)));html+=lane('Ways of living','Different regional paths',extra.slice(1,2).filter(r=>overlaps(r,state.start,state.end)));}
  for(const [name,sub,items]of [['Lives','Not fixed locations',extra.filter(r=>r.kind==='life')],['East Asia','China',data.contexts.filter(r=>r.id==='china-warring')],['Italy','Mediterranean',data.contexts.filter(r=>['italy-settlement','samnite-war'].includes(r.id))],['The Americas','Oaxaca',data.contexts.filter(r=>r.id==='monte-alban')]])html+=lane(name,sub,items.filter(r=>overlaps(r,state.start,state.end)));
  if(width<=99)html+=lane('Campaign','Selected stages',data.campaign.filter(r=>overlaps(r,state.start,state.end)).filter(r=>r.id===state.selection||overlaps(r,state.moment,state.moment)));
  $('time-lanes').innerHTML=html+`<div class="timeline-sight" aria-hidden="true"><div style="left:${width===0?50:position(state.moment,state.start,state.end)*100}%"></div></div>`;
  $('time-moment').textContent=yearLabel(state.moment);const marker=$('time-marker');marker.min=ordinal(state.start);marker.max=ordinal(state.end);marker.value=ordinal(state.moment);marker.disabled=width===0;marker.setAttribute('aria-valuetext',yearLabel(state.moment));
  const selected=records.find(r=>r.id===state.selection)??extra[2];
  const sources=selected.url?`<a href="${esc(selected.url)}" target="_blank" rel="noopener">Read the evidence</a>`:(selected.sourceIds??[]).map(id=>{const s=data.sources.find(s=>s.id===id);return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title||id)}</a>`:'';}).join('');
  $('time-details').innerHTML=`<p class="eyebrow">${selected.kind==='life'?'AN OVERLAPPING LIFE':selected.kind==='campaign'?'CAMPAIGN STAGE':'HISTORICAL CONTEXT'}</p><h2>${esc(selected.title)}</h2><p class="timeline-date">${esc(selected.displayDate)}${overlaps(selected,state.moment,state.moment)?'':' · Outside the selected moment'}</p><p>${esc(selected.description)}</p>${selected.precisionNote?`<p class="precision">${esc(selected.precisionNote)}</p>`:''}<div class="timeline-actions"><button id="time-fit-selection">Fit this story</button><button id="time-show-map" ${state.moment < -336||state.moment > -323?'disabled':''}>Show this moment on map</button></div><div class="timeline-sources">${sources}</div>`;
  $('time-fit-selection').onclick=()=>{const [start,end]=bounds(selected);state={...state,start,end,moment:Math.max(start,Math.min(end,state.moment))};render();publish(selected);};
  $('time-show-map').onclick=()=>{const map=document.getElementById('map-companion');map.open=true;map.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});publish(selected,true);};
  $('time-alongside-label').textContent=`AT THE SAME MOMENT · ${yearLabel(state.moment)}`;
  const contemporaries=records.filter(r=>['life','context'].includes(r.kind)&&overlaps(r,state.moment,state.moment));
  $('time-alongside').innerHTML=contemporaries.map(r=>{const age=state.moment-r.startYear;return `<button data-record="${esc(r.id)}">${esc(r.title)}<small>${r.kind==='life'?`About ${Math.max(0,age-1)}–${age} years${state.moment===r.endYear?' · final year':''}`:esc(r.region)+' · period context'}</small></button>`;}).join('')||'<p class="timeline-empty">No detailed contemporary stories in this sample at this moment.</p>';
 }
 root.addEventListener('click',e=>{const button=e.target.closest('[data-record]');if(button){state.selection=button.dataset.record;render();publish(records.find(r=>r.id===state.selection));}});
 function change(next){state=next;render();publish();}
 $('time-all').onclick=()=>change({...state,start:FIRST,end:LAST});
 $('time-fit').onclick=()=>change({...state,start:-336,end:-323,moment:Math.max(-336,Math.min(-323,state.moment)),selection:'life-alexander'});
 $('time-out').onclick=()=>change(zoomWindow(state,1));$('time-in').onclick=()=>change(zoomWindow(state,-1));
 $('time-earlier').onclick=()=>change(shiftWindow(state,-1));$('time-later').onclick=()=>change(shiftWindow(state,1));
 $('time-marker').oninput=e=>change({...state,moment:historical(Number(e.target.value))});
 render();
 return {getState:()=>({...state}),restore(hash){state=readTimeline(hash);if(!records.some(r=>r.id===state.selection))state.selection='life-alexander';render();publish();},acceptMoment(year,id){state.moment=year;if(year<state.start||year>state.end)Object.assign(state,windowAround(year,ordinal(state.end)-ordinal(state.start)));if(id&&records.some(r=>r.id===id))state.selection=id;render();},publish};
}
