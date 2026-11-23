import fs from 'node:fs';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
import {origin,metadataHead as head} from '../web/generated/presentation/metadata.js';
import {escapeHtml as escape} from '../web/generated/presentation/html.js';
function inject(html: string,title: string,desc: string,path: string,options: {noindex:boolean}){
 return html.replace(/<!-- metadata:start -->[\s\S]*?<!-- metadata:end -->\s*/g,'').replace(/<title>[\s\S]*?<\/title>/g,'').replace(/<meta name="description"[^>]*>/g,'').replace('</head>',head(title,desc,path,options)+'\n</head>');
}
const pages: Array<[string,string,string,string,{noindex:boolean}]>=[['focus.html','Explore history · Historica','Explore connected lives, places and events.','/focus.html',{noindex:true}]];
for(const [file,title,desc,path,options]of pages){const name='web/'+file;fs.writeFileSync(name,inject(fs.readFileSync(name,'utf8'),title,desc,path,options));}
const data=buildFocusData(JSON.parse(fs.readFileSync('web/data/collection.json','utf8')),JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json','utf8')));
const urls=['/','/about','/privacy','/coverage.html',...data.entities.map(e=>`/${e.type}/${e.id}`)];
fs.writeFileSync('web/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(path=>`<url><loc>${escape(origin+path)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync('web/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built discovery metadata for ${data.entities.length} histories.`);
