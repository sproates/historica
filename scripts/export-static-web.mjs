import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** Adapt Astro output to the existing preview/Apache paths without another HTML renderer. */
export function exportStaticWeb({source='release/static-incremental',output='web'}={}){
 const sourceRoot=path.resolve(source),outputRoot=path.resolve(output);
 if(sourceRoot===outputRoot||sourceRoot.startsWith(outputRoot+path.sep)||outputRoot.startsWith(sourceRoot+path.sep))throw new Error('Output must be separate from static source');
 const routes=JSON.parse(fs.readFileSync(path.join(outputRoot,'data/routes.json'),'utf8'));
 const pages=[['index.html','index.html','data-static-page="home"'],['about/index.html','about.html','data-static-page="about"'],['coverage/index.html','coverage.html','data-static-page="coverage"'],['privacy/index.html','privacy.html','data-static-page="privacy"']];
 for(const route of routes){
  if(!/^\/(person|area|state|city|period|event)\/[a-z0-9-]+$/.test(route))throw new Error('Unsafe route: '+route);
  const id=route.split('/').at(-1);
  pages.push([route.slice(1)+'/index.html',`pages/${id}.html`,`data-static-history="${id}"`]);
 }
 // Validate every input before replacing any current page.
 const prepared=pages.map(([input,target,marker])=>{
  const html=fs.readFileSync(path.join(sourceRoot,input),'utf8');
  if(!html.includes(marker))throw new Error('Missing static page marker: '+input);
  // This compatibility tree also feeds the production package. Staging packaging
  // adds its own noindex policy; the original Astro cache remains noindex.
  return [target,html.replace(/<meta\s+name="robots"[^>]*>/gi,'<meta name="robots" content="index, follow">')];
 });
 fs.mkdirSync(path.join(outputRoot,'pages'),{recursive:true});
 for(const [target,html] of prepared)fs.writeFileSync(path.join(outputRoot,target),html);
 const current=new Set(prepared.map(([file])=>file));
 for(const file of fs.readdirSync(path.join(outputRoot,'pages')))if(file.endsWith('.html')&&!current.has('pages/'+file))fs.unlinkSync(path.join(outputRoot,'pages',file));
 return {pages:prepared.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Exported Astro pages for local preview and compatibility packaging:',exportStaticWeb());
