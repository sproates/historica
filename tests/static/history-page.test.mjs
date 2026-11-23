import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {historyPage,historyEntities,dates,xy} from '../../scripts/static/history-page.mjs';
import {fitMapCamera} from '../../web/generated/domain/map-camera.js';
const html=fs.readFileSync('release/static-pilot/person/alexander/index.html','utf8');
const page=historyPage('alexander');

test('Alexander ships readable history, comparisons, timeline and references without executing JavaScript',()=>{
  assert.match(html,/<body data-static-history="alexander">/);
  assert.match(html,/<h1 id="focus-title">Alexander the Great<\/h1>/);
  assert.ok(html.includes(dates(-356,-323)));
  for(const record of page.comparisons.items)assert.ok(html.includes(record.title),record.id);
  for(const lane of page.timeline.lanes)assert.ok(html.includes(`aria-label="${lane.name}"`),lane.name);
  for(const source of page.references)assert.ok(html.includes(source.replaceAll('&','&amp;')),source);
  assert.match(html,/<noscript>/);
  assert.match(html,/href="\/person\/philip"/);
  assert.match(html,/name="robots" content="noindex, follow"/);
  assert.match(html,/Historica is an open source site on/);
});

test('static map fits the actual associated points and contains their geography',()=>{
  const camera=fitMapCamera(page.places.map(a=>xy(a.point)));
  assert.ok(camera.w<720);
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
  assert.equal((html.match(/class="map-marker"/g)||[]).length,page.places.length);
  assert.ok((html.match(/<path /g)||[]).length>=page.land.length);
  for(const a of page.places)assert.ok(html.includes(a.label),a.label);
});

test('pilot retains every existing controller hook exactly once',()=>{
  const template=fs.readFileSync('web/focus.html','utf8');
  const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const actual=ids(html);
  assert.equal(new Set(actual).size,actual.length,'duplicate DOM IDs');
  assert.deepEqual(new Set(actual),new Set(ids(template)));
  assert.match(html,/src="focus-app\.js\?v=exploration-2"/);
  assert.match(html,/<base href="\/"/);
});

test('Socrates is a static page with the war comparison and checked source passages',()=>{
  const page=historyPage('socrates');
  const html=fs.readFileSync('release/static-pilot/person/socrates/index.html','utf8');
  assert.match(html,/<body data-static-history="socrates">/);
  assert.match(html,/<h1 id="focus-title">Socrates<\/h1>/);
  assert.ok(html.includes('Socrates was alive throughout the Peloponnesian War'));
  assert.ok(html.includes(dates(-469,-399)));
  assert.ok(page.checked.length>0);
  for(const claim of page.checked)for(const source of claim.citations)assert.ok(html.includes(source.url.replaceAll('&','&amp;')),source.url);
  assert.match(html,/href="https:\/\/historica.online\/person\/socrates"/);
});

test('Egypt renders a study window and a fitted geographical reference rather than a lifespan',()=>{
  const page=historyPage('egypt');
  const html=fs.readFileSync('release/static-pilot/area/egypt/index.html','utf8');
  assert.match(html,/<body data-static-history="egypt">/);
  assert.match(html,/<button id="fit">Fit study period<\/button>/);
  assert.ok(html.includes(dates(-3100,200)));
  assert.ok(html.includes('editorial study window'));
  assert.ok(html.includes('Focus area reference: Egypt'));
  assert.ok(html.includes('Place study window'));
  const camera=fitMapCamera([...page.places.map(a=>xy(a.point)),xy(page.focusPoint)]);
  assert.ok(camera.w<720);
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
  assert.match(html,/href="https:\/\/historica.online\/area\/egypt"/);
});

test('every history route retains the controller hooks exactly once',()=>{
  const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const expected=new Set(ids(fs.readFileSync('web/focus.html','utf8')));
  for(const e of historyEntities()){
    const route=`${e.type}/${e.id}`;
    const html=fs.readFileSync(`release/static-pilot/${route}/index.html`,'utf8'),actual=ids(html);
    assert.equal(new Set(actual).size,actual.length,route);
    assert.deepEqual(new Set(actual),expected,route);
  }
});


test('all published histories have static routes, readable dates and canonical metadata',()=>{
  const entities=historyEntities();
  const routes=JSON.parse(fs.readFileSync('web/data/routes.json','utf8'));
  assert.deepEqual(new Set(entities.map(e=>`/${e.type}/${e.id}`)),new Set(routes));
  assert.equal(new Set(entities.map(e=>e.type)).size,6);
  for(const e of entities){
    const route=`/${e.type}/${e.id}`;
    const html=fs.readFileSync(`release/static-pilot${route}/index.html`,'utf8');
    assert.ok(html.includes(`data-static-history="${e.id}"`),route);
    assert.ok(html.includes(dates(e.startYear,e.endYear)),route);
    assert.ok(html.includes(`href="https://historica.online${route}"`),route);
    assert.doesNotMatch(html,/(?:NaN|Infinity)(?:%|px|;|\s)/,route);
  }
});

test('contextual pages include their checked evidence before JavaScript runs',()=>{
  for(const e of historyEntities().filter(e=>e.contextual)){
    const page=historyPage(e.id);
    const html=fs.readFileSync(`release/static-pilot/${e.type}/${e.id}/index.html`,'utf8');
    assert.match(html,/<section id="regional-evidence">/,e.id);
    assert.ok(html.includes('What the evidence shows'),e.id);
    const cards=html.slice(html.indexOf('<section id="regional-evidence">'));
    assert.equal((cards.match(/<article>/g)||[]).length,page.checked.length,e.id);
    for(const claim of page.checked)for(const source of claim.citations)assert.ok(cards.includes(source.url.replaceAll('&','&amp;')),e.id);
  }
});

test('Britain and Ireland retains its land highlight and fits the region',()=>{
  const page=historyPage('britain-ireland');
  const html=fs.readFileSync('release/static-pilot/area/britain-ireland/index.html','utf8');
  assert.equal(page.regionPaths.length,3);
  assert.match(html,/class="focus-region"/);
  assert.ok(html.includes('not ancient borders'));
  assert.match(html,/<button id="map-fit">Fit area<\/button>/);
  const camera=fitMapCamera(page.regionPoints.map(xy));
  assert.ok(html.includes(`viewBox="${camera.x} ${camera.y} ${camera.w} ${camera.w/2}"`));
});

test('single-year events show overlapping lives across the detail track',()=>{
  const event=historyEntities().find(e=>e.type==='event'&&e.startYear===e.endYear);
  const html=fs.readFileSync(`release/static-pilot/event/${event.id}/index.html`,'utf8');
  const details=html.slice(html.indexOf('<div id="lanes">'));
  assert.match(details,/class="band life[^"]*" style="left:0%;width:100%"/);
});
