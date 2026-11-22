// Search the whole collection, independently of the visible dates and filters.
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchEntities(entities,query){
 const q=normalize(query);if(!q)return [];
 const words=q.split(/\s+/);
 return entities.map(entity=>{
  const title=normalize(entity.title),body=normalize([entity.title,entity.type,entity.region,...(entity.aliases||[]),entity.description,entity.note].join(' '));
  if(!words.every(word=>body.includes(word)))return null;
  const score=title===q?0:title.startsWith(q)?1:title.includes(q)?2:words.every(word=>title.includes(word))?3:4;
  return {entity,score};
 }).filter(Boolean).sort((a,b)=>a.score-b.score||a.entity.title.localeCompare(b.entity.title)).map(r=>r.entity);
}
