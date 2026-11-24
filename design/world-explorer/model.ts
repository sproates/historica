export interface Entry { id:string;type:string;title:string;startYear:number;endYear:number;description?:string;point:[number,number]|null }
export interface Association {subject:string;place:string;startYear:number;endYear:number;point:[number,number]|null;label:string}
export interface Place {key:string;point:[number,number];name:string;entries:Entry[];dated:boolean}
export const year=(n:number)=>`${Math.abs(n).toLocaleString()} ${n<0?'BCE':'CE'}`;
export const ordinal=(n:number)=>n<0?n+1:n;
export const calendar=(n:number)=>n<=0?n-1:n;
export const overlaps=(a:number,b:number,c:number,d:number)=>a<=d&&b>=c;
export function placesFor(entries:Entry[],associations:Association[],from:number,to:number):Place[]{
 const names=new Map(entries.map(e=>[e.id,e.title]));
 const indexed=new Map<string,Association[]>();
 for(const a of associations){const list=indexed.get(a.subject)||[];list.push(a);indexed.set(a.subject,list);}
 const places=new Map<string,Place>();
 for(const entry of entries){
  if(!overlaps(entry.startYear,entry.endYear,from,to))continue;
  const known=indexed.get(entry.id)||[];
  const located=known.filter(a=>a.point&&overlaps(a.startYear,a.endYear,from,to));
  const points=located.map(a=>({point:a.point!,name:names.get(a.place)||a.label,dated:true}));
  if(!known.length&&entry.point)points.push({point:entry.point,name:entry.title,dated:false});
  for(const item of points){
   const key=item.point.map(n=>n.toFixed(4)).join(',');
   let place=places.get(key);
   if(!place){place={key,point:item.point,name:item.name,entries:[],dated:item.dated};places.set(key,place);}
   if(!place.entries.some(e=>e.id===entry.id))place.entries.push(entry);
   // A place's own title is more useful than the title of a visiting person's record.
   if(entry.point&&entry.point.every((n,i)=>Math.abs(n-item.point[i]!)<.0001)&&['area','city'].includes(entry.type))place.name=entry.title;
  }
 }
 return [...places.values()];
}
export function uniqueEntries(places:Place[]):Entry[]{return [...new Map(places.flatMap(p=>p.entries).map(e=>[e.id,e])).values()].sort((a,b)=>a.startYear-b.startYear||a.title.localeCompare(b.title));}
