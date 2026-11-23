import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function buildPages({source='web', output='release/pages-site', base='/', production=false}={}) {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Base must be / or a directory path ending in /');
  const sourceRoot=path.resolve(source), outputRoot=path.resolve(output);
  if (sourceRoot===outputRoot || sourceRoot.startsWith(outputRoot+path.sep) || outputRoot.startsWith(sourceRoot+path.sep)) throw new Error('Output must be separate from source');
  if (production && base!=='/') throw new Error('Production uses the custom domain root');
  fs.rmSync(outputRoot,{recursive:true,force:true});
  fs.mkdirSync(outputRoot,{recursive:true});
  const routes=JSON.parse(fs.readFileSync(path.join(sourceRoot,'data/routes.json'),'utf8'));
  const transform=html=>{
    html=html.replace(/<base\b[^>]*>/gi,'');
    html=html.replace(/\b(href|src)=(['"])\/(?!\/)(.*?)\2/g,(_,attr,quote,value)=>`${attr}=${quote}${base}${value}${quote}`);
    html=html.replace(/<head>/i,`<head><base href="${base}">`);
    if (!production) {
      html=html.replace(/<meta\s+name="robots"[^>]*>/gi,'');
      html=html.replace('</head>','<meta name="robots" content="noindex, nofollow">\n</head>');
    }
    return html;
  };
  function write(name,contents){const target=path.join(outputRoot,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,contents);}
  function copy(dir=''){
    for(const entry of fs.readdirSync(path.join(sourceRoot,dir),{withFileTypes:true})){
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
    const id=route.split('/').at(-1);
    write(`${route.slice(1)}/index.html`,transform(fs.readFileSync(path.join(sourceRoot,`pages/${id}.html`),'utf8')));
  }
  write('about/index.html',transform(fs.readFileSync(path.join(sourceRoot,'about.html'),'utf8')));
  write('404.html',transform('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · Historica</title><link rel="stylesheet" href="focus.css"></head><body><main><h1>We couldn’t find that page</h1><p>The address may have changed.</p><p><a href="/">Search Historica</a></p></main></body></html>'));
  if(!production)write('robots.txt','User-agent: *\nDisallow: /\n');
  write('.nojekyll','');
  const files=[];
  function inventory(dir='') {for(const e of fs.readdirSync(path.join(outputRoot,dir),{withFileTypes:true})){const name=path.join(dir,e.name);if(e.isDirectory())inventory(name);else files.push({path:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(outputRoot,name))).digest('hex')});}}
  inventory();
  write('release-manifest.json',JSON.stringify({format:1,target:'github-pages',base,production,files},null,2)+'\n');
  return {routes:routes.length,files:files.length,output:outputRoot};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),value=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
  const result=buildPages({base:value('--base','/historica/'),output:value('--output','release/pages-site'),production:args.includes('--production')});
  console.log(`Prepared ${result.routes} history routes and ${result.files} files in ${result.output}. No hosting or DNS changed.`);
}
