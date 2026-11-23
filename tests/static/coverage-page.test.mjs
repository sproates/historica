import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION))):null;
test('Astro coverage preserves research explanations, controls and the public address',{skip:!!selection&&!selection.has('@coverage')},()=>{
 const html=fs.readFileSync(`${output}/coverage/index.html`,'utf8');
 for(const explanation of ['Checked against sources','Still provisional','Still incomplete','They are not independent expert review.','An empty part of the timeline means missing research'])assert.ok(html.includes(explanation));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(ids.sort(),['checked-total','error','totals','revision','group','workflow','evidence-filter','pilot','match-count','matrix','package-detail','research-findings','supplementary'].sort());
 assert.equal(new Set(ids).size,ids.length);
 assert.match(html,/data-static-page="coverage"/);
 assert.match(html,/rel="canonical" href="https:\/\/historica.online\/coverage.html"/);
 assert.match(html,/href="coverage.css"/);assert.ok(!html.includes('href="welcome.css"'));
 assert.match(html,/src="coverage-app.js"/);assert.ok(!html.includes('src="home.js"'));
 assert.match(html,/name="robots" content="noindex, follow"/);
});
