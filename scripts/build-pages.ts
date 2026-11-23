import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function buildPages({source='web', output='release/pages-site', base='/', production=false, staticSource, analyticsToken=''}: {source?:string;output?:string;base?:string;production?:boolean;staticSource?:string;analyticsToken?:string}={}) {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Base must be / or a directory path ending in /');
  if(analyticsToken&&!/^[a-f0-9]{32}$/i.test(analyticsToken))throw new Error('Invalid Cloudflare site token');
  const sourceRoot=path.resolve(source), outputRoot=path.resolve(output);
  if (sourceRoot===outputRoot || sourceRoot.startsWith(outputRoot+path.sep) || outputRoot.startsWith(sourceRoot+path.sep)) throw new Error('Output must be separate from source');
  if (production && base!=='/') throw new Error('Production uses the custom domain root');
  const staticRoot=staticSource?path.resolve(staticSource):null;
  if(staticRoot && (staticRoot===outputRoot || staticRoot.startsWith(outputRoot+path.sep) || outputRoot.startsWith(staticRoot+path.sep)))throw new Error('Output must be separate from static source');
  const routes: string[]=JSON.parse(fs.readFileSync(path.join(sourceRoot,'data/routes.json'),'utf8'));
  const historyPages=new Map(routes.map(route=>{
    if(!/^\/(person|area|state|city|period|event)\/[a-z0-9-]+$/.test(route))throw new Error(`Unsafe route: ${route}`);
    const id=route.split('/').at(-1);
    const html=fs.readFileSync(staticRoot?path.join(staticRoot,route,'index.html'):path.join(sourceRoot,`pages/${id}.html`),'utf8');
    if(staticRoot && !html.includes(`data-static-history="${id}"`))throw new Error(`Missing static history: ${route}`);
    return [route,html];
  }));
  const sitePages=staticRoot?new Map([['index.html','home'],['about/index.html','about'],['coverage/index.html','coverage'],['privacy/index.html','privacy']].map(([file,page])=>{
    const html=fs.readFileSync(path.join(staticRoot,file),'utf8');
    if(!html.includes(`data-static-page="${page}"`))throw new Error(`Missing static page: ${page}`);
    return [file,html];
  })):null;
  fs.rmSync(outputRoot,{recursive:true,force:true});
  fs.mkdirSync(outputRoot,{recursive:true});
  const transform=(html: string)=>{
    html=html.replace(/<base\b[^>]*>/gi,'');
    html=html.replace(/\b(href|src)=(['"])\/(?!\/)(.*?)\2/g,(_,attr,quote,value)=>`${attr}=${quote}${base}${value}${quote}`);
    html=html.replace(/<head>/i,`<head><base href="${base}">`);
    if (production && staticRoot)html=html.replace(/<meta\s+name="robots"[^>]*>/gi,'<meta name="robots" content="index, follow">');
    if (!production) {
      html=html.replace(/<meta\s+name="robots"[^>]*>/gi,'');
      html=html.replace('</head>','<meta name="robots" content="noindex, nofollow">\n</head>');
    }
    if(production&&analyticsToken)html=html.replace('</head>',`<meta name="historica-analytics" content="${analyticsToken}"><script type="module" src="generated/browser/analytics.js"></script></head>`);
    return html;
  };
  function write(name: string,contents: string|Buffer){const target=path.join(outputRoot,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,contents);}
  function copy(dir=''){
    for(const entry of fs.readdirSync(path.join(sourceRoot,dir),{withFileTypes:true})){
      if(staticRoot && dir==='' && entry.name==='pages')continue;
      if(entry.name.startsWith('.')||entry.name==='release-manifest.json'||entry.name==='CNAME')continue;
      const name=path.join(dir,entry.name);
      if(entry.isDirectory())copy(name);
      else if(/\.(html|css|js|json|svg|png|jpg|webp|ico|txt|xml)$/.test(name)){
        const content=fs.readFileSync(path.join(sourceRoot,name));
        write(name,name.endsWith('.html')?transform(content.toString()):content);
      }
    }
  }
  copy();
  for(const route of routes){
    if(!/^\/(person|area|state|city|period|event)\/[a-z0-9-]+$/.test(route))throw new Error(`Unsafe route: ${route}`);
    write(`${route.slice(1)}/index.html`,transform(historyPages.get(route)!));
  }
  write('about/index.html',transform(sitePages?.get('about/index.html')??fs.readFileSync(path.join(sourceRoot,'about.html'),'utf8')));
  write('privacy/index.html',transform(sitePages?.get('privacy/index.html')??fs.readFileSync(path.join(sourceRoot,'privacy.html'),'utf8')));
  if(sitePages){
    write('index.html',transform(sitePages.get('index.html')!));
    write('privacy.html',transform(sitePages.get('privacy/index.html')!));
    write('coverage.html',transform(sitePages.get('coverage/index.html')!));
    write('about.html',transform(sitePages.get('about/index.html')!));
  }
  write('404.html',transform('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · Historica</title><link rel="stylesheet" href="focus.css"><link rel="stylesheet" href="appearance.css"></head><body><main><h1>We couldn’t find that page</h1><p>The address may have changed.</p><p><a href="/">Search Historica</a></p><footer><p><a href="/coverage.html">Sources and research coverage</a> · <a href="/privacy">Privacy</a></p><p>Historica is an open source site on <a href="https://github.com/sproates/historica">GitHub</a>.</p></footer></main></body></html>'));
  if(!production)write('robots.txt','User-agent: *\nDisallow: /\n');
  write('.nojekyll','');
  const files: Array<{path:string;sha256:string}>=[];
  function inventory(dir='') {for(const e of fs.readdirSync(path.join(outputRoot,dir),{withFileTypes:true})){const name=path.join(dir,e.name);if(e.isDirectory())inventory(name);else files.push({path:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(outputRoot,name))).digest('hex')});}}
  inventory();
  write('release-manifest.json',JSON.stringify({format:1,target:'github-pages',base,production,renderer:staticRoot?'astro':'legacy',analytics:Boolean(production&&analyticsToken),files},null,2)+'\n');
  return {routes:routes.length,files:files.length,output:outputRoot};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),value=(key: string,fallback: string)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
  const result=buildPages({base:value('--base',args.includes('--production')?'/':'/historica/'),output:value('--output','release/pages-site'),production:args.includes('--production'),staticSource:value('--static-source','release/static-incremental'),analyticsToken:process.env.HISTORICA_ANALYTICS_TOKEN||''});
  console.log(`Prepared ${result.routes} history routes and ${result.files} files in ${result.output}. No hosting or DNS changed.`);
}
