import {expandWorld} from './world-collection.js?v=socrates-1';
import {overlaps} from './timeline-model.js';
export function buildFocusData(collection,exploration={entities:[],associations:[],relationships:[]}){
 const sources={alexander:'https://archive.archaeology.org/online/features/alexander/whoswho.html',philip:'https://academic.oup.com/edited-volume/61673/chapter-abstract/549705697',ptolemy:'https://orbi.uliege.be/bitstream/2268/229448/1/Ptolemy%20I%20Soter_Chapter%205.pdf',aristotle:'https://plato.stanford.edu/entries/aristotle/',egypt:'https://penelope.uchicago.edu/thayer/e/gazetteer/places/africa/egypt/_texts/bevhop/2%2A.html'};
 const entity=(id,type,title,startYear,endYear,description,point,url,note='')=>({id,type,title,startYear,endYear,description,point,url,note});
 const entities=[
 entity('alexander','person','Alexander the Great',-356,-323,'Follow a life from Macedonia to Babylon, alongside the people and societies of the same time.',null,sources.alexander),
 entity('philip','person','Philip II',-382,-336,'King of Macedonia and Alexander’s father. His reign transformed Macedonia and laid the foundations for Alexander’s campaign.',null,sources.philip,'Birth year approximate; reign 359–336 BCE.'),
 entity('ptolemy','person','Ptolemy I Soter',-367,-283,'Alexander’s companion and general, then ruler of Egypt. His life continues for decades after Alexander’s death.',null,sources.ptolemy,'Life dates approximate: born 367/366, died 283/282 BCE. The plotted range uses 367–283 BCE.'),
 entity('aristotle','person','Aristotle',-384,-322,'Philosopher and teacher of Alexander. His life overlaps Philip, Alexander and Ptolemy.',null,sources.aristotle),
 entity('egypt','area','Egypt',-3100,200,'Explore Egyptian periods, rulers, cities and communities, alongside histories elsewhere.',[30,27],sources.egypt,'3100 BCE–200 CE is an editorial study window, not Egypt’s beginning or end. Use Fit study period to see it all. Source chronologies vary; regional highlights are approximate, not political borders.'),
 entity('macedonia','state','Kingdom of Macedonia',-359,-323,'The kingdom of Philip II and Alexander. Explore the royal succession and related people.',[22.5,40.75],sources.philip,'359–323 BCE is a study window across two reigns, not the entire duration of the kingdom.'),
 entity('bactria','area','Bactria',-330,-326,'A historical region around the Oxus and Hindu Kush, encountered during Alexander’s eastern campaign.',[66.9,36.77],'https://www.iranicaonline.org/articles/bessos-satrap-of-bactria/','330–326 BCE is a study window. The outline is an approximate southern heartland, omitting northern Bactria.'),
 entity('bactra','city','Bactra',-330,-326,'The ancient city associated with modern Balkh. A city reference point, not a precise personal location.',[66.9,36.77],'https://pleiades.stoa.org/places/961886','Study window 330–326 BCE; the city existed beyond these dates.'),
 entity('period','period','Alexander’s lifetime',-356,-323,'A shared period for comparing the Mediterranean, Asia and the Americas.',null,sources.alexander),
 ...collection.campaign.map(r=>({...r,type:'event',url:collection.sources.find(s=>s.id===r.sourceIds[0])?.url,note:r.precisionNote})),
 ...collection.contexts.map(r=>({...r,type:'period',url:collection.sources.find(s=>s.id===r.sourceIds[0])?.url,note:r.precisionNote})),
 entity('ptolemy-egypt','event','Ptolemy takes charge of Egypt',-323,-323,'After Alexander’s death, Ptolemy becomes satrap of Egypt. His rule later develops into a kingdom.',[30,27],sources.egypt),
 entity('philip-king','event','Philip becomes king',-359,-359,'Philip’s reign begins in Macedonia.',[22.5,40.75],sources.philip,'Chronologies may give 360/359 BCE; this collection uses 359 BCE.'),
 entity('philip-reign','period','Philip’s reign in Macedonia',-359,-336,'The reign of Philip II, ending with the succession of Alexander.',[22.5,40.75],sources.philip),
 entity('chaeronea','event','Philip’s victory at Chaeronea',-338,-338,'Philip defeats the forces of Athens and Thebes.',[23,38.5],'https://resources.metmuseum.org/resources/metpublications/pdf/Pergamon_and_the_Hellenistic_Kingdoms_of_the_Ancient_World.pdf','Approximate battle-area reference.'),
 entity('ptolemy-rule','period','Ptolemy’s rule in Egypt',-323,-283,'Ptolemy governs Egypt first as satrap, then as king.',[30,27],sources.egypt,'End date approximate; some chronologies use 282 BCE.'),
 entity('ptolemy-king','event','Ptolemy becomes king',-305,-305,'Ptolemy assumes the royal title in Egypt.',[30,27],sources.egypt,'This chronology uses 305 BCE; some accounts date the royal title to 306/305 BCE.')
 ];
 const association=(subject,place,startYear,endYear,label,point,source)=>({subject,place,startYear,endYear,label,point,source});
 const associations=[
 association('alexander','macedonia',-356,-336,'Macedonian origins and early life',[22.5,40.75],sources.alexander),
 ...collection.campaign.map(r=>association('alexander',r.id==='stage-egypt'?'egypt':r.id==='stage-bactria'?'bactria':r.id==='stage-macedonia'?'macedonia':r.id,r.startYear,r.endYear,r.region,r.point,collection.sources.find(s=>s.id===r.sourceIds[0])?.url)),
 association('philip','macedonia',-359,-336,'Rule in Macedonia',[22.5,40.75],sources.philip),
 association('ptolemy','egypt',-323,-283,'Government and rule in Egypt',[30,27],sources.egypt),
 association('aristotle','athens',-335,-323,'Lyceum period in Athens',[23.73,37.98],sources.aristotle),
 association('ptolemy','macedonia',-367,-367,'Macedonian origins',[21.8,40.5],sources.ptolemy),
 association('bactra','bactria',-330,-326,'City within the Bactria study area',[66.9,36.77],'https://pleiades.stoa.org/places/961886')
 ];
 const relationships=[
 {a:'alexander',b:'philip',label:'Father / son',startYear:-356,endYear:-336},
 {a:'alexander',b:'ptolemy',label:'Companion and general',startYear:-336,endYear:-323},
 {a:'alexander',b:'aristotle',label:'Pupil / teacher',startYear:-343,endYear:-340},
 {a:'philip',b:'philip-reign',label:'His reign',startYear:-359,endYear:-336},
 {a:'ptolemy',b:'ptolemy-rule',label:'His rule in Egypt',startYear:-323,endYear:-283}
 ];
 expandWorld({entities,associations,relationships});
 entities.push(...exploration.entities);associations.push(...exploration.associations);relationships.push(...exploration.relationships);
 return {entities,associations,relationships,collection};
}
export function initialFocus(data,id='alexander'){const e=data.entities.find(e=>e.id===id)??data.entities.find(e=>e.id==='alexander')??data.entities[0];return {focus:e.id,start:e.startYear,end:e.endYear,kind:'all',area:'all'};}
export function changeFocus(data,state,id){const next=initialFocus(data,id),entity=data.entities.find(e=>e.id===next.focus);return ['area','state','city'].includes(entity.type)?{...next,start:state.start,end:state.end}:next;}
export function focusAssociations(data,state){const focus=data.entities.find(e=>e.id===state.focus);let list=data.associations.filter(a=>a.subject===state.focus||a.place===state.focus);
 if(focus.type==='area')list=data.associations.filter(a=>a.subject===state.focus||a.place===state.focus||data.entities.find(e=>e.id===a.subject)?.regionIds?.includes(state.focus));
 if(focus.type==='period'||focus.id==='global-overview')list=data.associations;
 if(focus.type==='event'&&focus.point&&(!focus.contextual||!list.length))list=[{subject:focus.id,place:focus.id,startYear:focus.startYear,endYear:focus.endYear,label:focus.region||focus.title,point:focus.point,source:focus.url}];
 if(['city','area','state'].includes(focus.type)&&!list.length&&focus.point)list=[{subject:focus.id,place:focus.id,startYear:focus.startYear,endYear:focus.endYear,label:focus.title,point:focus.point,source:focus.url}];
 return list.filter(a=>overlaps(a,state.start,state.end)&&(state.area==='all'||a.place===state.area||data.entities.find(e=>e.id===a.place)?.regionIds?.includes(state.area)));}
