import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION))):null;
test('privacy describes analytics and local preferences and is linked beside coverage',{skip:!!selection&&!selection.has('@privacy')},()=>{
 const html=fs.readFileSync(`${output}/privacy/index.html`,'utf8');
 for(const text of ['Cloudflare Web Analytics','does not set cookies','local storage','OpenStreetMap','current browser tab','query strings','https://sproates.net','data-theme-toggle'])assert.ok(html.includes(text),text);
 assert.match(html,/rel="canonical" href="https:\/\/historica.online\/privacy"/);
 for(const file of ['index.html','about/index.html','coverage/index.html','person/alexander/index.html']){
  const page=fs.readFileSync(`${output}/${file}`,'utf8');
  assert.match(page,/<footer\b[^>]*>[\s\S]*?coverage.html[^>]*>[^<]+<\/a> · <a href="\/privacy">Privacy<\/a>/,file);
 }
});
