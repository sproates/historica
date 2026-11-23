import fs from 'node:fs';
import {buildFocusData} from '../web/focus-model.js';
import {origin,description,metadataHead as head} from '../web/generated/presentation/metadata.js';
import {escapeHtml as escape} from '../web/generated/presentation/html.js';
function inject(html,title,desc,path,options){
 return html.replace(/<!-- metadata:start -->[\s\S]*?<!-- metadata:end -->\s*/g,'').replace(/<title>[\s\S]*?<\/title>/g,'').replace(/<meta name="description"[^>]*>/g,'').replace('</head>',head(title,desc,path,options)+'\n</head>');
}
const pages=[['index.html','Historica · Visualising history','Explore people, places and events on a shared timeline. See what was happening elsewhere, follow connections and compare histories across the world.','/',{website:true}],['about.html','About Historica','Why Ian Sproates created Historica, how to explore the timelines, and what the growing historical collection covers so far.','/about'],['coverage.html','Sources and research coverage · Historica','See what has been checked, what is provisional and where Historica still has gaps. Explore the linked sources and research coverage.','/coverage.html'],['campaign.html','Earlier campaign prototype · Historica','An earlier prototype exploring Alexander’s campaigns.','/campaign.html',{noindex:true}],['focus.html','Explore history · Historica','Explore connected lives, places and events.','/focus.html',{noindex:true}]];
for(const [file,title,desc,path,options]of pages){const name='web/'+file;fs.writeFileSync(name,inject(fs.readFileSync(name,'utf8'),title,desc,path,options));}
const data=buildFocusData(JSON.parse(fs.readFileSync('web/data/collection.json')),JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json')));
const template=fs.readFileSync('web/focus.html','utf8');fs.mkdirSync('web/pages',{recursive:true});
for(const e of data.entities){
 const path=`/${e.type}/${e.id}`;
 let html=inject(template,e.title+' · Historica',description(e.description),path);
 html=html.replace('<h1 id="focus-title"></h1>',`<h1 id="focus-title">${escape(e.title)}</h1>`).replace('<div id="focus-description"></div>',`<div id="focus-description"><p>${escape(e.description)}</p></div>`);
 fs.writeFileSync(`web/pages/${e.id}.html`,html);
}
// Remove retired generated pages only after current pages have been written.
const currentPages=new Set(data.entities.map(e=>e.id+'.html'));
for(const file of fs.readdirSync('web/pages'))if(file.endsWith('.html')&&!currentPages.has(file))fs.unlinkSync('web/pages/'+file);
const urls=['/','/about','/coverage.html',...data.entities.map(e=>`/${e.type}/${e.id}`)];
fs.writeFileSync('web/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(path=>`<url><loc>${escape(origin+path)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync('web/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built search and sharing metadata for ${data.entities.length} histories.`);