export function distance(a,b){const rad=Math.PI/180,dlat=(b[1]-a[1])*rad,dlon=(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dlon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));}
export function rankedContext(data,state){const f=data.entities.find(e=>e.id===state.focus);const anchors=['area','city','state'].includes(f.type)&&f.point?[{point:f.point,startYear:state.start,endYear:state.end}]:focusAssociations(data,{...state,area:'all'});const filterPoint=data.entities.find(e=>e.id===state.area)?.point;return data.entities.filter(e=>e.id!==state.focus&&overlaps(e,state.start,state.end)&&['event','period','person'].includes(e.type)&&(state.kind==='all'||e.type===state.kind)).map(e=>{
 const personPoints=e.type==='person'?data.associations.filter(a=>a.subject===e.id&&overlaps(a,Math.max(e.startYear,state.start),Math.min(e.endYear,state.end))).map(a=>a.point):[];
 const relevant=anchors.filter(a=>overlaps(a,Math.max(e.startYear,state.start),Math.min(e.endYear,state.end)));
 return {...e,km:relevant.length&&(e.point||personPoints.length)?Math.min(...relevant.flatMap(a=>(e.point?[e.point]:personPoints).map(p=>distance(a.point,p)))):null};
 }).filter(e=>state.area==='all'||e.regionIds?.includes(state.area)||filterPoint&&e.point&&distance(filterPoint,e.point)<1200).sort((a,b)=>(a.km??Infinity)-(b.km??Infinity)||a.startYear-b.startYear);}
