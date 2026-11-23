import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION))):null;
test('Astro coverage preserves research explanations, controls and the public address',{skip:!!selection&&!selection.has('@coverage')},()=>{
 const html=fs.readFileSync(`${output}/coverage/index.html`,'utf8');
 const original=fs.readFileSync('web/coverage.html','utf8');
 const main=value=>value.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
 const text=value=>main(value).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 assert.equal(text(html),text(original));
 const ids=value=>[...value.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(ids(html),ids(original));assert.equal(new Set(ids(html)).size,ids(html).length);
 assert.match(html,/data-static-page="coverage"/);
 assert.match(html,/rel="canonical" href="https:\/\/historica.online\/coverage.html"/);
 assert.match(html,/href="coverage.css"/);assert.ok(!html.includes('href="welcome.css"'));
 assert.match(html,/src="coverage-app.js"/);assert.ok(!html.includes('src="home.js"'));
 assert.match(html,/name="robots" content="noindex, follow"/);
});
