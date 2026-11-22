import {buildFocusData} from './focus-model.js?v=egypt-1';
import {searchEntities} from './search-model.js';
// Keep old shared fragments usable while the root becomes an introduction.
if(location.hash.startsWith('#focus='))location.replace('/focus.html'+location.hash);
const input=document.getElementById('home-query'),results=document.getElementById('home-results'),status=document.getElementById('home-search-status');
let data;
const date=y=>`${Math.abs(y).toLocaleString()} ${y<0?'BCE':'CE'}`;
function search(){
 results.replaceChildren();const query=input.value.trim();results.hidden=!query;
 if(!query){status.textContent='Search the collection, from early Egypt to the Roman world.';return;}
 if(!data){status.textContent='Loading the collection…';return;}
 const matches=searchEntities(data.entities,query);
 status.textContent=matches.length?`${matches.length} matches${matches.length>12?' · showing the first 12':''}`:'No matches. Try another name or place.';
 for(const e of matches.slice(0,12)){
  const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');
  a.href=`/${e.type}/${encodeURIComponent(e.id)}`;a.append(document.createTextNode(e.title));small.textContent=`${e.type} · ${date(e.startYear)} – ${date(e.endYear)}`;a.append(small);li.append(a);results.append(li);
 }
}
input.addEventListener('input',search);
input.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){const first=results.querySelector('a');if(first){event.preventDefault();first.focus();}}if(event.key==='Escape'){input.value='';search();}});
try{
 const load=async url=>{const response=await fetch(url);if(!response.ok)throw Error('Collection unavailable');return response.json();};
 const [collection,exploration]=await Promise.all([load('/data/collection.json'),load('/data/reviewed-exploration.json')]);
 data=buildFocusData(collection,exploration);search();
}catch{status.textContent='Search is unavailable just now. Please try a featured history below.';input.disabled=true;}
