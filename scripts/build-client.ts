import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

// Recreate this owned output directory so renamed/deleted sources leave no stale modules.
fs.rmSync('web/generated',{recursive:true,force:true});
const result=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.json'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);

// The map dependency is packaged locally; no third-party script CDN is involved.
const {build}=await import('esbuild');
const bundled=await build({entryPoints:{home:'src/explorer/app.ts'},bundle:true,format:'esm',target:'es2022',outdir:'web/generated/explorer',entryNames:'[name]-[hash]',minify:true,metafile:true,legalComments:'external'});
const entry=Object.keys(bundled.metafile.outputs).find(file=>file.endsWith('.js'))!.split('/').at(-1)!;
fs.writeFileSync('web/generated/explorer/assets.json',JSON.stringify({entry})+'\n');
fs.copyFileSync('node_modules/leaflet/dist/leaflet.css','web/generated/explorer/leaflet.css');
fs.copyFileSync('node_modules/leaflet/LICENSE','web/generated/explorer/leaflet-license.txt');

fs.cpSync('node_modules/leaflet/dist/images','web/generated/explorer/images',{recursive:true});
