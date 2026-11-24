import fs from 'node:fs';
import {createHash} from 'node:crypto';
/** Content-addressed stylesheet URLs prevent old light-only CSS surviving a refresh. */
export function styleUrl(name: string){
 if(!/^[a-z-]+\.css$/.test(name))throw new Error('Invalid stylesheet');
 return name+'?v='+createHash('sha256').update(fs.readFileSync('web/'+name)).digest('hex').slice(0,12);
}

/** The theme control changes independently of page content; do not reuse an older controller. */
export function themeScriptUrl(){
 const file='generated/browser/theme.js';
 return file+'?v='+createHash('sha256').update(fs.readFileSync('web/'+file)).digest('hex').slice(0,12);
}

/** Bundle name hashes its dependencies, so a browser cannot mix releases of the explorer. */
export function explorerScriptUrl(){
 const manifest=JSON.parse(fs.readFileSync('web/generated/explorer/assets.json','utf8')) as {entry:string};
 if(!/^home-[A-Z0-9]+\.js$/i.test(manifest.entry))throw new Error('Invalid explorer bundle');
 return 'generated/explorer/'+manifest.entry;
}
