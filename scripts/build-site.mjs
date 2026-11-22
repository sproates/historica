import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
// Run after local evidence, coverage and test commands. No network deployment.
const output='docs';
fs.mkdirSync(output,{recursive:true});
const files=[];
function copy(dir=''){
 for(const item of fs.readdirSync(path.join('web',dir),{withFileTypes:true})){
  if(item.name.startsWith('.'))continue;
  const relative=path.join(dir,item.name),source=path.join('web',relative),target=path.join(output,relative);
  if(item.isDirectory()){fs.mkdirSync(target,{recursive:true});copy(relative);}
  else if(/\.(html|css|js|json|svg|png|jpg|webp|ico|txt)$/.test(item.name)){
   fs.copyFileSync(source,target);files.push({path:relative,sha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')});
  }
 }
}
copy();
fs.writeFileSync(path.join(output,'.nojekyll'),'');
fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify({format:1,files},null,2)+'\n');
console.log(`Prepared ${files.length} static assets in docs/. No hosting or DNS settings changed.`);
