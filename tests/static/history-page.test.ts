import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {historyPage,historyEntities,dates,xy} from '../../scripts/static/history-page.ts';
import {fitMapCamera} from '../../web/generated/domain/map-camera.js';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION,'utf8'))):null;
const affected=id=>!selection||selection.has(id);
const selectedEntities=()=>historyEntities().filter(e=>affected(e.id));
const pageTest=(id,name,fn)=>test(name,{skip:!affected(id)},fn);
const html=fs.readFileSync(`${output}/person/alexander/index.html`,'utf8');
const page=historyPage('alexander');

pageTest('alexander','Alexander ships readable history, comparisons, timeline and references without executing JavaScript',()=>{
  assert.match(html,/<body data-static-history="alexander">/);
  assert.match(html,/<h1 id="focus-title">Alexander the Great<\/h1>/);
  assert.ok(html.includes(dates(-356,-323)));
  for(const record of page.comparisons.items)assert.ok(html.includes(record.title),record.id);
  for(const lane of page.timeline.lanes)assert.ok(html.includes(`aria-label="${lane.name}"`),lane.name);
  for(const source of page.references)assert.ok(html.includes(source.replaceAll('&','&amp;')),source);
  assert.match(html,/<noscript>/);
  assert.match(html,/href="\/person\/philip\/"/);
  assert.match(html,/name="robots" content="noindex, follow"/);
  assert.match(html,/Historica is an open source site on/);
});

pageTest('alexander','static map fits the actual associated points and contains their geography',()=>{
  const camera=fitMapCamera(page.places.map(a=>xy(a.point)));
  assert.ok(camera.w<720);
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
  assert.equal((html.match(/class="map-marker"/g)||[]).length,page.places.length);
  const asset=JSON.parse(fs.readFileSync('web/data/map-assets.json','utf8')).land;
  assert.ok(html.includes(`href="${asset}"`));
  const svg=fs.readFileSync('web/'+asset.split('#')[0],'utf8');
  assert.equal((svg.match(/<path /g)||[]).length,page.land.length);
  assert.ok(Buffer.byteLength(html)<200_000,'History HTML must not embed the full world map');
  for(const a of page.places)assert.ok(html.includes(a.label),a.label);
});

pageTest('alexander','pilot retains every existing controller hook exactly once',()=>{
  const template=fs.readFileSync('web/focus.html','utf8');
  const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const actual=ids(html);
  assert.equal(new Set(actual).size,actual.length,'duplicate DOM IDs');
  assert.deepEqual(new Set(actual),new Set(ids(template)));
  assert.match(html,/src="generated\/entrypoints\/focus-app\.js"/);
  assert.match(html,/<base href="\/"/);
});

pageTest('socrates','Socrates is a static page with the war comparison and checked source passages',()=>{
  const page=historyPage('socrates');
  const html=fs.readFileSync(`${output}/person/socrates/index.html`,'utf8');
  assert.match(html,/<body data-static-history="socrates">/);
  assert.match(html,/<h1 id="focus-title">Socrates<\/h1>/);
  assert.ok(html.includes('Socrates was alive throughout the Peloponnesian War'));
  assert.ok(html.includes(dates(-469,-399)));
  assert.ok(page.checked.length>0);
  for(const claim of page.checked)for(const source of claim.citations)assert.ok(html.includes(source.url.replaceAll('&','&amp;')),source.url);
  assert.match(html,/href="https:\/\/historica.online\/person\/socrates\/"/);
});

pageTest('egypt','Egypt renders a study window and a fitted geographical reference rather than a lifespan',()=>{
  const page=historyPage('egypt');
  const html=fs.readFileSync(`${output}/area/egypt/index.html`,'utf8');
  assert.match(html,/<body data-static-history="egypt">/);
  assert.match(html,/<button id="fit">Fit study period<\/button>/);
  assert.ok(html.includes(dates(-3100,200)));
  assert.ok(html.includes('editorial study window'));
  assert.ok(html.includes('Focus area reference: Egypt'));
  assert.ok(html.includes('Place study window'));
  const camera=fitMapCamera([...page.places.map(a=>xy(a.point)),xy(page.focusPoint)]);
  assert.ok(camera.w<720);
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
  assert.match(html,/href="https:\/\/historica.online\/area\/egypt\/"/);
});

