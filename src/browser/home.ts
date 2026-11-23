import {parseSearchIndex} from '../content/search-index.js';
import {searchIndex} from '../domain/search.js';
import type {SearchIndex} from '../domain/search.js';

interface HomeEnvironment {
 document: Document;
 location: Pick<Location,'hash'|'replace'>;
 fetch: typeof fetch;
}
/** Enhance the static home page without loading map or evidence data. */
export async function startHome(base: string, environment: HomeEnvironment={document,location,fetch}): Promise<void> {
const {document,location,fetch}=environment;
const mounted=(path: string)=>base+path.replace(/^\//,'');
// Keep old shared fragments usable while the root becomes an introduction.
if(location.hash.startsWith('#focus='))location.replace(mounted('/focus.html')+location.hash);
const input=document.getElementById('home-query') as HTMLInputElement | null;
const results=document.getElementById('home-results'),status=document.getElementById('home-search-status');
if(!input || !results || !status)throw new Error('Missing home search controls');
let data: SearchIndex | undefined;
const date=(y: number)=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`;
const search=()=>{
 results.replaceChildren();const query=input.value.trim();results.hidden=!query;
 if(!query){status.textContent='Search the collection, from early Egypt to the Roman world.';return;}
 if(!data){status.textContent='Loading the collection…';return;}
 const matches=searchIndex(data,query);
 status.textContent=matches.length?`${matches.length} matches${matches.length>12?' · showing the first 12':''}`:'No matches. Try another name or place.';
 for(const e of matches.slice(0,12)){
  const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');
  a.href=mounted(`/${e.type}/${encodeURIComponent(e.id)}`);a.append(document.createTextNode(e.title));small.textContent=`${e.type} · ${date(e.startYear)} – ${date(e.endYear)}`;a.append(small);li.append(a);results.append(li);
 }
}
input.addEventListener('input',search);
input.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){const first=results.querySelector('a');if(first){event.preventDefault();first.focus();}}if(event.key==='Escape'){input.value='';search();}});
try{
 const load=async (url: string): Promise<unknown>=>{const response=await fetch(url);if(!response.ok)throw Error('Collection unavailable');return response.json();};
 data=parseSearchIndex(await load(mounted('/data/search-index.json')));search();
}catch{status.textContent='Search is unavailable just now. Please try a featured history below.';input.disabled=true;}
}
