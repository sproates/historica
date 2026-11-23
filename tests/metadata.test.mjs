import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync('web/'+p,'utf8');
test('every published history has unique crawler-visible metadata and canonical path',()=>{
 const routes=JSON.parse(read('data/routes.json'));
 const sitemap=read('sitemap.xml');
 assert.deepEqual(fs.readdirSync('web/pages').filter(file=>file.endsWith('.html')).sort(),routes.map(route=>route.split('/').at(-1)+'.html').sort(),'generated page inventory matches the current routes');
 for(const route of routes){
  const html=read('pages/'+route.split('/').at(-1)+'.html');
  assert.equal((html.split('</head>')[0].match(/<title>/g)||[]).length,1,route);
  assert.equal((html.match(/name="description"/g)||[]).length,1,route);
  assert.ok(html.includes(`rel="canonical" href="https://historica.online${route}"`),route);
  assert.ok(html.includes(`property="og:url" content="https://historica.online${route}"`),route);
  assert.ok(!html.includes('content="noindex, follow"'),route);
  assert.match(html,/<h1 id="focus-title">[^<]+<\/h1>/);
  assert.ok(sitemap.includes(`<loc>https://historica.online${route}</loc>`));
 }
 assert.match(read('pages/socrates.html'),/<title>Socrates · Historica<\/title>/);
 assert.match(read('pages/khufu-reign.html'),/<title>Khufu and the Great Pyramid · Historica<\/title>/);
});
test('main pages expose social images and the site identity without JavaScript',()=>{
 for(const name of ['index.html','about.html','coverage.html']){
  const html=read(name);
  assert.match(html,/property="og:image" content="https:\/\/historica.online\/share-historica.png"/);
  assert.match(html,/name="twitter:card" content="summary_large_image"/);
  assert.equal((html.split('</head>')[0].match(/<title>/g)||[]).length,1);
 }
 const schema=JSON.parse(read('index.html').match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(schema.name,'Historica');assert.equal(schema.creator.name,'Ian Sproates');
 const png=fs.readFileSync('web/share-historica.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 assert.ok(read('robots.txt').includes('https://historica.online/sitemap.xml'));
});
