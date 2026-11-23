import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {historyPage,dates,xy} from '../../scripts/static/history-page.mjs';
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

test('all three pilot routes retain the controller hooks exactly once',()=>{
  const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const expected=new Set(ids(fs.readFileSync('web/focus.html','utf8')));
  for(const route of ['person/alexander','person/socrates','area/egypt']){
    const html=fs.readFileSync(`release/static-pilot/${route}/index.html`,'utf8'),actual=ids(html);
    assert.equal(new Set(actual).size,actual.length,route);
    assert.deepEqual(new Set(actual),expected,route);
  }
});
