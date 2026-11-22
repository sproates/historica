// Local structural checks. Source verification is a separate recorded review.
export function validateEvidence(pack,{release=false}={}) {
 const errors=[];const fail=(path,message)=>errors.push(`${path}: ${message}`);
 const text=v=>typeof v==='string'&&v.trim().length>0;
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const year=v=>Number.isInteger(v)&&v!==0;
 function date(d,path){
  if(!object(d)){fail(path,'date object required');return;}
  if(!['exact','approximate','range','unknown'].includes(d.precision))fail(path,'invalid precision');
  if(d.precision==='unknown'){if(d.earliest!==null||d.latest!==null)fail(path,'unknown dates require null bounds');return;}
  if(!year(d.earliest)||!year(d.latest)||d.earliest>d.latest)fail(path,'ordered non-zero integer year bounds required');
  if(d.precision==='exact'&&d.earliest!==d.latest)fail(path,'exact date requires equal bounds');
  if(!text(d.original))fail(path,'original date wording required');
  if(d.calendar!=='BCE/CE')fail(path,'calendar must be BCE/CE in this version');
 }
 if(!object(pack))return ['package: object required'];
 if(pack.schemaVersion!=='1.0')fail('schemaVersion','expected 1.0');
 const tables={};
 for(const key of ['entities','sources','claims','evidence','reviews','accounts']){
  if(!Array.isArray(pack[key])){fail(key,'array required');tables[key]=new Map();continue;}
  tables[key]=new Map();
  for(const row of pack[key]){
   if(!object(row)||!text(row.id)){fail(key,'every record requires an id');continue;}
   if(tables[key].has(row.id))fail(`${key}.${row.id}`,'duplicate id');
   tables[key].set(row.id,row);
  }
 }
 const ref=(table,id,path)=>{if(!tables[table].has(id))fail(path,`unknown ${table} id ${id}`);};
 for(const [id,e] of tables.entities){
  if(!text(e.name))fail(id,'entity name required');
  if(!['person','area','state','city','period','event'].includes(e.type))fail(id,'invalid entity type');
 }
 for(const [id,s] of tables.sources){
  for(const k of ['title','creator','locatorHint','accessed','reuse'])if(!text(s[k]))fail(id,`${k} required`);
  try{if(!['http:','https:'].includes(new URL(s.url).protocol))throw Error();}catch{fail(id,'direct http(s) source URL required');}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s.accessed||''))fail(id,'accessed must use YYYY-MM-DD');
 }
 for(const [id,r] of tables.reviews){
  for(const k of ['reviewer','date','reason'])if(!text(r[k]))fail(id,`${k} required`);
  if(!['verified','rejected','needs-review'].includes(r.decision))fail(id,'invalid review decision');
 }
 for(const [id,e] of tables.evidence){
  ref('claims',e.claimId,id);ref('sources',e.sourceId,id);
  if(!['supports','contradicts','context'].includes(e.relation))fail(id,'invalid evidence relation');
  if(!text(e.locator)||!text(e.note))fail(id,'source locator and evidence note required');
  if(e.reviewId!==null)ref('reviews',e.reviewId,id);
 }
 for(const [id,c] of tables.claims){
  ref('entities',c.subjectId,id);
  if(!text(c.predicate)||!text(c.statement))fail(id,'predicate and statement required');
  if(!['draft','accepted','rejected'].includes(c.status))fail(id,'invalid status');
  if(!['uncontested','disputed','unknown'].includes(c.certainty))fail(id,'invalid certainty');
  if(!Array.isArray(c.evidenceIds))fail(id,'evidenceIds array required');
  const evidence=(Array.isArray(c.evidenceIds)?c.evidenceIds:[]).map(eid=>{ref('evidence',eid,id);const e=tables.evidence.get(eid);if(e&&e.claimId!==id)fail(id,'evidence belongs to another claim');return e;}).filter(Boolean);
  if(!object(c.value))fail(id,'typed value required');
  else if(c.value.type==='date')date(c.value.date,`${id}.value`);
  else if(c.value.type==='entity')ref('entities',c.value.entityId,id);
  else if(c.value.type==='text'){if(!text(c.value.text))fail(id,'text value required');}
  else if(c.value.type==='point'){
   const p=c.value.coordinates;
   if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||Math.abs(p[0])>180||Math.abs(p[1])>90)fail(id,'valid longitude/latitude required');
   if(!['reference','documented-presence','residence','territorial-association'].includes(c.value.meaning))fail(id,'point meaning required');
  }else if(c.value.type==='geometry'){
   const g=c.value.geometry;
   if(!object(g)||g.type!=='Polygon'||!Array.isArray(g.coordinates)||!g.coordinates.length)fail(id,'Polygon required in this version');
   else for(const ring of g.coordinates){
    if(!Array.isArray(ring)||ring.length<4||ring.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||Math.abs(p[0])>180||Math.abs(p[1])>90)||JSON.stringify(ring[0])!==JSON.stringify(ring.at(-1)))fail(id,'polygon rings must be closed with valid coordinates');
   }
   for(const k of ['licence','method','interpretation'])if(!text(c.value[k]))fail(id,`geometry ${k} required`);
  }else fail(id,'unsupported value type');
  if(c.validity!==null){
   if(!object(c.validity))fail(id,'validity must be an interval or null');
   else{date(c.validity.start,`${id}.start`);date(c.validity.end,`${id}.end`);if(year(c.validity.start?.earliest)&&year(c.validity.end?.latest)&&c.validity.start.earliest>c.validity.end.latest)fail(id,'validity interval is reversed');}
  }
  if(['point','geometry'].includes(c.value?.type)&&!c.validity)fail(id,'spatial claim requires a validity interval');
  if(!Array.isArray(c.scopeIds))fail(id,'scopeIds array required');else c.scopeIds.forEach(x=>ref('entities',x,id));
  if(c.certainty==='disputed'&&!text(c.disputeNote))fail(id,'disputed claim requires an explanation');
  if(c.status==='accepted'||release){
   if(release&&c.status!=='accepted')fail(id,'release includes a non-accepted claim');
   if(!evidence.some(e=>e.relation==='supports'&&tables.reviews.get(e.reviewId)?.decision==='verified'))fail(id,'accepted claim needs verified supporting evidence');
   if(c.reviewId===null||!tables.reviews.has(c.reviewId))fail(id,'accepted claim needs a review');
   else if(tables.reviews.get(c.reviewId).decision!=='verified')fail(id,'claim review must be verified');
   const linked=[...tables.evidence.values()].filter(e=>e.claimId===id);
   if(linked.some(e=>e.relation==='contradicts')&&c.certainty!=='disputed')fail(id,'contradictory evidence must be disclosed');
  }
 }
 const themes=['settlement-mobility','livelihoods-technology-exchange','social-political-organisation','beliefs-knowledge-arts','change-continuity','external-connections'];
 for(const [id,a] of tables.accounts){
  ref('entities',a.regionId,id);
  if(!['draft','accepted'].includes(a.status))fail(id,'invalid account status');
  date(a.start,`${id}.start`);date(a.end,`${id}.end`);
  if(year(a.start?.earliest)&&year(a.end?.latest)&&a.start.earliest>a.end.latest)fail(id,'account interval is reversed');
  if(!Array.isArray(a.sentences)||!Array.isArray(a.themes)){fail(id,'sentences and themes arrays required');continue;}
  for(const s of a.sentences){if(!text(s.text)||!Array.isArray(s.claimIds)||!s.claimIds.length)fail(id,'each sentence requires claim links');else for(const cid of s.claimIds){ref('claims',cid,id);if((release||a.status==='accepted')&&tables.claims.get(cid)?.status!=='accepted')fail(id,'account contains unaccepted claim');}}
  for(const theme of themes){const t=a.themes.find(x=>x.id===theme);if(!t){fail(id,`missing theme ${theme}`);continue;}
   if(!['unresearched','supported','limited'].includes(t.status))fail(id,'invalid theme status');
   if(t.status==='supported'&&(!Array.isArray(t.claimIds)||!t.claimIds.length))fail(id,'supported theme requires claims');
   for(const cid of t.claimIds||[]){ref('claims',cid,id);if((release||a.status==='accepted')&&tables.claims.get(cid)?.status!=='accepted')fail(id,'theme contains unaccepted claim');}
   if(t.status==='limited'&&(!text(t.note)||!Array.isArray(t.sourceIds)||!t.sourceIds.length))fail(id,'limited evidence requires research explanation and source links');
   for(const sid of t.sourceIds||[])ref('sources',sid,id);
   if((release||a.status==='accepted')&&t.status==='unresearched')fail(id,'accepted account has unresearched theme');
  }
  if(release||a.status==='accepted'){
   if(a.status!=='accepted')fail(id,'release includes a draft account');
   if(!a.sentences.length)fail(id,'accepted account needs a sourced summary');
   if(tables.reviews.get(a.reviewId)?.decision!=='verified')fail(id,'accepted account needs verified review');
  }
 }
 return errors;
}
