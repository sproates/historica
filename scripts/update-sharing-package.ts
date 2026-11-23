import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sharingImage} from './change-scope.ts';
import {verifyPages} from './verify-pages.ts';
export function checkSharePng(bytes:Buffer){
 if(bytes.length<45||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes.toString('ascii',12,16)!=='IHDR'||bytes.toString('hex',bytes.length-12)!=='0000000049454e44ae426082'||bytes.readUInt32BE(16)!==1200||bytes.readUInt32BE(20)!==630)throw Error('Sharing image must be a 1200×630 PNG');
}
/** Patch image references in a verified package; app code, page bodies and data stay intact. */
export function updateSharingPackage(output='release/production-site',source='web',metadata='src/presentation/metadata.ts'){
 verifyPages(output);
 const file=path.join(output,'release-manifest.json');
 const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
 const current=fs.readFileSync(metadata,'utf8').match(/image=origin\+'\/([^']+)'/)?.[1];
 const previous=fs.readFileSync(path.join(output,'index.html'),'utf8').match(/property="og:image" content="https:\/\/historica.online\/([^"]+)"/)?.[1];
 if(!current||!previous||!sharingImage(current)||!sharingImage(previous))throw Error('Unrecognised sharing image reference');
 const images=fs.readdirSync(source).filter(sharingImage);
 if(!images.includes(current))throw Error('Sharing image is missing');
 for(const name of images)checkSharePng(fs.readFileSync(path.join(source,name)));
 for(const entry of manifest.files as Array<{path:string;sha256:string}>){
  if(entry.path.endsWith('.html')||entry.path==='generated/presentation/metadata.js'){
   const target=path.join(output,entry.path),before=fs.readFileSync(target,'utf8');
   const after=before.replaceAll(previous,current);
   if(after!==before)fs.writeFileSync(target,after);
  }
  if(sharingImage(entry.path)&&!images.includes(entry.path))fs.unlinkSync(path.join(output,entry.path));
 }
 for(const name of images)fs.copyFileSync(path.join(source,name),path.join(output,name));
 manifest.files=fs.readdirSync(output,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.relative(output,path.join(e.parentPath,e.name))).filter(name=>name!=='release-manifest.json').sort().map(name=>({path:name,sha256:createHash('sha256').update(fs.readFileSync(path.join(output,name))).digest('hex')}));
 fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
 const result=verifyPages(output);
 for(const entry of manifest.files as Array<{path:string}>){
  if(!entry.path.endsWith('.html'))continue;
  const html=fs.readFileSync(path.join(output,entry.path),'utf8');
  if(!html.includes('property="og:image"'))continue;
  for(const field of ['property="og:image"','name="twitter:image"'])if(!html.includes(`${field} content="https://historica.online/${current}"`))throw Error(`Stale sharing metadata: ${entry.path}`);
 }
 console.log(`Sharing artwork updated; ${result.routes} routes and image references verified. No application rebuild or app tests.`);
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))updateSharingPackage();