export function relatedEntities(data,state){const ids=new Map();for(const r of data.relationships){if(r.a===state.focus)ids.set(r.b,r.labelFromA??r.label);if(r.b===state.focus)ids.set(r.a,r.labelFromB??r.label);}
 for(const a of data.associations){if(a.subject===state.focus)ids.set(a.place,a.label);if(a.place===state.focus)ids.set(a.subject,a.label);}
 if(state.focus==='alexander')ids.set('period','Compare this whole period');
 if(state.focus.startsWith('stage-'))ids.set('alexander','Campaign of Alexander');
 if(['ptolemy-egypt','ptolemy-rule','ptolemy-king'].includes(state.focus)){ids.set('ptolemy','Ruler');ids.set('egypt','Associated area');}
 if(['philip-king','philip-reign','chaeronea'].includes(state.focus)){ids.set('philip','King of Macedonia');ids.set('macedonia','Associated kingdom');}
 return [...ids].map(([id,relation])=>{const e=data.entities.find(e=>e.id===id);return e?{...e,relation,inWindow:overlaps(e,state.start,state.end)}:null;}).filter(Boolean);}
export function encodeFocus(s){return '#'+new URLSearchParams({focus:s.focus,from:s.start,to:s.end,kind:s.kind,area:s.area});}
export function decodeFocus(hash,data){const p=new URLSearchParams(hash.replace(/^#/,''));const s=initialFocus(data,p.get('focus'));const a=Number(p.get('from')),b=Number(p.get('to'));if(p.has('focus')&&p.has('from')&&p.has('to')&&Number.isInteger(a)&&Number.isInteger(b)&&a<=b&&a>=-300000&&b<=2026&&a!==0&&b!==0){s.start=a;s.end=b;}if(['all','event','period','person'].includes(p.get('kind')))s.kind=p.get('kind');if((p.get('area')==='all'||data.entities.some(e=>e.id===p.get('area')&&['area','state','city'].includes(e.type))))s.area=p.get('area');return s;}

// Bounds describe possible dates, not an event lasting for the entire dating range.
export function temporalLabel(record, state) {
 if(record.temporalKind==='dated-evidence') return 'Date uncertain within this range';
 const u=record.uncertainty;
 if(u){
  const coversRange=state.start<=u.start[0]&&state.end>=u.end[1];
  const coreExists=u.start[1]<=u.end[0];
  const intersectsCore=coreExists&&state.start<=u.end[0]&&state.end>=u.start[1];
  return !coversRange&&!intersectsCore?'Possible overlap · dates uncertain':'Broad context · dates uncertain';
 }
 return record.contextual?record.dateLabel:'';
}
