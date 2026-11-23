import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHistoryRenderer} from '../web/generated/presentation/history-renderer.js';
import {geometry} from '../web/generated/presentation/history-page.js';
import {buildFocusData,initialFocus,rankedContext,focusAssociations} from '../scripts/lib/focus-data.ts';
const read=name=>JSON.parse(fs.readFileSync(`web/data/${name}.json`,'utf8'));
const collection=read('collection'),data=buildFocusData(collection,read('reviewed-exploration')),reviewedEvidence=read('reviewed-evidence');
function harness(id='socrates'){
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},setAttribute(name,value){this[name]=value;}});return nodes.get(id);};
 const root={getElementById:node,querySelector:node,title:''};
 const context={data,state:initialFocus(data,id),selectedYear:null,comparedPeople:[],comparisonMode:'shared',reviewedEvidence,expandedLanes:new Set(),land:'',focusGeography:[],bactriaOutline:geometry(collection.historicalOverlays[0].geometry),showAllContext:false};
 let mapped=[];
 const renderer=createHistoryRenderer(root,()=>context,places=>{mapped=places;});
 return {node,root,context,renderer,get mapped(){return mapped;},render(){
   const f=data.entities.find(e=>e.id===context.state.focus),ranked=rankedContext(data,context.state);
   renderer.renderFocus(f);renderer.renderComparison(f,ranked);renderer.renderSwimlanes(f,ranked);renderer.renderDetails(f,ranked);renderer.renderMap(focusAssociations(data,context.state),f);renderer.renderRegionalEvidence(f);renderer.renderYear(ranked,f);
 }};
}

test('every history renders title, timeline, details and map references through the typed boundary',()=>{
 const h=harness();
 for(const entity of data.entities){
  h.context.state=initialFocus(data,entity.id);h.render();
  assert.equal(h.node('focus-title').textContent,entity.title);
  assert.ok(h.node('swimlanes').innerHTML.includes('swim-axis'),entity.id);
  assert.ok(h.node('lanes').innerHTML.includes('YOUR FOCUS'),entity.id);
  assert.ok(h.node('evidence').innerHTML.includes('Research references'),entity.id);
  assert.doesNotMatch(h.node('swimlanes').innerHTML,/NaN|Infinity/,entity.id);
 }
});

test('rendering reads changed comparison and year state without owning it',()=>{
 const h=harness();h.render();
 assert.match(h.node('comparison-intro').textContent,/alive throughout the Peloponnesian War/);
 h.context.comparedPeople=['socrates','alexander'];h.context.selectedYear=-420;h.render();
 assert.match(h.node('comparison-intro').textContent,/do not overlap/);
 assert.equal(h.node('.comparison-modes').hidden,true);
 assert.equal(h.node('year-cursor').value,'-419');
 assert.match(h.node('living-people').innerHTML,/Socrates/);
 h.context.selectedYear=null;h.context.comparedPeople=[];h.render();
 assert.equal(h.node('year-controls').hidden,true);
 assert.equal(h.node('.comparison-modes').hidden,false);
});

test('authored descriptions remain escaped and open paragraphs are preserved on redraw',()=>{
 const h=harness();
 const entity={...data.entities[0],id:'escape-probe',description:'<script>alert("x")</script>\n\nSecond paragraph & detail'};
 h.renderer.renderDescription(entity);
 assert.doesNotMatch(h.node('focus-description').innerHTML,/<script>/);
 assert.match(h.node('focus-description').innerHTML,/&lt;script&gt;/);
 assert.match(h.node('focus-description').innerHTML,/Second paragraph &amp; detail/);
 h.node('focus-description').innerHTML='opened by reader';
 h.renderer.renderDescription(entity);
 assert.equal(h.node('focus-description').innerHTML,'opened by reader');
});

test('unlocated map associations retain their source reference without inventing a marker',()=>{
 const h=harness(),focus=data.entities.find(e=>e.id==='socrates');
 const association={subject:focus.id,place:'athens',point:null,startYear:-469,endYear:-399,label:'Location unknown',source:'https://example.org/evidence'};
 h.renderer.renderMap([association],focus);
 assert.doesNotMatch(h.node('focus-map').innerHTML,/class="map-marker"/);
 assert.match(h.node('evidence').innerHTML,/https:\/\/example.org\/evidence/);
});
