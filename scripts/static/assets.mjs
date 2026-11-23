import fs from 'node:fs';
import {createHash} from 'node:crypto';
/** Content-addressed stylesheet URLs prevent old light-only CSS surviving a refresh. */
export function styleUrl(name){
 if(!/^[a-z-]+\.css$/.test(name))throw new Error('Invalid stylesheet');
 return name+'?v='+createHash('sha256').update(fs.readFileSync('web/'+name)).digest('hex').slice(0,12);
}

/** The theme control changes independently of page content; do not reuse an older controller. */
export function themeScriptUrl(){
 const file='generated/browser/theme.js';
 return file+'?v='+createHash('sha256').update(fs.readFileSync('web/'+file)).digest('hex').slice(0,12);
}
