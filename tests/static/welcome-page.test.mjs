import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output=process.env.HISTORICA_STATIC_TEST_OUTPUT||'release/static-pilot';
const selection=process.env.HISTORICA_STATIC_TEST_SELECTION?new Set(JSON.parse(fs.readFileSync(process.env.HISTORICA_STATIC_TEST_SELECTION))):null;
const text=html=>html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
for(const [id,file,route] of [['home','index.html','index.html'],['about','about.html','about/index.html']]){
 test(`Astro ${id} preserves visible content and links`,{skip:!!selection&&!selection.has('@'+id)},()=>{
  const actual=fs.readFileSync(`${output}/${route}`,'utf8'),original=fs.readFileSync(`web/${file}`,'utf8');
  assert.match(actual,new RegExp(`data-static-page="${id}"`));
  const main=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(text(main(actual)),text(main(original)));
  const links=html=>[...main(html).matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(links(actual),links(original));
  assert.match(actual,/name="robots" content="noindex, follow"/);
  assert.match(actual,/property="og:image:width" content="1200"/);
  if(id==='home'){
   for(const hook of ['home-query','home-results','home-search-status'])assert.ok(actual.includes(`id="${hook}"`));
   assert.match(actual,/src="home.js"/);
   const structured=actual.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
   assert.equal(JSON.parse(structured).name,'Historica');
  }else assert.ok(!actual.includes('src="home.js"'));
 });
}