test('every history route retains the controller hooks exactly once',()=>{
  const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const expected=new Set(ids(fs.readFileSync('web/focus.html','utf8')));
  for(const e of selectedEntities()){
    const route=`${e.type}/${e.id}`;
    const html=fs.readFileSync(`${output}/${route}/index.html`,'utf8'),actual=ids(html);
    assert.equal(new Set(actual).size,actual.length,route);
    assert.deepEqual(new Set(actual),expected,route);
  }
});


test('all published histories have static routes, readable dates and canonical metadata',()=>{
  const entities=historyEntities();
  const routes=JSON.parse(fs.readFileSync('web/data/routes.json','utf8'));
  assert.deepEqual(new Set(entities.map(e=>`/${e.type}/${e.id}`)),new Set(routes));
  assert.equal(new Set(entities.map(e=>e.type)).size,6);
  for(const e of entities.filter(e=>affected(e.id))){
    const route=`/${e.type}/${e.id}`;
    const html=fs.readFileSync(`${output}${route}/index.html`,'utf8');
    assert.ok(html.includes(`data-static-history="${e.id}"`),route);
    assert.ok(html.includes(dates(e.startYear,e.endYear)),route);
    assert.ok(html.includes(`href="https://historica.online${route}/"`),route);
    assert.doesNotMatch(html,/(?:NaN|Infinity)(?:%|px|;|\s)/,route);
  }
});

test('contextual pages include their checked evidence before JavaScript runs',()=>{
  for(const e of selectedEntities().filter(e=>e.contextual)){
    const page=historyPage(e.id);
    const html=fs.readFileSync(`${output}/${e.type}/${e.id}/index.html`,'utf8');
    assert.match(html,/<section id="regional-evidence">/,e.id);
    assert.ok(html.includes('What the evidence shows'),e.id);
    const cards=html.slice(html.indexOf('<section id="regional-evidence">'));
    assert.equal((cards.match(/<article>/g)||[]).length,page.checked.length,e.id);
    for(const claim of page.checked)for(const source of claim.citations)assert.ok(cards.includes(source.url.replaceAll('&','&amp;')),e.id);
  }
});

pageTest('britain-ireland','Britain and Ireland retains its land highlight and fits the region',()=>{
  const page=historyPage('britain-ireland');
  const html=fs.readFileSync(`${output}/area/britain-ireland/index.html`,'utf8');
  assert.equal(page.regionPaths.length,3);
  assert.match(html,/class="focus-region"/);
  assert.ok(html.includes('not ancient borders'));
  assert.match(html,/<button id="map-fit">Fit area<\/button>/);
  const camera=fitMapCamera(page.regionPoints.map(xy));
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
});

const event=historyEntities().find(e=>e.type==='event'&&e.startYear===e.endYear);
pageTest(event.id,'single-year events show overlapping lives across the detail track',()=>{
  const html=fs.readFileSync(`${output}/event/${event.id}/index.html`,'utf8');
  const details=html.slice(html.indexOf('<div id="lanes">'));
  assert.match(details,/class="band life[^"]*" style="left:0%;width:100%"/);
});

test('static histories use complete shared search and sharing metadata',()=>{
 for(const entity of selectedEntities()){
  const content=fs.readFileSync(`${output}/${entity.type}/${entity.id}/index.html`,'utf8').split('</head>')[0];
  assert.equal((content.match(/<title>/g)||[]).length,1,entity.id);
  assert.equal((content.match(/name="description"/g)||[]).length,1,entity.id);
  for(const field of ['og:image:width','og:image:height','og:image:alt'])assert.ok(content.includes(`property="${field}"`),entity.id+' '+field);
  for(const field of ['twitter:title','twitter:description','twitter:image','twitter:image:alt'])assert.ok(content.includes(`name="${field}"`),entity.id+' '+field);
 }
});
