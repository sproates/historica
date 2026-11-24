import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION))):null;
for(const [id,route] of [['home','index.html'],['about','about/index.html']]){
 test(`Astro ${id} supplies navigation, metadata and page-specific content`,{skip:!!selection&&!selection.has('@'+id)},()=>{
  const actual=fs.readFileSync(`${output}/${route}`,'utf8');
  assert.match(actual,new RegExp(`data-static-page="${id}"`));
  assert.match(actual,/<h1>[^<]+<\/h1>/);
  assert.ok(actual.includes('Historica is an open source site on'));
  assert.ok(actual.includes('href="https://github.com/sproates/historica"'));
  assert.ok(actual.includes('href="/coverage.html"'));
  assert.match(actual,/name="robots" content="noindex, follow"/);
  assert.match(actual,/property="og:image:width" content="1200"/);
  if(id==='home'){
   for(const hook of ['browse-query','browse-results','browse-status','view-map','view-browse','map','sheet'])assert.ok(actual.includes(`id="${hook}"`));
   assert.match(actual,/src="generated\/explorer\/home-[A-Z0-9]+\.js"/);
   assert.ok(actual.includes('data-theme-toggle'));
   assert.ok(actual.includes('/period/predynastic-egypt'));
   assert.ok(!actual.includes('design-preview/'));
   assert.ok(actual.includes('id="browse-results" data-initial><a'), 'Static browsing works before JavaScript');
   assert.ok(actual.indexOf('dataset.explorerView') < actual.indexOf('<body'), 'Requested view is selected before body paint');
   assert.ok(!actual.includes('id="explorer" hidden'), 'Map mode is not hidden until the history request completes');
   const initialEntries=actual.match(/class="browse-entry"[^>]*><strong>.*?<\/strong><small>.*?<\/small><p>.*?<\/p><\/a>/g)||[];
   assert.ok(initialEntries.length>24,'Static fallback includes descriptions beyond the enhanced first page');
   const structured=actual.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
   assert.equal(JSON.parse(structured).name,'Historica');
   for(const route of ['/period/stonehenge','/person/socrates','/person/alexander','/person/julius-caesar?kind=person'])assert.ok(actual.includes(`href="${route}"`));
  }else {
   assert.ok(!actual.includes('src="generated/entrypoints/home.js"'));
   assert.ok(actual.includes('Created by Ian Sproates'));
   for(const url of ['https://sproates.net','https://www.linkedin.com/in/sproates/','https://github.com/sproates'])assert.ok(actual.includes(`href="${url}"`));
  }
 });
}
